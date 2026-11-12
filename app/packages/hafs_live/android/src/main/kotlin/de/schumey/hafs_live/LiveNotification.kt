package de.schumey.hafs_live

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import android.view.View
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import org.json.JSONObject

/**
 * The permanent workout notification, built with a custom layout (flutter_local_notifications cannot do that).
 * Its buttons are broadcasts to that plugin's ActionBroadcastReceiver, which hands them to the Dart background
 * callback as `NotificationResponse.actionId`.
 */
object LiveNotification {
    const val NOTIFICATION_ID = 7003
    const val CHANNEL = "workout_live"
    private const val RECEIVER = "com.dexterous.flutterlocalnotifications.ActionBroadcastReceiver"
    private const val ACTION_TAPPED = "com.dexterous.flutterlocalnotifications.ActionBroadcastReceiver.ACTION_TAPPED"
    private const val PREFS = "hafs_live"
    private const val LAST = "last"

    private fun str(a: Map<String, Any?>, key: String) = (a[key] as? String) ?: ""

    private fun button(context: Context, actionId: String): PendingIntent {
        val intent = Intent()
            .setClassName(context, RECEIVER)
            .setAction(ACTION_TAPPED)
            .putExtra("notificationId", NOTIFICATION_ID)
            .putExtra("actionId", actionId)
            .putExtra("cancelNotification", false)
        return PendingIntent.getBroadcast(
            context, actionId.hashCode(), intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun open(context: Context): PendingIntent? {
        val launch = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: return null
        launch.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        return PendingIntent.getActivity(context, 0, launch, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    private fun restEndIntent(context: Context): PendingIntent =
        PendingIntent.getBroadcast(
            context, 1, Intent(context, RestEndReceiver::class.java), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

    fun show(context: Context, a: Map<String, Any?>) {
        // Remember what is shown: when the rest is over the same notification is posted again without the countdown.
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(LAST, JSONObject(a).toString()).apply()

        val manager = context.getSystemService(NotificationManager::class.java)
        if (manager.getNotificationChannel(CHANNEL) == null) {
            val ch = NotificationChannel(CHANNEL, str(a, "channelName").ifEmpty { "Workout" }, NotificationManager.IMPORTANCE_LOW)
            ch.setShowBadge(false)
            manager.createNotificationChannel(ch)
        }

        val title = str(a, "title")
        val weightText = str(a, "weightText")
        val repsText = str(a, "repsText")
        val doneText = str(a, "doneText")
        val doneAction = str(a, "doneAction").ifEmpty { "live_done" }
        val restEnd = (a["restEndMs"] as? Number)?.toLong() ?: 0L
        val remaining = restEnd - System.currentTimeMillis()
        val resting = remaining > 0
        val line = if (repsText.isEmpty()) weightText else "$weightText · $repsText"

        val big = RemoteViews(context.packageName, R.layout.hafs_live_expanded)
        big.setTextViewText(R.id.hafs_title, title)
        val subtitle = str(a, "subtitle")
        big.setTextViewText(R.id.hafs_subtitle, subtitle)
        big.setViewVisibility(R.id.hafs_subtitle, if (subtitle.isEmpty()) View.GONE else View.VISIBLE)
        big.setTextViewText(R.id.hafs_weight, weightText)
        big.setOnClickPendingIntent(R.id.hafs_weight_minus, button(context, str(a, "weightMinus")))
        big.setOnClickPendingIntent(R.id.hafs_weight_plus, button(context, str(a, "weightPlus")))
        if (repsText.isEmpty()) {
            big.setViewVisibility(R.id.hafs_reps_group, View.GONE)
        } else {
            big.setViewVisibility(R.id.hafs_reps_group, View.VISIBLE)
            big.setTextViewText(R.id.hafs_reps, repsText)
            big.setOnClickPendingIntent(R.id.hafs_reps_minus, button(context, str(a, "repsMinus")))
            big.setOnClickPendingIntent(R.id.hafs_reps_plus, button(context, str(a, "repsPlus")))
        }
        big.setTextViewText(R.id.hafs_done, doneText)
        big.setOnClickPendingIntent(R.id.hafs_done, button(context, doneAction))
        val alarms = context.getSystemService(AlarmManager::class.java)
        if (resting) {
            val format = str(a, "restFormat").ifEmpty { "%s" }
            big.setViewVisibility(R.id.hafs_rest, View.VISIBLE)
            big.setChronometerCountDown(R.id.hafs_rest, true)
            big.setChronometer(R.id.hafs_rest, SystemClock.elapsedRealtime() + remaining, format, true)
            big.setOnClickPendingIntent(R.id.hafs_rest, button(context, str(a, "restAddAction")))
            try {
                alarms.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, restEnd + 300, restEndIntent(context))
            } catch (e: SecurityException) {
                // no exact alarm allowed: the countdown then just stays until the next update
            }
        } else {
            big.setViewVisibility(R.id.hafs_rest, View.GONE)
            big.setChronometer(R.id.hafs_rest, SystemClock.elapsedRealtime(), null, false)
            alarms.cancel(restEndIntent(context))
        }

        val small = RemoteViews(context.packageName, R.layout.hafs_live_collapsed)
        small.setTextViewText(R.id.hafs_c_title, title)
        small.setTextViewText(R.id.hafs_c_line, line)
        small.setTextViewText(R.id.hafs_c_done, doneText)
        small.setOnClickPendingIntent(R.id.hafs_c_done, button(context, doneAction))

        val builder = NotificationCompat.Builder(context, CHANNEL)
            .setSmallIcon(context.applicationInfo.icon)
            .setStyle(NotificationCompat.DecoratedCustomViewStyle())
            .setCustomContentView(small)
            .setCustomBigContentView(big)
            .setContentTitle(title)
            .setContentText(line)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setShowWhen(false)
            .setCategory(NotificationCompat.CATEGORY_STATUS)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_LOW)
        open(context)?.let { builder.setContentIntent(it) }
        manager.notify(NOTIFICATION_ID, builder.build())
    }

    fun cancel(context: Context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().remove(LAST).apply()
        context.getSystemService(AlarmManager::class.java).cancel(restEndIntent(context))
        context.getSystemService(NotificationManager::class.java).cancel(NOTIFICATION_ID)
    }

    /** The rest is over: show the same notification again, without the countdown (only if it is still there). */
    fun restOver(context: Context) {
        val text = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(LAST, null) ?: return
        val map = HashMap<String, Any?>()
        val json = JSONObject(text)
        for (key in json.keys()) map[key] = json.get(key)
        map["restEndMs"] = 0L
        show(context, map)
    }
}
