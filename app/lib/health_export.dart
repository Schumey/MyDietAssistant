import 'dart:io';

import 'package:health/health.dart';

import 'db.dart';

/// Where finished workouts are written to. The real one is Health Connect; tests use a double.
abstract class WorkoutSink {
  /// Whether the platform can take workouts at all (Android with Health Connect installed).
  Future<bool> available();

  /// Asks for the permission to write workouts and calories; true if granted.
  Future<bool> authorize();

  /// Writes one strength workout; true if it was stored.
  Future<bool> write({required DateTime start, required DateTime end, required int kcal, required String title});
}

class HealthConnectSink implements WorkoutSink {
  final Health _health = Health();
  static const _types = [HealthDataType.WORKOUT, HealthDataType.TOTAL_CALORIES_BURNED];
  static const _access = [HealthDataAccess.READ_WRITE, HealthDataAccess.READ_WRITE];

  @override
  Future<bool> available() async {
    if (!Platform.isAndroid) return false;
    try {
      await _health.configure();
      return await _health.isHealthConnectAvailable();
    } catch (_) {
      return false;
    }
  }

  @override
  Future<bool> authorize() async {
    try {
      if (await _health.hasPermissions(_types, permissions: _access) == true) return true;
      return await _health.requestAuthorization(_types, permissions: _access);
    } catch (_) {
      return false;
    }
  }

  @override
  Future<bool> write({required DateTime start, required DateTime end, required int kcal, required String title}) async {
    try {
      return await _health.writeWorkoutData(
        activityType: HealthWorkoutActivityType.STRENGTH_TRAINING,
        start: start,
        end: end,
        totalEnergyBurned: kcal,
        title: title,
        recordingMethod: RecordingMethod.manual,
      );
    } catch (_) {
      return false;
    }
  }
}

/// Rough energy use of a strength workout (same estimate as the server's `kcal_estimate`).
int estimateKcal(Duration d) => (d.inSeconds / 60 * 4.5).round();

/// Writes finished workouts to Health Connect (MDA reads them from there) once each. Opt-in, off by default.
class HealthExport {
  HealthExport(this.local, {WorkoutSink? sink}) : sink = sink ?? HealthConnectSink();

  final LocalDb local;
  final WorkoutSink sink;

  static const _enabledKey = 'hc_enabled';
  static String _doneKey(String id) => 'hc_done_$id';

  bool get enabled => local.state(_enabledKey) == '1';

  /// Switches the export on (asking for the permission first; false if it was refused or is not possible) or off.
  Future<bool> setEnabled(bool on) async {
    if (!on) {
      local.setState(_enabledKey, '0');
      return true;
    }
    if (!await sink.available() || !await sink.authorize()) {
      local.setState(_enabledKey, '0');
      return false;
    }
    local.setState(_enabledKey, '1');
    return true;
  }

  /// Writes the app's own finished workouts of the last [days] days that were not written yet. Returns how many.
  /// Imported (GymRun) workouts are never written, and a workout is written once only.
  Future<int> exportPending({int days = 7, DateTime? now}) async {
    if (!enabled) return 0;
    final since = localStamp((now ?? DateTime.now()).subtract(Duration(days: days)));
    var written = 0;
    for (final w in local.rows(
        "SELECT id, started_at, ended_at, routine_name FROM workout WHERE deleted = 0 AND ended_at IS NOT NULL AND source = '' AND started_at >= ? ORDER BY started_at",
        [since])) {
      final id = w['id'] as String;
      if (local.state(_doneKey(id)) != null) continue;
      final start = DateTime.parse(w['started_at'] as String), end = DateTime.parse(w['ended_at'] as String);
      if (!end.isAfter(start)) continue;
      final name = (w['routine_name'] as String).trim();
      final ok = await sink.write(start: start, end: end, kcal: estimateKcal(end.difference(start)), title: name.isEmpty ? 'HAFS' : name);
      if (ok) {
        local.setState(_doneKey(id), '1');
        written++;
      }
    }
    return written;
  }
}
