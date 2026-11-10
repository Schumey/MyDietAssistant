import 'dart:convert';

import 'package:uuid/uuid.dart';

import 'db.dart';
import 'steps.dart';

class ExerciseInfo {
  ExerciseInfo(this.id, this.name, this.kind, this.catalogKey, this.lastUsed);

  final String id;
  final String name;
  final String kind; // strength | bodyweight | time | cardio
  final String catalogKey;
  final String? lastUsed;

  bool get usesWeight => kind == 'strength';
}

class SetRow {
  SetRow(this.id, this.setNo, this.weight, this.reps, this.kind, this.doneAt, [this.durationSeconds]);

  final String id;
  final int? setNo;
  final double? weight;
  final int? reps;
  final String kind;
  final String doneAt;
  final int? durationSeconds;
}

class WorkoutExercise {
  WorkoutExercise(this.exercise, this.sets);

  final ExerciseInfo exercise;
  final List<SetRow> sets;
}

class TargetInfo {
  TargetInfo(this.weight, this.reps, this.sets, this.reasonCode, this.params, this.reasonDe);

  final double? weight;
  final int? reps;
  final int? sets;
  final String reasonCode;
  final Map<String, dynamic> params;
  final String reasonDe;
}

class WorkoutSummary {
  WorkoutSummary(this.id, this.startedAt, this.endedAt, this.routineName, this.sets, this.volume);

  final String id;
  final DateTime startedAt;
  final DateTime? endedAt;
  final String routineName;
  final int sets;
  final double volume;

  int? get minutes => endedAt?.difference(startedAt).inMinutes;
}

/// Vorbelegung für die Satzeingabe einer Übung.
class EntryDefaults {
  EntryDefaults({required this.weight, required this.reps, required this.step, this.target, this.lastTime = const [], this.steps});

  final double weight;
  final int reps;
  final double step;
  final TargetInfo? target;
  final List<SetRow> lastTime;

  /// Gewichtsstufen des Geräts; ohne sie gilt [step].
  final List<double>? steps;
}

/// Die Trainingslogik der App auf der lokalen Datenbank. Jede Änderung wird zum Senden vorgemerkt.
class Repo {
  Repo(this.local, {DateTime Function()? clock}) : _clock = clock ?? DateTime.now;

  final LocalDb local;
  final DateTime Function() _clock;
  static const _uuid = Uuid();

  String newId() => _uuid.v4();
  String nowStamp() => utcStamp(_clock());
  DateTime now() => _clock();

  // --- Übungen ---------------------------------------------------------------

  /// Übungen, zuletzt benutzte zuerst. `query` filtert nach Name (ohne Beachtung der Großschreibung).
  List<ExerciseInfo> exercises({String query = ''}) {
    final rows = local.rows(
      'SELECT e.id, e.name, e.kind, e.catalog_key, u.last '
      'FROM exercise e LEFT JOIN (SELECT exercise_id, MAX(done_at) last FROM workout_set WHERE deleted = 0 GROUP BY exercise_id) u '
      'ON u.exercise_id = e.id '
      'WHERE e.deleted = 0 AND e.name LIKE ? ESCAPE \'\\\' '
      'ORDER BY u.last IS NULL, u.last DESC, e.name COLLATE NOCASE',
      ['%${query.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%'],
    );
    return [
      for (final r in rows)
        ExerciseInfo(r['id'] as String, r['name'] as String, r['kind'] as String, r['catalog_key'] as String, r['last'] as String?),
    ];
  }

  ExerciseInfo? exercise(String id) {
    final r = local.row('SELECT id, name, kind, catalog_key FROM exercise WHERE id = ?', [id]);
    return r == null ? null : ExerciseInfo(id, r['name'] as String, r['kind'] as String, r['catalog_key'] as String, null);
  }

  // --- Workout ---------------------------------------------------------------

  /// Das laufende Workout (ohne Endzeit), falls es eines gibt.
  Map<String, Object?>? activeWorkout() => local.row(
      "SELECT * FROM workout WHERE deleted = 0 AND ended_at IS NULL AND source = '' ORDER BY started_at DESC LIMIT 1");

  String startWorkout({String routineName = '', String? routineId, String? gymId}) {
    final id = newId();
    local.upsert('workout', {
      'id': id,
      'owner': '',
      'updated_at': nowStamp(),
      'deleted': 0,
      'started_at': localStamp(_clock()),
      'routine_name': routineName,
      'routine_id': routineId,
      'gym_id': gymId,
    }, dirty: true);
    if (gymId != null) local.setState('last_gym', gymId);
    return id;
  }

