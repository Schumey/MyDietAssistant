package io.github.schumey.mydiet

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.DownloadManager
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.URLUtil
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast

/**
 * Shell around the MyDietAssistant web interface.
 *
 * 1. Loads the Home Assistant frontend (the user logs in there as usual; the app never sees the password).
 * 2. Asks the Supervisor for an ingress session (see [Ingress]) and opens the add-on full screen.
 * 3. If that is not possible (no administrator rights, ...) it falls back to the add-on panel inside the HA frontend.
 */
class MainActivity : Activity() {
    private lateinit var prefs: Prefs
    private lateinit var web: WebView
    private lateinit var errorBox: View
    private lateinit var native: NativeBridge
    private val handler = Handler(Looper.getMainLooper())

    private var inIngress = false
    private var fallbackTried = false
    private var fileCallback: ValueCallback<Array<Uri>>? = null
    private var pendingPermission: PermissionRequest? = null

    private val refreshSession = object : Runnable {
        override fun run() {
            if (inIngress) web.evaluateJavascript(Ingress.script(prefs.slug), null)
            handler.postDelayed(this, SESSION_REFRESH_MS)   // ingress sessions last about an hour
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        prefs = Prefs(this)
        if (!prefs.configured) {
            startActivity(Intent(this, SetupActivity::class.java))
            finish()
            return
        }

        web = WebView(this)
        errorBox = buildErrorBox()
        setContentView(FrameLayout(this).apply {
            addView(web, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
            addView(errorBox, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        })
        errorBox.visibility = View.GONE

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        }
        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false)
        web.addJavascriptInterface(Bridge(), Ingress.BRIDGE)
        native = NativeBridge(this, web)
        native.pending = intent.getStringExtra(EXTRA_ACTION) ?: ""
        web.addJavascriptInterface(native, NativeBridge.NAME)
        web.webViewClient = Client()
        web.webChromeClient = Chrome()
        web.setDownloadListener { url, userAgent, disposition, mime, _ -> download(url, userAgent, disposition, mime) }

        if (savedInstanceState != null) web.restoreState(savedInstanceState) else web.loadUrl(prefs.baseUrl + "/")
    }

    /** Widget buttons while the app is already open (launchMode singleTask). */
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        val action = intent.getStringExtra(EXTRA_ACTION) ?: ""
        if (::native.isInitialized && action.isNotEmpty()) {
            if (inIngress) native.runAction(action) else native.pending = action
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        if (::web.isInitialized) web.saveState(outState)
    }

    override fun onResume() {
        super.onResume()
        if (::web.isInitialized) {
            web.onResume()
            handler.removeCallbacks(refreshSession)
            handler.postDelayed(refreshSession, if (inIngress) 0 else SESSION_REFRESH_MS)   // renew right away after being in the background
        }
    }

    override fun onPause() {
        if (::web.isInitialized) {
            web.onPause()
            handler.removeCallbacks(refreshSession)
        }
        super.onPause()
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        if (::web.isInitialized) web.destroy()
        super.onDestroy()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (::web.isInitialized && web.canGoBack()) web.goBack() else @Suppress("DEPRECATION") super.onBackPressed()
    }

    // --- page handling --------------------------------------------------------------------------

    private inner class Client : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            val target = request.url
            val base = Uri.parse(prefs.baseUrl)
            if (target.host == base.host && target.port == base.port) return false
            try {   // other sites (food databases, recipe links) open in the browser, not in this shell
                startActivity(Intent(Intent.ACTION_VIEW, target))
            } catch (_: Exception) {
            }
            return true
        }

        override fun onPageStarted(view: WebView, url: String, favicon: Bitmap?) {
            errorBox.visibility = View.GONE
        }

        override fun onPageFinished(view: WebView, url: String) {
            val path = Uri.parse(url).path ?: ""
            when {
                path.startsWith(Ingress.PATH_PREFIX) -> inIngress = true
                path.startsWith("/auth") -> inIngress = false   // HA login screen: nothing to do until it is done
                else -> {
                    inIngress = false
                    view.evaluateJavascript(Ingress.script(prefs.slug), null)
                }
            }
        }

