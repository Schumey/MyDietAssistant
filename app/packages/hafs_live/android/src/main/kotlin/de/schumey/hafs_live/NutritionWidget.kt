package de.schumey.hafs_live

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

/**
 * Home screen widget "Nutrition today": calories left, eaten of the goal, and two buttons (scan a barcode, add food).
 * The diary page in the app hands the totals over (`MDAApp.summary`); the app writes the texts with [update].
 * Tapping opens the nutrition area; the buttons open it with the action `scan` or `add`.
 */
class NutritionWidget : AppWidgetProvider() {
    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        for (id in ids) manager.updateAppWidget(id, views(context))
    }

    companion object {
        private const val PREFS = "hafs_nutrition_widget"

        /** Stores the texts and redraws all widgets. Keys: `kicker`, `title`, `lines`. */
        fun update(context: Context, args: Map<String, Any?>) {
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
                .putString("kicker", args["kicker"] as? String ?: "")
                .putString("title", args["title"] as? String ?: "")
                .putString("lines", args["lines"] as? String ?: "")
                .apply()
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, NutritionWidget::class.java))
            if (ids.isNotEmpty()) for (id in ids) manager.updateAppWidget(id, views(context))
        }

        private fun open(context: Context, action: String, code: Int): PendingIntent? {
            val launch = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: return null
            launch.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            launch.putExtra(HafsLivePlugin.EXTRA_ACTION, action)
            return PendingIntent.getActivity(context, code, launch, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        }

        private fun views(context: Context): RemoteViews {
            val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            val v = RemoteViews(context.packageName, R.layout.hafs_nutrition_widget)
            v.setTextViewText(R.id.hafs_food_kicker, prefs.getString("kicker", ""))
            v.setTextViewText(R.id.hafs_food_title, prefs.getString("title", "HAFS"))
            v.setTextViewText(R.id.hafs_food_lines, prefs.getString("lines", ""))
            open(context, "nutrition", 101)?.let { v.setOnClickPendingIntent(R.id.hafs_food_root, it) }
            open(context, "scan", 102)?.let { v.setOnClickPendingIntent(R.id.hafs_food_scan, it) }
            open(context, "add", 103)?.let { v.setOnClickPendingIntent(R.id.hafs_food_add, it) }
            return v
        }
    }
}
