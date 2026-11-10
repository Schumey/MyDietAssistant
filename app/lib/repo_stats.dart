import 'repo.dart';
import 'stats.dart';

/// Datenbankabfragen für die Statistik.
extension StatsRepo on Repo {
  /// Alle Sätze einer Übung, für `exerciseSessions` und `records`.
  List<StatSet> statSets(String exerciseId, {String? equipmentId}) => [
        for (final r in local.rows(
            'SELECT s.workout_id, w.started_at, s.weight, s.reps, s.kind FROM workout_set s JOIN workout w ON w.id = s.workout_id '
            'WHERE s.exercise_id = ? AND s.deleted = 0 AND w.deleted = 0 ${equipmentId == null ? '' : 'AND s.equipment_id = ?'} ORDER BY w.started_at',
            [exerciseId, ?equipmentId]))
          StatSet(
            workoutId: r['workout_id'] as String,
            day: DateTime.parse(r['started_at'] as String),
            weight: (r['weight'] as num?)?.toDouble(),
            reps: r['reps'] as int?,
            kind: r['kind'] as String,
          ),
      ];

  /// Übungen mit mindestens einem Satz, die meistgenutzten zuerst.
  List<ExerciseInfo> trainedExercises() => [
        for (final r in local.rows(
            'SELECT e.id, e.name, e.kind, e.catalog_key, COUNT(s.id) n FROM exercise e JOIN workout_set s ON s.exercise_id = e.id '
            "WHERE e.deleted = 0 AND s.deleted = 0 AND s.kind != 'warmup' GROUP BY e.id ORDER BY n DESC, e.name COLLATE NOCASE"))
          ExerciseInfo(r['id'] as String, r['name'] as String, r['kind'] as String, r['catalog_key'] as String, null),
      ];

  List<DateTime> workoutDays({DateTime? since}) => [
        for (final r in local.rows(
            'SELECT w.started_at FROM workout w WHERE w.deleted = 0 AND w.ended_at IS NOT NULL AND w.started_at >= ?',
            [since == null ? '' : since.toIso8601String()]))
          DateTime.parse(r['started_at'] as String),
      ];

  /// Arbeitssätze mit den Muskeln ihrer Übung seit [since].
  List<MuscleSet> muscleSets(DateTime since) => [
        for (final r in local.rows(
            'SELECT w.started_at, e.muscles_primary mp, e.muscles_secondary ms FROM workout_set s '
            'JOIN workout w ON w.id = s.workout_id JOIN exercise e ON e.id = s.exercise_id '
            "WHERE s.deleted = 0 AND w.deleted = 0 AND s.kind != 'warmup' AND COALESCE(s.reps, 0) > 0 AND w.started_at >= ?",
            [since.toIso8601String()]))
          MuscleSet(DateTime.parse(r['started_at'] as String), _split(r['mp'] as String), _split(r['ms'] as String)),
      ];

  static List<String> _split(String s) => s.split(' ').where((p) => p.isNotEmpty).toList();
}
