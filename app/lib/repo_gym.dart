import 'package:uuid/uuid.dart';

import 'repo.dart';
import 'steps.dart';

class GymInfo {
  GymInfo(this.id, this.name, this.equipmentCount, [this.zone = '']);

  final String id;
  final String name;
  final int equipmentCount;

  /// Home Assistant zone entity id (e.g. zone.cleverfit) used to detect that the user is here.
  final String zone;
}

class EquipmentInfo {
  EquipmentInfo({
    required this.id,
    required this.gymId,
    required this.name,
    required this.type,
    required this.steps,
    this.outOfOrder = false,
    this.settings = '',
  });

  final String id;
  final String gymId;
  final String name;
  final String type;
  final String steps; // JSON, siehe steps.dart; '' = unbekannt
  final bool outOfOrder;
  final String settings;
}

class RoutineExercise {
  RoutineExercise({
    required this.exerciseId,
    required this.name,
    this.sets = 3,
    this.repsMin = 8,
    this.repsMax = 12,
    this.restSeconds,
    this.group = '',
    this.warmupSets = 0,
    this.warmupReps = 0,
    this.warmupPct = 0,
  });

  final String exerciseId;
  final String name;
  final int sets;
  final int repsMin;
  final int repsMax;
  /// Pause nach einem Arbeitssatz in Sekunden (0 = keine); `null` = die globale Pause.
  final int? restSeconds;

  /// Superset group letter; exercises with the same non-empty group are done alternately.
  final String group;

  /// Aufwärmsätze: Anzahl, Wiederholungen und Gewicht in Prozent des Arbeitsgewichts (0 Sätze = keine).
  final int warmupSets;
  final int warmupReps;
  final double warmupPct;
}

class RoutineInfo {
  RoutineInfo(this.id, this.name, this.exercises);

  final String id;
  final String name;
  final List<RoutineExercise> exercises;
}

/// Eine geplante Übung im laufenden Workout: Soll aus der Routine, Ist aus den erfassten Sätzen.
class PlannedExercise {
  PlannedExercise(this.exercise, this.targetSets, this.doneSets, this.repsMin, this.repsMax,
      [this.group = '', this.warmupSets = 0, this.warmupReps = 0, this.warmupPct = 0, this.warmupDone = 0, this.restSeconds]);

  final ExerciseInfo exercise;
  final int targetSets;
  final int doneSets;
  final int repsMin;
  final int repsMax;
  final String group;
  final int warmupSets;
  final int warmupReps;
  final double warmupPct;

  /// Aufwärmsätze, die in diesem Workout schon erfasst sind.
  final int warmupDone;
  final int? restSeconds;

  bool get finished => doneSets >= targetSets;

  /// Der nächste Satz ist laut Plan ein Aufwärmsatz.
  bool get warmupDue => warmupSets > warmupDone && warmupReps > 0 && warmupPct > 0;
}

const _linkNamespace = '6f3d7c2e-8d41-4a8e-9a5b-2c1e5f0b9d33';

/// Studios, Geräte und Routinen.
extension GymRepo on Repo {
  // --- Studios ---------------------------------------------------------------

  List<GymInfo> gyms() => [
        for (final r in local.rows(
            'SELECT g.id, g.name, g.zone, (SELECT COUNT(*) FROM equipment e WHERE e.gym_id = g.id AND e.deleted = 0) n '
            'FROM gym g WHERE g.deleted = 0 ORDER BY g.name COLLATE NOCASE'))
          GymInfo(r['id'] as String, r['name'] as String, r['n'] as int, r['zone'] as String),
      ];

  String addGym(String name) {
    final id = newId();
    local.upsert('gym', {'id': id, 'owner': '', 'updated_at': nowStamp(), 'deleted': 0, 'name': name.trim()}, dirty: true);
    return id;
  }

  void setGymZone(String id, String zone) {
    final r = local.row('SELECT * FROM gym WHERE id = ?', [id]);
    if (r != null) local.upsert('gym', {...r, 'zone': zone.trim(), 'updated_at': nowStamp()}, dirty: true);
  }

  void renameGym(String id, String name) {
    final r = local.row('SELECT * FROM gym WHERE id = ?', [id]);
    if (r != null) local.upsert('gym', {...r, 'name': name.trim(), 'updated_at': nowStamp()}, dirty: true);
  }

