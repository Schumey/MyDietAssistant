package de.schumey.hafs_live

import android.content.Context
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel

/**
 * Method channel of the workout notification. The plugin is registered in every Flutter engine of the app, also in the
 * background engine that runs the Dart callback for the notification buttons, so the app can update the notification
 * from there.
 */
class HafsLivePlugin : FlutterPlugin, MethodChannel.MethodCallHandler {
    private lateinit var context: Context
    private lateinit var channel: MethodChannel

    override fun onAttachedToEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        context = binding.applicationContext
        channel = MethodChannel(binding.binaryMessenger, "de.schumey.hafs/live")
        channel.setMethodCallHandler(this)
    }

    override fun onDetachedFromEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        channel.setMethodCallHandler(null)
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
                "cancel" -> {
                    LiveNotification.cancel(context)
                    result.success(null)
                }
                else -> result.notImplemented()
            }
        } catch (e: Exception) {
            result.error("live", e.message, null)
        }
    }
}
