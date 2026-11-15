import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/stats.dart';

StatSet s(String w, DateTime day, double? weight, int? reps, [String kind = 'work']) =>
    StatSet(workoutId: w, day: day, weight: weight, reps: reps, kind: kind);

void main() {
  final d1 = DateTime(2026, 11, 2, 18); // Montag
  final d2 = DateTime(2026, 11, 5, 18);
  final d3 = DateTime(2026, 11, 10, 18);

  test('estimated 1RM (Epley) and its limits', () {
    expect(estimatedOneRepMax(100, 1), 100);
    expect(estimatedOneRepMax(100, 10), closeTo(133.33, 0.01));
    expect(estimatedOneRepMax(60, 5), closeTo(70, 0.01));
    expect(estimatedOneRepMax(100, 13), isNull); // too many reps to estimate
    expect(estimatedOneRepMax(0, 8), isNull);
    expect(estimatedOneRepMax(null, 8), isNull);
    expect(estimatedOneRepMax(100, 0), isNull);
  });

  test('sessions: top weight, volume, 1RM; warm-ups and empty sets do not count; sorted by date', () {
    final sessions = exerciseSessions([
      s('b', d2, 60, 8), s('b', d2, 62.5, 6), s('b', d2, 40, 12, 'warmup'), s('b', d2, 70, 0),
      s('a', d1, 55, 10),
    ]);
    expect(sessions.map((x) => x.workoutId), ['a', 'b']);
    final b = sessions[1];
    expect(b.topWeight, 62.5);
    expect(b.volume, 60 * 8 + 62.5 * 6);
    expect(b.sets, 2);
    expect(b.oneRepMax, closeTo(76, 0.01)); // 62.5 × (1 + 6/30) = 75; 60 × (1 + 8/30) = 76 → the larger
    expect(b.bestSetReps, 8);
  });

  test('1RM picks the best estimate, not the heaviest set', () {
    final x = exerciseSessions([s('a', d1, 60, 8), s('a', d1, 62.5, 6)]).single;
    expect(x.oneRepMax, closeTo(76, 0.01));
  });

  test('bodyweight exercises: weight 0, volume 0, reps count', () {
    final sessions = exerciseSessions([s('a', d1, null, 12), s('a', d1, null, 10), s('b', d2, null, 14)]);
    expect(sessions.first.topWeight, 0);
    expect(sessions.first.volume, 0);
    expect(sessions.first.bestSetReps, 12);
    final r = records(sessions);
    expect([for (final x in r) x.label], ['reps']);
    expect(r.single.value, 14);
    expect(r.single.day, d2);
  });

  test('records: heaviest weight, best 1RM, biggest volume with their dates', () {
    final sessions = exerciseSessions([
      s('a', d1, 60, 8), s('a', d1, 60, 8),
      s('b', d2, 70, 3),
      s('c', d3, 50, 12), s('c', d3, 50, 12), s('c', d3, 50, 12),
    ]);
    final r = {for (final x in records(sessions)) x.label: x};
    expect(r['weight']!.value, 70);
    expect(r['weight']!.day, d2);
    expect(r['oneRepMax']!.day, d2); // 70 × 1.1 = 77 beats 60 × 1.267 = 76
    expect(r['volume']!.value, 1800);
    expect(r['volume']!.day, d3);
    expect(r.containsKey('reps'), isFalse);
    expect(records([]), isEmpty);
  });

  test('weekStart is the Monday', () {
    expect(weekStart(DateTime(2026, 11, 10, 15)), DateTime(2026, 11, 9));
    expect(weekStart(DateTime(2026, 11, 8)), DateTime(2026, 11, 2)); // Sunday
    expect(weekStart(DateTime(2026, 11, 9)), DateTime(2026, 11, 9));
  });

  test('workouts per week: fixed window, zeros included, oldest first', () {
    final today = DateTime(2026, 11, 10);
    final out = workoutsPerWeek([d1, d2, d3, DateTime(2026, 10, 20), DateTime(2025, 1, 1)], today: today, weeks: 4);
    expect(out.map((e) => e.$1), [DateTime(2026, 10, 19), DateTime(2026, 10, 26), DateTime(2026, 11, 2), DateTime(2026, 11, 9)]);
    expect(out.map((e) => e.$2), [1, 0, 2, 1]);
  });

  test('sets per muscle and week: primary full, secondary half, no double count', () {
    final r = setsPerMuscleAndWeek([
      MuscleSet(d1, ['chest'], ['triceps', 'shoulders']),
      MuscleSet(d1, ['chest'], ['triceps']),
      MuscleSet(d2, ['triceps'], ['triceps']), // listed as both: counts once as primary
      MuscleSet(d3, ['lats'], []),
    ]);
    final w1 = r[DateTime(2026, 11, 2)]!;
    expect(w1['chest'], 2);
    expect(w1['triceps'], 1 + 1); // 0.5 + 0.5 + 1 (d2 is in the same week)
    expect(w1['shoulders'], 0.5);
    expect(r[DateTime(2026, 11, 9)]!['lats'], 1);
  });

  test('average sets per week ignores the current week', () {
    final perWeek = {
      DateTime(2026, 11, 9): {'chest': 100.0}, // current week: not counted
      DateTime(2026, 11, 2): {'chest': 8.0, 'lats': 4.0},
      DateTime(2026, 10, 26): {'chest': 12.0},
      DateTime(2026, 10, 5): {'chest': 99.0}, // outside the window
    };
    final avg = averageSetsPerWeek(perWeek, today: DateTime(2026, 11, 10), weeks: 4);
    expect(avg['chest'], 5); // (8 + 12) / 4
    expect(avg['lats'], 1);
    expect(avg.containsKey('legs'), isFalse);
  });
}