  String addSet({
    required String workoutId,
    required String exerciseId,
    String? equipmentId,
    double? weight,
    int? reps,
    int? durationSeconds,
    String kind = 'work',
    double? targetWeight,
    int? targetReps,
  }) {
    final n = local.row('SELECT COUNT(*) c FROM workout_set WHERE workout_id = ? AND exercise_id = ? AND deleted = 0',
        [workoutId, exerciseId])!['c'] as int;
    final id = newId();
    local.upsert('workout_set', {
      'id': id,
      'owner': '',
      'updated_at': nowStamp(),
      'deleted': 0,
      'workout_id': workoutId,
      'exercise_id': exerciseId,
      'equipment_id': equipmentId,
      'set_no': n + 1,
      'weight': weight,
      'reps': reps,
      'duration_s': durationSeconds,
      'kind': kind,
      'target_weight': targetWeight,
      'target_reps': targetReps,
      'done_at': localStamp(_clock()),
    }, dirty: true);
    return id;
  }

  void updateSet(String id, {double? weight, int? reps, String? kind}) {
    final r = local.row('SELECT * FROM workout_set WHERE id = ?', [id]);
    if (r == null) return;
    local.upsert('workout_set', {
      ...r,
      'weight': weight ?? r['weight'],
      'reps': reps ?? r['reps'],
      'kind': kind ?? r['kind'],
      'updated_at': nowStamp(),
    }, dirty: true);
  }

  /// Löscht einen Satz (Löschmarke, damit der Server es erfährt) und nummeriert die übrigen neu.
  void deleteSet(String id) {
    final r = local.row('SELECT * FROM workout_set WHERE id = ?', [id]);
    if (r == null) return;
    local.transaction(() {
      local.upsert('workout_set', {...r, 'deleted': 1, 'updated_at': nowStamp()}, dirty: true);
      final rest = local.rows(
          'SELECT * FROM workout_set WHERE workout_id = ? AND exercise_id = ? AND deleted = 0 ORDER BY done_at, set_no',
          [r['workout_id'], r['exercise_id']]);
      for (var i = 0; i < rest.length; i++) {
        if (rest[i]['set_no'] != i + 1) {
          local.upsert('workout_set', {...rest[i], 'set_no': i + 1, 'updated_at': nowStamp()}, dirty: true);
        }
      }
    });
  }

  /// Beendet das Workout. Ohne Sätze wird es verworfen; Rückgabe: ob es behalten wurde.
  bool finishWorkout(String id) {
    final w = local.row('SELECT * FROM workout WHERE id = ?', [id]);
    if (w == null) return false;
    final sets = local.row('SELECT COUNT(*) c FROM workout_set WHERE workout_id = ? AND deleted = 0', [id])!['c'] as int;
    if (sets == 0) {
      local.upsert('workout', {...w, 'deleted': 1, 'updated_at': nowStamp()}, dirty: true);
      return false;
    }
    final last = local.row('SELECT MAX(done_at) m FROM workout_set WHERE workout_id = ? AND deleted = 0', [id])!['m'] as String;
    final now = localStamp(_clock());
    local.upsert('workout', {...w, 'ended_at': now.compareTo(last) > 0 ? now : last, 'updated_at': nowStamp()}, dirty: true);
    return true;
  }

  /// Die Übungen eines Workouts in der Reihenfolge des ersten Satzes, mit ihren Sätzen.
  List<WorkoutExercise> workoutDetail(String workoutId) {
    final rows = local.rows(
        'SELECT s.id, s.exercise_id, s.set_no, s.weight, s.reps, s.duration_s, s.kind, s.done_at, e.name, e.kind ekind, e.catalog_key '
        'FROM workout_set s JOIN exercise e ON e.id = s.exercise_id '
        'WHERE s.workout_id = ? AND s.deleted = 0 ORDER BY s.done_at, s.set_no',
        [workoutId]);
    final order = <String>[];
    final out = <String, WorkoutExercise>{};
    for (final r in rows) {
      final eid = r['exercise_id'] as String;
      final entry = out.putIfAbsent(eid, () {
        order.add(eid);
        return WorkoutExercise(ExerciseInfo(eid, r['name'] as String, r['ekind'] as String, r['catalog_key'] as String, null), []);
      });
      entry.sets.add(SetRow(r['id'] as String, r['set_no'] as int?, (r['weight'] as num?)?.toDouble(), r['reps'] as int?,
          r['kind'] as String, r['done_at'] as String, r['duration_s'] as int?));
    }
    return [for (final id in order) out[id]!];
  }

  // --- Vorbelegung, Vorschlag, letztes Mal ---------------------------------------

