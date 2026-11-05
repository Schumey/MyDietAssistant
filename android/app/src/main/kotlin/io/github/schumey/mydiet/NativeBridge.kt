package io.github.schumey.mydiet

import android.app.Activity
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.codescanner.GmsBarcodeScannerOptions
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning
import org.json.JSONObject

/**
 * Native parts for the web interface, reachable from JavaScript as `window.MDAApp`.
 *
 * - `scanBarcode()`: opens the Google code scanner (no camera permission needed, runs in Play services) and answers
 *   through `window.mdaScanResult(code, error)`; error "cancel" when the user closed it, "unavailable" when
 *   Play services cannot provide the scanner (the web page then uses its own camera scanner).
 * - `summary(json)`: the diary of today hands over its totals; the home screen widget shows them.
 * - `pendingAction()`: "scan" or "add" once, when the app was opened from a widget button.
 */
class NativeBridge(private val activity: Activity, private val web: WebView) {
    @Volatile var pending: String = ""

    @JavascriptInterface
    fun version(): String = BuildConfig.VERSION_NAME

    @JavascriptInterface
    fun scanBarcode() {
        activity.runOnUiThread {
            val options = GmsBarcodeScannerOptions.Builder()
                .setBarcodeFormats(Barcode.FORMAT_EAN_13, Barcode.FORMAT_EAN_8, Barcode.FORMAT_UPC_A, Barcode.FORMAT_UPC_E)
                .enableAutoZoom()
                .build()
            try {
                GmsBarcodeScanning.getClient(activity, options).startScan()
                    .addOnSuccessListener { answer(it.rawValue ?: "", "") }
                    .addOnCanceledListener { answer("", "cancel") }
                    .addOnFailureListener { answer("", "unavailable") }
            } catch (_: Exception) {
                answer("", "unavailable")
            }
        }
    }

    @JavascriptInterface
    fun summary(json: String) {
        try {
            val o = JSONObject(json)
            Widget.save(activity, o.optString("day"), o.optDouble("kcal", 0.0), o.optDouble("goal", 0.0))
        } catch (_: Exception) {
        }
    }

    @JavascriptInterface
    fun pendingAction(): String {
        val a = pending
        pending = ""
        return a
    }

    private fun answer(code: String, error: String) {
        web.evaluateJavascript("window.mdaScanResult && window.mdaScanResult(${JSONObject.quote(code)}, ${JSONObject.quote(error)})", null)
    }

    /** Runs a widget action in an already loaded page (the app was in the background). */
    fun runAction(action: String) {
        web.evaluateJavascript(
            "window.mdaAction ? (window.mdaAction(${JSONObject.quote(action)}), 1) : 0"
        ) { handled -> if (handled != "1") pending = action }   // page still loading: it asks for it on start
    }

    companion object {
        const val NAME = "MDAApp"
    }
}
