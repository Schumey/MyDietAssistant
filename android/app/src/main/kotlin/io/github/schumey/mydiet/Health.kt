package io.github.schumey.mydiet

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.WeightRecord
import androidx.health.connect.client.request.AggregateGroupByPeriodRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant
import java.time.LocalDate
import java.time.Period
import java.time.ZoneId

/**
 * Reads weight, steps and active calories from Health Connect for the web interface (see [NativeBridge.healthRead]).
 * Only reading: the app never writes into Health Connect.
 */
class Health(private val activity: Activity, private val scope: CoroutineScope) {
    private val permissions = setOf(
        HealthPermission.getReadPermission(WeightRecord::class),
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class),
    )
    private val contract = PermissionController.createRequestPermissionResultContract()
    private var waiting: ((Boolean) -> Unit)? = null

    /** "ok", "update" (Health Connect must be installed or updated) or "unavailable". */
    fun status(): String = when (HealthConnectClient.getSdkStatus(activity)) {
        HealthConnectClient.SDK_AVAILABLE -> "ok"
        HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> "update"
        else -> "unavailable"
    }

    /**
     * Data of the last [days] days as JSON {weights:[{day,kg}], activity:[{day,steps,kcal}]}, or an error:
     * "unavailable", "update", "denied" (no permission; asked only when [ask] is true), "failed".
     */
    fun read(days: Int, ask: Boolean, answer: (String, String) -> Unit) {
        when (val s = status()) {
            "ok" -> Unit
            "update" -> { if (ask) openStore(); answer("", s); return }
            else -> { answer("", s); return }
        }
        val client = HealthConnectClient.getOrCreate(activity)
        scope.launch {
            try {
                val granted = client.permissionController.getGrantedPermissions().containsAll(permissions)
                if (granted) answer(collect(client, days), "")
                else if (!ask) answer("", "denied")
                else request { ok ->
                    scope.launch {
                        try {
                            if (ok) answer(collect(client, days), "") else answer("", "denied")
                        } catch (_: Exception) {
                            answer("", "failed")
                        }
                    }
                }
            } catch (_: Exception) {
                answer("", "failed")
            }
        }
    }

    private fun request(done: (Boolean) -> Unit) {
        waiting = done
        try {
            if (Build.VERSION.SDK_INT >= 34) {
                // Android 14+: health permissions are runtime permissions of the platform (the contract's intent needs a ComponentActivity)
                activity.requestPermissions(permissions.toTypedArray(), REQ_HEALTH)
            } else {
                @Suppress("DEPRECATION")
                activity.startActivityForResult(contract.createIntent(activity, permissions), REQ_HEALTH)
            }
        } catch (_: Exception) {
            waiting = null
            done(false)
        }
    }

    /** From MainActivity.onRequestPermissionsResult (Android 14+). */
    fun onPermissions(granted: IntArray) {
        waiting?.invoke(granted.isNotEmpty() && granted.all { it == PackageManager.PERMISSION_GRANTED })
        waiting = null
    }

    /** From MainActivity.onActivityResult (Android 13 and older). */
    fun onResult(resultCode: Int, data: Intent?) {
        val granted = contract.parseResult(resultCode, data)
        waiting?.invoke(granted.containsAll(permissions))
        waiting = null
    }

    private fun openStore() {
        try {
            activity.startActivity(Intent(Intent.ACTION_VIEW, android.net.Uri.parse(
                "market://details?id=com.google.android.apps.healthdata&url=healthconnect%3A%2F%2Fonboarding")))
        } catch (_: Exception) {
        }
    }

    private suspend fun collect(client: HealthConnectClient, days: Int): String {
        val zone = ZoneId.systemDefault()
        val first = LocalDate.now(zone).minusDays((days - 1).toLong())
        val start = first.atStartOfDay()
        val end = LocalDate.now(zone).plusDays(1).atStartOfDay()

        // weight: the last measurement of each local day
        val weights = sortedMapOf<String, Double>()
        var token: String? = null
        do {
            val page = client.readRecords(ReadRecordsRequest(
                WeightRecord::class, TimeRangeFilter.between(start.atZone(zone).toInstant(), end.atZone(zone).toInstant()),
                pageToken = token))
            page.records.sortedBy { it.time }.forEach { r ->
                weights[day(r.time, zone)] = r.weight.inKilograms
            }
            token = page.pageToken
        } while (token != null)

        val activity = JSONArray()
        client.aggregateGroupByPeriod(AggregateGroupByPeriodRequest(
            metrics = setOf(StepsRecord.COUNT_TOTAL, ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL),
            timeRangeFilter = TimeRangeFilter.between(start, end),
            timeRangeSlicer = Period.ofDays(1),
        )).forEach { g ->
            val steps = g.result[StepsRecord.COUNT_TOTAL] ?: 0L
            val kcal = g.result[ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL]?.inKilocalories ?: 0.0
            if (steps > 0 || kcal > 0) activity.put(JSONObject()
                .put("day", g.startTime.toLocalDate().toString()).put("steps", steps).put("kcal", kcal))
        }
        return JSONObject()
            .put("weights", JSONArray(weights.map { (d, kg) -> JSONObject().put("day", d).put("kg", kg) }))
            .put("activity", activity)
            .toString()
    }

    private fun day(t: Instant, zone: ZoneId) = t.atZone(zone).toLocalDate().toString()

    companion object {
        const val REQ_HEALTH = 3
    }
}