  /// Sätze der Übung aus dem letzten früheren Workout. Mit [equipmentId] zählt zuerst das letzte
  /// Workout an diesem Gerät, sonst das letzte überhaupt.
  List<SetRow> lastTime(String exerciseId, {String? excludeWorkoutId, String? equipmentId}) {
    Map<String, Object?>? find(bool onEquipment) => local.row(
        'SELECT s.workout_id FROM workout_set s JOIN workout w ON w.id = s.workout_id '
        'WHERE s.exercise_id = ? AND s.deleted = 0 AND w.deleted = 0 AND s.workout_id != ? '
        '${onEquipment ? 'AND s.equipment_id = ? ' : ''}ORDER BY w.started_at DESC LIMIT 1',
        [exerciseId, excludeWorkoutId ?? '', if (onEquipment) equipmentId]);
    final w = (equipmentId != null ? find(true) : null) ?? find(false);
    if (w == null) return [];
    return [
      for (final r in local.rows(
          'SELECT id, set_no, weight, reps, kind, done_at FROM workout_set '
          'WHERE workout_id = ? AND exercise_id = ? AND deleted = 0 ORDER BY done_at, set_no',
          [w['workout_id'], exerciseId]))
        SetRow(r['id'] as String, r['set_no'] as int?, (r['weight'] as num?)?.toDouble(), r['reps'] as int?, r['kind'] as String,
            r['done_at'] as String),
    ];
  }

  /// Zielwert des Servers für die Übung (ohne Gerät), falls vorhanden.
  TargetInfo? target(String exerciseId, {String equipmentId = ''}) {
    final r = (equipmentId.isEmpty ? null : local.row('SELECT * FROM target WHERE exercise_id = ? AND equipment_id = ? AND deleted = 0', [exerciseId, equipmentId])) ??
        local.row("SELECT * FROM target WHERE exercise_id = ? AND equipment_id = '' AND deleted = 0", [exerciseId]);
    if (r == null) return null;
    Map<String, dynamic> params = {};
    try {
      final text = r['reason_params'] as String;
      if (text.isNotEmpty) params = (jsonDecode(text) as Map).cast<String, dynamic>();
    } catch (_) {}
    return TargetInfo((r['weight'] as num?)?.toDouble(), r['reps'] as int?, r['sets'] as int?, r['reason_code'] as String,
        params, r['reason'] as String);
  }

  /// Vorbelegung: Vorschlag des Servers, sonst der letzte Arbeitssatz vom letzten Mal, sonst leer.
  /// Mit Gerät: dessen Stufen bestimmen das Gewicht und die Schrittweite.
  EntryDefaults defaults(String exerciseId, {String? workoutId, String? equipmentId}) {
    final last = lastTime(exerciseId, excludeWorkoutId: workoutId, equipmentId: equipmentId);
    final t = target(exerciseId, equipmentId: equipmentId ?? '');
    final steps = equipmentId == null ? null : expandSteps(local.row('SELECT steps FROM equipment WHERE id = ?', [equipmentId])?['steps'] as String?);
    final work = last.where((s) => s.kind == 'work' && (s.reps ?? 0) > 0).toList();
    final ref = work.isEmpty ? null : work.last;
    final weight = t?.weight ?? ref?.weight ?? (steps?.first ?? 0);
    return EntryDefaults(
      weight: steps == null ? weight : snapToSteps(weight, steps),
      reps: t?.reps ?? ref?.reps ?? 8,
      step: suggestStep([for (final s in last) s.weight ?? 0]),
      target: t,
      lastTime: last,
      steps: steps,
    );
  }

  // --- Verlauf --------------------------------------------------------------------

  List<WorkoutSummary> history({int limit = 100}) {
    final rows = local.rows(
        "SELECT w.id, w.started_at, w.ended_at, w.routine_name, COUNT(s.id) n, "
        "COALESCE(SUM(CASE WHEN s.kind IN ('work','drop','failure') THEN COALESCE(s.weight, 0) * COALESCE(s.reps, 0) END), 0) vol "
        'FROM workout w LEFT JOIN workout_set s ON s.workout_id = w.id AND s.deleted = 0 '
        'WHERE w.deleted = 0 GROUP BY w.id ORDER BY w.started_at DESC LIMIT ?',
        [limit]);
    return [
      for (final r in rows)
        if ((r['n'] as int) > 0 || r['ended_at'] == null)
          WorkoutSummary(r['id'] as String, DateTime.parse(r['started_at'] as String),
              r['ended_at'] == null ? null : DateTime.parse(r['ended_at'] as String), r['routine_name'] as String, r['n'] as int,
              (r['vol'] as num).toDouble()),
    ];
  }
}

/// Schrittweite für die Plus-/Minus-Tasten: die häufigste Differenz benachbarter benutzter Gewichte
/// (wie `infer_step` auf dem Server), sonst 2,5 kg.
double suggestStep(List<double> weights, {double fallback = 2.5}) {
  final distinct = {for (final w in weights) if (w > 0) (w * 100).round() / 100}.toList()..sort();
  final diffs = <double, int>{};
  for (var i = 1; i < distinct.length; i++) {
    final d = ((distinct[i] - distinct[i - 1]) * 100).round() / 100;
    if (d >= 0.5) diffs[d] = (diffs[d] ?? 0) + 1;
  }
  if (diffs.isEmpty) return fallback;
  final top = diffs.values.reduce((a, b) => a > b ? a : b);
  return (diffs.entries.where((e) => e.value == top).map((e) => e.key).toList()..sort()).first;
}
