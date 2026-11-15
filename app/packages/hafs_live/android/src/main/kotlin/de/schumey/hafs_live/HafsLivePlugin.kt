package de.schumey.hafs_live

import android.app.Activity
import android.content.Context
import android.content.Intent
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.codescanner.GmsBarcodeScannerOptions
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.embedding.engine.plugins.activity.ActivityAware
import io.flutter.embedding.engine.plugins.activity.ActivityPluginBinding
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.PluginRegistry

/**
 * Method channel of the workout notification, the two home screen widgets and the code scanner. The plugin is
 * registered in every Flutter engine of the app, also in the background engine that runs the Dart callback for the
 * notification buttons, so the app can update the notification from there.
 */
class HafsLivePlugin : FlutterPlugin, MethodChannel.MethodCallHandler, ActivityAware, PluginRegistry.NewIntentListener {
    private lateinit var context: Context
    private lateinit var channel: MethodChannel
    private var activity: Activity? = null

    override fun onAttachedToEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        context = binding.applicationContext
        channel = MethodChannel(binding.binaryMessenger, "de.schumey.hafs/live")
        channel.setMethodCallHandler(this)
    }

    override fun onDetachedFromEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        channel.setMethodCallHandler(null)
    }

    // ---- activity: the widget buttons start it with an action ------------------------------------------------------

    override fun onAttachedToActivity(binding: ActivityPluginBinding) {
        activity = binding.activity
        binding.addOnNewIntentListener(this)
        remember(binding.activity.intent)
    }

    override fun onDetachedFromActivityForConfigChanges() { activity = null }

    override fun onReattachedToActivityForConfigChanges(binding: ActivityPluginBinding) = onAttachedToActivity(binding)

    override fun onDetachedFromActivity() { activity = null }

    override fun onNewIntent(intent: Intent): Boolean {
        remember(intent)
        return false
    }

    private fun remember(intent: Intent?) {
        val action = intent?.getStringExtra(EXTRA_ACTION) ?: return
        pendingAction = action
        intent.removeExtra(EXTRA_ACTION)
    }

    override fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
        try {
            when (call.method) {
                "show" -> {
                    @Suppress("UNCHECKED_CAST")
                    LiveNotification.show(context, call.arguments as Map<String, Any?>)
                    result.success(null)
                }
                "widget" -> {
                    @Suppress("UNCHECKED_CAST")
                    HafsWidget.update(context, call.arguments as Map<String, Any?>)
                    result.success(null)
                }
                "nutritionWidget" -> {
                    @Suppress("UNCHECKED_CAST")
                    NutritionWidget.update(context, call.arguments as Map<String, Any?>)
                    result.success(null)
                }
                "cancel" -> {
                    LiveNotification.cancel(context)
                    result.success(null)
                }
                "takeAction" -> {
                    val a = pendingAction
                    pendingAction = ""
                    result.success(a)
                }
                "scanBarcode" -> scan(result)
                else -> result.notImplemented()
            }
        } catch (e: Exception) {
            result.error("live", e.message, null)
        }
    }

    /** Google's code scanner from Play services: no camera permission, runs outside the app. */
    private fun scan(result: MethodChannel.Result) {
        val answer = { code: String, error: String -> result.success(mapOf("code" to code, "error" to error)) }
        val options = GmsBarcodeScannerOptions.Builder()
            .setBarcodeFormats(Barcode.FORMAT_EAN_13, Barcode.FORMAT_EAN_8, Barcode.FORMAT_UPC_A, Barcode.FORMAT_UPC_E)
            .enableAutoZoom()
            .build()
        try {
            val client = activity?.let { GmsBarcodeScanning.getClient(it, options) } ?: GmsBarcodeScanning.getClient(context, options)
            client.startScan()
                .addOnSuccessListener { answer(it.rawValue ?: "", "") }
                .addOnCanceledListener { answer("", "cancel") }
                .addOnFailureListener { answer("", "unavailable") }
        } catch (_: Exception) {
            answer("", "unavailable")
        }
    }

    companion object {
        /** Intent extra of the widget buttons: `nutrition`, `scan` or `add`. */
        const val EXTRA_ACTION = "hafs_action"

        @Volatile var pendingAction: String = ""
    }
}