  /// Löscht das Studio mit seinen Geräten (Löschmarken).
  void deleteGym(String id) {
    final r = local.row('SELECT * FROM gym WHERE id = ?', [id]);
    if (r == null) return;
    local.transaction(() {
      for (final e in local.rows('SELECT * FROM equipment WHERE gym_id = ? AND deleted = 0', [id])) {
        _deleteEquipment(e);
      }
      local.upsert('gym', {...r, 'deleted': 1, 'updated_at': nowStamp()}, dirty: true);
    });
  }

  /// Das zuletzt benutzte Studio, falls es noch existiert.
  String? lastGymId() {
    final id = local.state('last_gym');
    if (id == null) return null;
    return local.row('SELECT id FROM gym WHERE id = ? AND deleted = 0', [id]) == null ? null : id;
  }

  // --- Geräte ---------------------------------------------------------------

  List<EquipmentInfo> equipment(String gymId) => [
        for (final r in local.rows('SELECT * FROM equipment WHERE gym_id = ? AND deleted = 0 ORDER BY name COLLATE NOCASE', [gymId]))
          _equipment(r),
      ];

  EquipmentInfo? equipmentById(String id) {
    final r = local.row('SELECT * FROM equipment WHERE id = ? AND deleted = 0', [id]);
    return r == null ? null : _equipment(r);
  }

  EquipmentInfo _equipment(Map<String, Object?> r) => EquipmentInfo(
        id: r['id'] as String,
        gymId: r['gym_id'] as String,
        name: r['name'] as String,
        type: r['type'] as String,
        steps: r['steps'] as String,
        outOfOrder: (r['out_of_order'] as int) == 1,
        settings: r['settings'] as String,
      );

  String saveEquipment({String? id, required String gymId, required String name, String type = '', String steps = '', bool outOfOrder = false, String settings = '', double? baseWeight}) {
    final eid = id ?? newId();
    final old = id == null ? null : local.row('SELECT * FROM equipment WHERE id = ?', [id]);
    local.upsert('equipment', {
      ...?old,
      'id': eid,
      'owner': old?['owner'] ?? '',
      'updated_at': nowStamp(),
      'deleted': 0,
      'gym_id': gymId,
      'name': name.trim(),
      'type': type,
      'steps': steps,
      'out_of_order': outOfOrder ? 1 : 0,
      'settings': settings,
      'base_weight': ?baseWeight,
    }, dirty: true);
    return eid;
  }

  void deleteEquipment(String id) {
    final r = local.row('SELECT * FROM equipment WHERE id = ?', [id]);
    if (r != null) local.transaction(() => _deleteEquipment(r));
  }

  void _deleteEquipment(Map<String, Object?> r) {
    local.upsert('equipment', {...r, 'deleted': 1, 'updated_at': nowStamp()}, dirty: true);
    for (final l in local.rows('SELECT * FROM exercise_equipment WHERE equipment_id = ? AND deleted = 0', [r['id']])) {
      local.upsert('exercise_equipment', {...l, 'deleted': 1, 'updated_at': nowStamp()}, dirty: true);
    }
  }

  /// IDs der Übungen, die an dem Gerät möglich sind.
  Set<String> exercisesOf(String equipmentId) => {
        for (final r in local.rows('SELECT exercise_id FROM exercise_equipment WHERE equipment_id = ? AND deleted = 0', [equipmentId]))
          r['exercise_id'] as String,
      };

  /// Legt fest, welche Übungen an dem Gerät möglich sind (ersetzt die bisherige Zuordnung).
  void setExercisesOf(String equipmentId, Set<String> exerciseIds) {
    local.transaction(() {
      final existing = {for (final r in local.rows('SELECT * FROM exercise_equipment WHERE equipment_id = ?', [equipmentId])) r['exercise_id'] as String: r};
      for (final e in existing.entries) {
        final active = (e.value['deleted'] as int) == 0;
        if (active && !exerciseIds.contains(e.key)) {
          local.upsert('exercise_equipment', {...e.value, 'deleted': 1, 'updated_at': nowStamp()}, dirty: true);
        }
      }
      for (final exerciseId in exerciseIds) {
        final old = existing[exerciseId];
        if (old != null && (old['deleted'] as int) == 0) continue;
        // Feste ID je Paar: dieselbe Zuordnung auf zwei Geräten ergibt keine Doppelten.
        final id = old?['id'] as String? ?? const Uuid().v5(_linkNamespace, '$exerciseId|$equipmentId');
        local.upsert('exercise_equipment', {
          'id': id,
          'owner': old?['owner'] ?? '',
          'updated_at': nowStamp(),
          'deleted': 0,
          'exercise_id': exerciseId,
          'equipment_id': equipmentId,
        }, dirty: true);
      }
    });
  }

