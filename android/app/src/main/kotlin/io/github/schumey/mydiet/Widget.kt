package io.github.schumey.mydiet

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import java.text.NumberFormat
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import kotlin.math.roundToInt

/**
 * Home screen widget: today's calories against the goal, plus buttons for the barcode scanner and a new entry.
 * It has no connection of its own: the numbers come from the diary page whenever it shows today (see [NativeBridge.summary]),
 * so after midnight it says "open the app" until the diary was opened again.
 */
class Widget : AppWidgetProvider() {
    override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
        ids.forEach { manager.updateAppWidget(it, views(context)) }
    }

    companion object {
        private const val PREFS = "widget"

        fun save(context: Context, day: String, kcal: Double, goal: Double) {
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
                .putString("day", day)
                .putInt("kcal", kcal.roundToInt())
                .putInt("goal", goal.roundToInt())
                .putString("time", LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")))
                .apply()
            refresh(context)
        }

        fun refresh(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val ids = manager.getAppWidgetIds(ComponentName(context, Widget::class.java))
            if (ids.isNotEmpty()) ids.forEach { manager.updateAppWidget(it, views(context)) }
        }

        private fun views(context: Context): RemoteViews {
            val p = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            val v = RemoteViews(context.packageName, R.layout.widget)
            val fmt = NumberFormat.getIntegerInstance()
            if (p.getString("day", "") == LocalDate.now().toString()) {
                val kcal = p.getInt("kcal", 0)
                val goal = p.getInt("goal", 0)
                v.setTextViewText(R.id.widget_kcal, if (goal > 0) context.getString(R.string.widget_kcal_goal, fmt.format(kcal), fmt.format(goal))
                                                    else context.getString(R.string.widget_kcal, fmt.format(kcal)))
                val left = goal - kcal
                v.setTextViewText(R.id.widget_left, when {
                    goal <= 0 -> ""
                    left >= 0 -> context.getString(R.string.widget_left, fmt.format(left))
                    else -> context.getString(R.string.widget_over, fmt.format(-left))
                })
                v.setTextViewText(R.id.widget_time, context.getString(R.string.widget_as_of, p.getString("time", "")))
            } else {
                v.setTextViewText(R.id.widget_kcal, context.getString(R.string.widget_no_data))
                v.setTextViewText(R.id.widget_left, "")
                v.setTextViewText(R.id.widget_time, "")
            }
            v.setOnClickPendingIntent(R.id.widget_root, open(context, "", 0))
            v.setOnClickPendingIntent(R.id.widget_scan, open(context, "scan", 1))
            v.setOnClickPendingIntent(R.id.widget_add, open(context, "add", 2))
            return v
        }

        private fun open(context: Context, action: String, code: Int): PendingIntent {
            val intent = Intent(context, MainActivity::class.java)
                .setAction(Intent.ACTION_MAIN)
                .putExtra(MainActivity.EXTRA_ACTION, action)
                .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            return PendingIntent.getActivity(context, code, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        }
    }
}
