/// Statistik als reine Funktionen über die Sätze (keine Datenbank, keine Oberfläche).
library;

/// Ein Satz, wie die Statistik ihn braucht.
class StatSet {
  const StatSet({required this.workoutId, required this.day, this.weight, this.reps, this.kind = 'work'});

  final String workoutId;
  final DateTime day; // Beginn des Workouts
  final double? weight;
  final int? reps;
  final String kind;

  bool get counts => kind != 'warmup' && (reps ?? 0) > 0;
}

/// Geschätztes Einer-Wiederholungs-Maximum nach Epley. Nur für 1 bis 12 Wiederholungen mit Gewicht
/// aussagekräftig, sonst `null`.
double? estimatedOneRepMax(double? weight, int? reps) {
  if (weight == null || weight <= 0 || reps == null || reps < 1 || reps > 12) return null;
  return reps == 1 ? weight : weight * (1 + reps / 30);
}

class SessionStat {
  SessionStat(this.workoutId, this.day, this.topWeight, this.oneRepMax, this.volume, this.sets, this.bestSetReps);

  final String workoutId;
  final DateTime day;
  final double topWeight; // schwerstes Gewicht eines Arbeitssatzes (0 = Körpergewicht)
  final double? oneRepMax;
  final double volume; // Summe Gewicht × Wiederholungen der Arbeitssätze
  final int sets;
  final int bestSetReps; // Wiederholungen des besten Satzes (bei Körpergewicht: die meisten)
}

/// Eine Zeile je Workout, älteste zuerst.
List<SessionStat> exerciseSessions(List<StatSet> sets) {
  final byWorkout = <String, List<StatSet>>{};
  for (final s in sets) {
    if (s.counts) byWorkout.putIfAbsent(s.workoutId, () => []).add(s);
  }
  final out = <SessionStat>[];
  for (final entry in byWorkout.entries) {
    final list = entry.value;
    var top = 0.0, volume = 0.0, bestReps = 0;
    double? rm;
    for (final s in list) {
      final w = s.weight ?? 0;
      if (w > top) top = w;
      volume += w * s.reps!;
      if (s.reps! > bestReps) bestReps = s.reps!;
      final e = estimatedOneRepMax(s.weight, s.reps);
      if (e != null && (rm == null || e > rm)) rm = e;
    }
    out.add(SessionStat(entry.key, list.first.day, top, rm, volume, list.length, bestReps));
  }
  out.sort((a, b) => a.day.compareTo(b.day));
  return out;
}

class Record {
  Record(this.label, this.value, this.day);

  final String label; // 'weight' | 'oneRepMax' | 'volume' | 'reps'
  final double value;
  final DateTime day;
}

/// Bestwerte aus den Sitzungen: schwerstes Gewicht, bestes 1RM, größtes Volumen, meiste Wiederholungen
/// (nur bei Körpergewicht, also ohne Gewicht).
List<Record> records(List<SessionStat> sessions) {
  Record? best(String label, double? Function(SessionStat) pick) {
    Record? r;
    for (final s in sessions) {
      final v = pick(s);
      if (v != null && v > 0 && (r == null || v > r.value)) r = Record(label, v, s.day);
    }
    return r;
  }

  final bodyweight = sessions.isNotEmpty && sessions.every((s) => s.topWeight == 0);
  return [
    ?best('weight', (s) => s.topWeight),
    ?best('oneRepMax', (s) => s.oneRepMax),
    ?best('volume', (s) => s.volume),
    if (bodyweight) ?best('reps', (s) => s.bestSetReps.toDouble()),
  ];
}

/// Montag der Woche (ohne Uhrzeit).
DateTime weekStart(DateTime d) {
  final day = DateTime(d.year, d.month, d.day);
  return day.subtract(Duration(days: day.weekday - 1));
}

/// Workouts je Woche für die letzten [weeks] Wochen bis einschließlich der Woche von [today], älteste zuerst.
List<(DateTime, int)> workoutsPerWeek(List<DateTime> workoutDays, {required DateTime today, int weeks = 12}) {
  final start = weekStart(today);
  final counts = <DateTime, int>{};
  for (final d in workoutDays) {
    final w = weekStart(d);
    counts[w] = (counts[w] ?? 0) + 1;
  }
  return [
    for (var i = weeks - 1; i >= 0; i--) (DateTime(start.year, start.month, start.day - 7 * i), counts[DateTime(start.year, start.month, start.day - 7 * i)] ?? 0),
  ];
}

/// Zeile für die Muskelstatistik: ein Satz mit den Muskeln seiner Übung.
class MuscleSet {
  const MuscleSet(this.day, this.primary, this.secondary);

  final DateTime day;
  final List<String> primary;
  final List<String> secondary;
}

/// Sätze je Muskelgruppe und Woche. Hauptmuskeln zählen voll, Nebenmuskeln halb.
/// Ergebnis: Woche (Montag) → Muskel → Sätze.
Map<DateTime, Map<String, double>> setsPerMuscleAndWeek(List<MuscleSet> sets) {
  final out = <DateTime, Map<String, double>>{};
  for (final s in sets) {
    final week = out.putIfAbsent(weekStart(s.day), () => {});
    for (final m in s.primary) {
      week[m] = (week[m] ?? 0) + 1;
    }
    for (final m in s.secondary) {
      if (s.primary.contains(m)) continue;
      week[m] = (week[m] ?? 0) + 0.5;
    }
  }
  return out;
}

/// Durchschnitt der Sätze je Muskel über die [weeks] Wochen vor der Woche von [today] (diese Woche zählt nicht,
/// sie ist noch nicht voll). Muskeln ohne Sätze fehlen.
Map<String, double> averageSetsPerWeek(Map<DateTime, Map<String, double>> perWeek, {required DateTime today, int weeks = 4}) {
  final start = weekStart(today);
  final sum = <String, double>{};
  for (var i = 1; i <= weeks; i++) {
    final w = DateTime(start.year, start.month, start.day - 7 * i);
    perWeek[w]?.forEach((m, n) => sum[m] = (sum[m] ?? 0) + n);
  }
  return {for (final e in sum.entries) e.key: e.value / weeks};
}