  /// Ordnet eine Übung einem Gerät zu oder löst die Zuordnung.
  void linkExercise(String exerciseId, String equipmentId, bool linked) {
    final now = exercisesOf(equipmentId);
    setExercisesOf(equipmentId, linked ? {...now, exerciseId} : ({...now}..remove(exerciseId)));
  }

  /// Verknüpfte Geräte der Übung im Studio (ohne „außer Betrieb“), Stationen und Gerät mit Gewichten zusammen.
  List<EquipmentInfo> _linkedEquipment(String exerciseId, String gymId) => [
        for (final r in local.rows(
            'SELECT e.* FROM equipment e JOIN exercise_equipment x ON x.equipment_id = e.id '
            'WHERE x.exercise_id = ? AND x.deleted = 0 AND e.deleted = 0 AND e.gym_id = ? AND e.out_of_order = 0 '
            'ORDER BY e.name COLLATE NOCASE',
            [exerciseId, gymId]))
          _equipment(r),
      ];

  /// Geräte im Studio, an denen die Übung geht und die Gewichte halten (ohne „außer Betrieb“, ohne Stationen).
  /// Von ihnen kommen Gewichtsstufen; je Gerät merkt sich die App Verlauf und Vorschlag.
  List<EquipmentInfo> equipmentFor(String exerciseId, String gymId) => [
        for (final q in _linkedEquipment(exerciseId, gymId))
          if (!isStationType(q.type)) q,
      ];

  /// Stationen (Rack, Bank) im Studio, die zur Übung gehören; nur zur Anzeige.
  List<EquipmentInfo> stationsFor(String exerciseId, String gymId) => [
        for (final q in _linkedEquipment(exerciseId, gymId))
          if (isStationType(q.type)) q,
      ];

  String? workoutGym(String workoutId) => local.row('SELECT gym_id FROM workout WHERE id = ?', [workoutId])?['gym_id'] as String?;

  void setWorkoutGym(String workoutId, String? gymId) {
    final w = local.row('SELECT * FROM workout WHERE id = ?', [workoutId]);
    if (w == null) return;
    local.upsert('workout', {...w, 'gym_id': gymId, 'updated_at': nowStamp()}, dirty: true);
    if (gymId != null) local.setState('last_gym', gymId);
  }

  /// Das Gerät, an dem die Übung zuletzt erfasst wurde (auch im laufenden Workout), falls bekannt.
  String? lastEquipmentFor(String exerciseId) => local.row(
      'SELECT s.equipment_id FROM workout_set s WHERE s.exercise_id = ? AND s.deleted = 0 AND s.equipment_id IS NOT NULL '
      'ORDER BY s.done_at DESC LIMIT 1',
      [exerciseId])?['equipment_id'] as String?;

  // --- Routinen ---------------------------------------------------------------

  List<RoutineInfo> routines() {
    final rows = local.rows('SELECT id, name FROM routine WHERE deleted = 0 ORDER BY position, name COLLATE NOCASE');
    return [for (final r in rows) RoutineInfo(r['id'] as String, r['name'] as String, routineExercises(r['id'] as String))];
  }

  RoutineInfo? routine(String id) {
    final r = local.row('SELECT id, name FROM routine WHERE id = ? AND deleted = 0', [id]);
    return r == null ? null : RoutineInfo(id, r['name'] as String, routineExercises(id));
  }

  List<RoutineExercise> routineExercises(String routineId) => [
        for (final r in local.rows(
            'SELECT x.exercise_id, x.target_sets, x.reps_min, x.reps_max, x.rest_s, x.superset_group, x.warmup_sets, x.warmup_reps, x.warmup_pct, e.name '
            'FROM routine_exercise x JOIN exercise e ON e.id = x.exercise_id '
            'WHERE x.routine_id = ? AND x.deleted = 0 AND e.deleted = 0 ORDER BY x.position',
            [routineId]))
          RoutineExercise(
            exerciseId: r['exercise_id'] as String,
            name: r['name'] as String,
            sets: (r['target_sets'] as int?) ?? 3,
            repsMin: (r['reps_min'] as int?) ?? 8,
            repsMax: (r['reps_max'] as int?) ?? 12,
            restSeconds: r['rest_s'] as int?,
            group: r['superset_group'] as String,
            warmupSets: (r['warmup_sets'] as int?) ?? 0,
            warmupReps: (r['warmup_reps'] as int?) ?? 0,
            warmupPct: (r['warmup_pct'] as num?)?.toDouble() ?? 0,
          ),
      ];

