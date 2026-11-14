package de.schumey.hafs_live

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

/**
 * Home screen widget "today's training". The app writes the texts (translated there) with [update]; the widget only shows
 * them, so it also works when the app is not running. Tapping it opens the app.
 */
class HafsWidget : AppWidgetProvider() {
    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        for (id in ids) manager.updateAppWidget(id, views(context))
    }

    companion object {
        private const val PREFS = "hafs_widget"

        /** Stores the texts and redraws all widgets. Keys: `kicker`, `title`, `lines` (one text, lines separated by \n). */
        fun update(context: Context, args: Map<String, Any?>) {
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
                .putString("kicker", args["kicker"] as? String ?: "")
                .putString("title", args["title"] as? String ?: "")
                .putString("lines", args["lines"] as? String ?: "")
                .apply()
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, HafsWidget::class.java))
            if (ids.isNotEmpty()) for (id in ids) manager.updateAppWidget(id, views(context))
        }

        private fun views(context: Context): RemoteViews {
            val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            val v = RemoteViews(context.packageName, R.layout.hafs_widget)
            v.setTextViewText(R.id.hafs_widget_kicker, prefs.getString("kicker", ""))
            v.setTextViewText(R.id.hafs_widget_title, prefs.getString("title", "HAFS"))
            v.setTextViewText(R.id.hafs_widget_lines, prefs.getString("lines", ""))
            val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
            if (launch != null) {
                launch.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED
                val pending = PendingIntent.getActivity(context, 0, launch, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
                v.setOnClickPendingIntent(R.id.hafs_widget_root, pending)
            }
            return v
        }
    }
}
