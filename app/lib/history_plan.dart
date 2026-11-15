import 'repo.dart';
import 'repo_gym.dart';
import 'repo_program.dart';
import 'templates.dart';

/// One exercise as it was done in one past workout of a routine.
class ExerciseRun {
  const ExerciseRun(this.exerciseId, this.name, this.sets, this.bestReps, this.order);

  final String exerciseId;
  final String name;

  /// Work sets with at least one repetition.
  final int sets;
  final int bestReps;

  /// Position within that workout (0 = first).
  final int order;
}

int _median(List<int> v) {
  final s = [...v]..sort();
  return s[s.length ~/ 2];
}

/// Derives a plan day from past workouts of the same routine: exercises done in at least half of them, in their usual
/// order, with the usual number of sets and a repetition range below the usual best reps.
List<PlanExercise> deriveDay(List<List<ExerciseRun>> workouts) {
  if (workouts.isEmpty) return [];
  final byExercise = <String, List<ExerciseRun>>{};
  for (final w in workouts) {
    for (final r in w) {
      byExercise.putIfAbsent(r.exerciseId, () => []).add(r);
    }
  }
  final out = <(double, PlanExercise)>[];
  for (final runs in byExercise.values) {
    if (runs.length * 2 < workouts.length) continue;
    final good = runs.where((r) => r.sets > 0).toList();
    final sets = good.isEmpty ? 3 : _median([for (final r in good) r.sets]).clamp(2, 6);
    final top = good.isEmpty ? 10 : _median([for (final r in good) r.bestReps]).clamp(3, 30);
    final min = (top - (top <= 8 ? 3 : 4)).clamp(1, top);
    final order = runs.map((r) => r.order).reduce((a, b) => a + b) / runs.length;
    out.add((order, PlanExercise(runs.first.exerciseId, runs.first.name, sets, min, top)));
  }
  out.sort((a, b) => a.$1.compareTo(b.$1));
  return [for (final x in out) x.$2];
}

/// A routine name found in the history (e.g. imported from GymRun) with what it contained lately.
class HistoryRoutine {
  HistoryRoutine(this.name, this.workouts, this.lastAt, this.exercises);

  final String name;

  /// Number of workouts within the look-back window.
  final int workouts;
  final DateTime lastAt;
  final List<PlanExercise> exercises;
}

extension HistoryPlanRepo on Repo {
  /// Routine names used by workouts in the last [days] days, with at least [minWorkouts] workouts; oldest last use first
  /// (so with a rotation, the one that is due next comes first).
  List<HistoryRoutine> historyRoutines({DateTime? now, int days = 150, int minWorkouts = 3, int recent = 8}) {
    final since = (now ?? DateTime.now()).subtract(Duration(days: days));
    final names = local.rows(
        "SELECT routine_name n, COUNT(*) c, MAX(started_at) last FROM workout WHERE deleted = 0 AND routine_name != '' AND ended_at IS NOT NULL "
        'AND started_at >= ? GROUP BY routine_name HAVING c >= ? ORDER BY last',
        [since.toIso8601String(), minWorkouts]);
    final out = <HistoryRoutine>[];
    for (final r in names) {
      final ids = [
        for (final w in local.rows(
            'SELECT id FROM workout WHERE deleted = 0 AND routine_name = ? AND ended_at IS NOT NULL ORDER BY started_at DESC LIMIT ?',
            [r['n'], recent]))
          w['id'] as String,
      ];
      final runs = <List<ExerciseRun>>[];
      for (final id in ids) {
        final rows = local.rows(
            "SELECT s.exercise_id id, e.name name, MIN(s.done_at) t0, "
            "SUM(CASE WHEN s.kind = 'work' AND COALESCE(s.reps, 0) > 0 THEN 1 ELSE 0 END) n, "
            "MAX(CASE WHEN s.kind = 'work' THEN COALESCE(s.reps, 0) ELSE 0 END) best "
            "FROM workout_set s JOIN exercise e ON e.id = s.exercise_id "
            "WHERE s.workout_id = ? AND s.deleted = 0 AND e.kind NOT IN ('time', 'cardio') GROUP BY s.exercise_id ORDER BY t0",
            [id]);
        runs.add([for (var i = 0; i < rows.length; i++) ExerciseRun(rows[i]['id'] as String, rows[i]['name'] as String, rows[i]['n'] as int, rows[i]['best'] as int, i)]);
      }
      final day = deriveDay(runs);
      if (day.isEmpty) continue;
      out.add(HistoryRoutine(r['n'] as String, r['c'] as int, DateTime.parse(r['last'] as String), day));
    }
    return out;
  }

  /// Creates a routine for each chosen history routine (an existing routine of the same name is reused) and a program
  /// in the given order. Returns the program id.
  String createFromHistory(List<HistoryRoutine> chosen, String programName) {
    final existing = {for (final r in routines()) r.name.toLowerCase(): r.id};
    final ids = <String>[];
    for (final h in chosen) {
      ids.add(existing[h.name.toLowerCase()] ??
          saveRoutine(name: h.name, exercises: [
            for (final x in h.exercises) RoutineExercise(exerciseId: x.exerciseId, name: x.name, sets: x.sets, repsMin: x.repsMin, repsMax: x.repsMax),
          ]));
    }
    return saveProgram(name: programName, routineIds: ids);
  }
}