  /// Legt eine Routine an oder ersetzt sie samt Übungen. Rückgabe: ihre ID.
  String saveRoutine({String? id, required String name, required List<RoutineExercise> exercises}) {
    final rid = id ?? newId();
    local.transaction(() {
      final old = id == null ? null : local.row('SELECT * FROM routine WHERE id = ?', [id]);
      final position = old?['position'] ?? (local.row('SELECT COALESCE(MAX(position), -1) + 1 p FROM routine WHERE deleted = 0')!['p']);
      local.upsert('routine', {
        ...?old,
        'id': rid,
        'owner': old?['owner'] ?? '',
        'updated_at': nowStamp(),
        'deleted': 0,
        'name': name.trim(),
        'position': position,
      }, dirty: true);
      for (final r in local.rows('SELECT * FROM routine_exercise WHERE routine_id = ? AND deleted = 0', [rid])) {
        local.upsert('routine_exercise', {...r, 'deleted': 1, 'updated_at': nowStamp()}, dirty: true);
      }
      for (var i = 0; i < exercises.length; i++) {
        final x = exercises[i];
        local.upsert('routine_exercise', {
          'id': newId(),
          'owner': '',
          'updated_at': nowStamp(),
          'deleted': 0,
          'routine_id': rid,
          'exercise_id': x.exerciseId,
          'position': i,
          'target_sets': x.sets,
          'reps_min': x.repsMin,
          'reps_max': x.repsMax,
          'rest_s': x.restSeconds,
          'superset_group': x.group,
          'warmup_sets': x.warmupSets > 0 ? x.warmupSets : null,
          'warmup_reps': x.warmupSets > 0 ? x.warmupReps : null,
          'warmup_pct': x.warmupSets > 0 ? x.warmupPct : null,
        }, dirty: true);
      }
    });
    return rid;
  }

  void deleteRoutine(String id) {
    final r = local.row('SELECT * FROM routine WHERE id = ?', [id]);
    if (r == null) return;
    local.transaction(() {
      for (final x in local.rows('SELECT * FROM routine_exercise WHERE routine_id = ? AND deleted = 0', [id])) {
        local.upsert('routine_exercise', {...x, 'deleted': 1, 'updated_at': nowStamp()}, dirty: true);
      }
      local.upsert('routine', {...r, 'deleted': 1, 'updated_at': nowStamp()}, dirty: true);
    });
  }

  /// Die Übungen der Routine des Workouts mit dem Stand der erfassten Sätze (leer ohne Routine).
  List<PlannedExercise> planned(String workoutId) {
    final w = local.row('SELECT routine_id FROM workout WHERE id = ?', [workoutId]);
    final routineId = w?['routine_id'] as String?;
    if (routineId == null) return [];
    final counts = {
      for (final r in local.rows('SELECT exercise_id, COUNT(*) n FROM workout_set WHERE workout_id = ? AND deleted = 0 AND kind != ? GROUP BY exercise_id', [workoutId, 'warmup']))
        r['exercise_id'] as String: r['n'] as int,
    };
    final warmups = {
      for (final r in local.rows('SELECT exercise_id, COUNT(*) n FROM workout_set WHERE workout_id = ? AND deleted = 0 AND kind = ? GROUP BY exercise_id', [workoutId, 'warmup']))
        r['exercise_id'] as String: r['n'] as int,
    };
    return [
      for (final x in routineExercises(routineId))
        PlannedExercise(
          exercise(x.exerciseId)!,
          x.sets,
          counts[x.exerciseId] ?? 0,
          x.repsMin,
          x.repsMax,
          x.group,
          x.warmupSets,
          x.warmupReps,
          x.warmupPct,
          warmups[x.exerciseId] ?? 0,
          x.restSeconds,
        ),
    ];
  }

  /// Legt aus den Übungen eines abgeschlossenen Workouts eine Routine an (Sätze = Zahl der Arbeitssätze).
  String saveRoutineFromWorkout(String workoutId, String name) {
    final exercises = <RoutineExercise>[];
    for (final d in workoutDetail(workoutId)) {
      final work = d.sets.where((s) => s.kind != 'warmup').toList();
      if (work.isEmpty) continue;
      final reps = [for (final s in work) if (s.reps != null && s.reps! > 0) s.reps!];
      final maxReps = reps.isEmpty ? 10 : reps.reduce((a, b) => a > b ? a : b);
      exercises.add(RoutineExercise(exerciseId: d.exercise.id, name: d.exercise.name, sets: work.length, repsMin: maxReps, repsMax: maxReps));
    }
    return saveRoutine(name: name, exercises: exercises);
  }
}