        override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
            if (request.isForMainFrame) errorBox.visibility = View.VISIBLE
        }
    }

    /** Called from the JavaScript in [Ingress]: the add-on's ingress URL, or "" when it could not be set up. */
    private inner class Bridge {
        @JavascriptInterface
        fun ingress(url: String) {
            handler.post {
                when {
                    inIngress -> Unit   // a periodic renewal: the cookie is already refreshed, stay on the page
                    url.startsWith(Ingress.PATH_PREFIX) -> web.loadUrl(prefs.baseUrl + url)
                    !fallbackTried -> {   // no admin rights or no login yet: use the add-on panel in the HA frontend
                        fallbackTried = true
                        web.loadUrl(prefs.baseUrl + "/hassio/ingress/" + prefs.slug)
                    }
                }
            }
        }
    }

    // --- camera, file upload, downloads ---------------------------------------------------------

    private inner class Chrome : WebChromeClient() {
        override fun onPermissionRequest(request: PermissionRequest) {
            runOnUiThread {
                val sameHost = request.origin.host == Uri.parse(prefs.baseUrl).host
                val wantsCamera = request.resources.contains(PermissionRequest.RESOURCE_VIDEO_CAPTURE)
                when {
                    !sameHost || !wantsCamera -> request.deny()
                    checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED ->
                        request.grant(arrayOf(PermissionRequest.RESOURCE_VIDEO_CAPTURE))
                    else -> {
                        pendingPermission = request
                        requestPermissions(arrayOf(Manifest.permission.CAMERA), REQ_CAMERA)
                    }
                }
            }
        }

        override fun onShowFileChooser(view: WebView, callback: ValueCallback<Array<Uri>>, params: FileChooserParams): Boolean {
            fileCallback?.onReceiveValue(null)
            fileCallback = callback
            return try {
                @Suppress("DEPRECATION")
                startActivityForResult(params.createIntent(), REQ_FILE)
                true
            } catch (_: Exception) {
                fileCallback = null
                false
            }
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == REQ_FILE) {
            fileCallback?.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data))
            fileCallback = null
        } else {
            @Suppress("DEPRECATION")
            super.onActivityResult(requestCode, resultCode, data)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        if (requestCode == REQ_CAMERA) {
            val request = pendingPermission
            pendingPermission = null
            if (grantResults.firstOrNull() == PackageManager.PERMISSION_GRANTED) request?.grant(arrayOf(PermissionRequest.RESOURCE_VIDEO_CAPTURE))
            else request?.deny()
        } else {
            super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        }
    }

    private fun download(url: String, userAgent: String?, disposition: String?, mime: String?) {
        if (!url.startsWith("http")) {   // blob:/data: URLs cannot be fetched by the download manager
            Toast.makeText(this, "Download: " + url.take(30), Toast.LENGTH_SHORT).show()
            return
        }
        val req = DownloadManager.Request(Uri.parse(url))
            .setMimeType(mime)
            .addRequestHeader("Cookie", CookieManager.getInstance().getCookie(url) ?: "")
            .addRequestHeader("User-Agent", userAgent ?: "")
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, URLUtil.guessFileName(url, disposition, mime))
        (getSystemService(DOWNLOAD_SERVICE) as DownloadManager).enqueue(req)
        Toast.makeText(this, R.string.download_started, Toast.LENGTH_SHORT).show()
    }

    // --- offline / error screen -----------------------------------------------------------------

    private fun buildErrorBox(): View {
        val pad = (24 * resources.displayMetrics.density).toInt()
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(0xFFFFFFFF.toInt())
            setPadding(pad, pad, pad, pad)
            addView(TextView(context).apply { setText(R.string.error_title); textSize = 22f; gravity = Gravity.CENTER })
            addView(TextView(context).apply { setText(R.string.error_text); setPadding(0, pad / 2, 0, pad / 2); gravity = Gravity.CENTER })
            addView(Button(context).apply {
                setText(R.string.retry)
                setOnClickListener { errorBox.visibility = View.GONE; fallbackTried = false; web.loadUrl(prefs.baseUrl + "/") }
            })
            addView(Button(context).apply {
                setText(R.string.change_server)
                setOnClickListener { startActivity(Intent(context, SetupActivity::class.java)); finish() }
            })
        }
    }

    companion object {
        const val EXTRA_ACTION = "mda_action"
        private const val REQ_FILE = 1
        private const val REQ_CAMERA = 2
        private const val SESSION_REFRESH_MS = 40L * 60 * 1000
    }
}
