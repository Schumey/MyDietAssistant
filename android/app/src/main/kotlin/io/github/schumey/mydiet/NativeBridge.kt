package io.github.schumey.mydiet

import android.app.Activity
import android.print.PrintAttributes
import android.print.PrintManager
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
class NativeBridge(private val activity: Activity, private val web: WebView, private val health: Health) {
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

    /** Health Connect: "ok", "update" or "unavailable". */
    @JavascriptInterface
    fun healthStatus(): String = try { health.status() } catch (_: Exception) { "unavailable" }

    /** Reads the last [days] days; answers through `window.mdaHealthResult(json, error)`. [ask]: may show the permission dialog. */
    @JavascriptInterface
    fun healthRead(days: Int, ask: Boolean) {
        activity.runOnUiThread {
            health.read(days.coerceIn(1, 400), ask) { json, error ->
                activity.runOnUiThread {
                    web.evaluateJavascript("window.mdaHealthResult && window.mdaHealthResult(${JSONObject.quote(json)}, ${JSONObject.quote(error)})", null)
                }
            }
        }
    }

    /** `window.print()` does nothing in a WebView: the page's print button lands here (Android print dialog, also "Save as PDF"). */
    @JavascriptInterface
    fun print(title: String) {
        activity.runOnUiThread {
            val name = title.ifBlank { "MyDietAssistant" }
            val pm = activity.getSystemService(Activity.PRINT_SERVICE) as PrintManager
            pm.print(name, web.createPrintDocumentAdapter(name), PrintAttributes.Builder().build())
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

        /** Run on every page of the add-on: routes window.print() to [print]. */
        const val PRINT_HOOK = "if (window.$NAME && !window.__mdaPrint) { window.__mdaPrint = true; " +
            "window.print = function () { $NAME.print(document.title || ''); }; }"
    }
}
