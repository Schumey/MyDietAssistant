import 'dart:convert';
import 'dart:io';

import 'package:health/health.dart';

/// Reads weight, steps and active calories from Health Connect for the nutrition page (`MDAApp.healthRead`), in the
/// format of the HA app's `POST api/health/import`: `{"weights": [{day, kg}], "activity": [{day, steps, kcal}]}`.
/// Errors as in the former Kotlin app: `unavailable`, `denied` (no permission; asked only with `ask`), `failed`.
class HealthReader {
  HealthReader([Health? health]) : _health = health ?? Health();

  final Health _health;
  static const _types = [HealthDataType.WEIGHT, HealthDataType.STEPS, HealthDataType.ACTIVE_ENERGY_BURNED];
  static const _access = [HealthDataAccess.READ, HealthDataAccess.READ, HealthDataAccess.READ];

  /// (json, error): one of both is empty.
  Future<(String, String)> read(int days, bool ask, {DateTime? now}) async {
    if (!Platform.isAndroid) return ('', 'unavailable');
    try {
      await _health.configure();
      if (!await _health.isHealthConnectAvailable()) return ('', 'unavailable');
      var granted = await _health.hasPermissions(_types, permissions: _access) == true;
      if (!granted && ask) granted = await _health.requestAuthorization(_types, permissions: _access);
      if (!granted) return ('', 'denied');
      final today = now ?? DateTime.now();
      final first = DateTime(today.year, today.month, today.day).subtract(Duration(days: days.clamp(1, 400) - 1));
      final end = DateTime(today.year, today.month, today.day + 1);
      final points = await _health.getHealthDataFromTypes(types: _types, startTime: first, endTime: end);
      return (jsonEncode(summarize(points)), '');
    } catch (_) {
      return ('', 'failed');
    }
  }
}

String _day(DateTime d) => d.toLocal().toIso8601String().substring(0, 10);

/// Per local day: the last weight, the sum of steps and of active calories (pure, testable).
Map<String, List<Map<String, Object>>> summarize(List<HealthDataPoint> points) {
  final weights = <String, (DateTime, double)>{};
  final steps = <String, double>{}, kcal = <String, double>{};
  for (final p in points) {
    final value = p.value is NumericHealthValue ? (p.value as NumericHealthValue).numericValue.toDouble() : null;
    if (value == null) continue;
    final day = _day(p.dateFrom);
    switch (p.type) {
      case HealthDataType.WEIGHT:
        final have = weights[day];
        if (have == null || p.dateFrom.isAfter(have.$1)) weights[day] = (p.dateFrom, value);
      case HealthDataType.STEPS:
        steps[day] = (steps[day] ?? 0) + value;
      case HealthDataType.ACTIVE_ENERGY_BURNED:
        kcal[day] = (kcal[day] ?? 0) + value;
      default:
        break;
    }
  }
  final days = {...steps.keys, ...kcal.keys}.toList()..sort();
  return {
    'weights': [for (final e in (weights.entries.toList()..sort((a, b) => a.key.compareTo(b.key)))) {'day': e.key, 'kg': e.value.$2}],
    'activity': [
      for (final d in days)
        if ((steps[d] ?? 0) > 0 || (kcal[d] ?? 0) > 0) {'day': d, 'steps': (steps[d] ?? 0).round(), 'kcal': kcal[d] ?? 0},
    ],
  };
}
