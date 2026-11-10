import 'repo.dart';

/// Eigene Übungen und nachträgliche Änderungen an Workouts.
extension EditRepo on Repo {
  /// Gibt es schon eine Übung mit diesem Namen? (Der Server lehnt doppelte Namen ab.)
  bool exerciseNameTaken(String name, {String? exceptId}) =>
      local.row('SELECT id FROM exercise WHERE deleted = 0 AND name = ? COLLATE NOCASE AND id != ?', [name.trim(), exceptId ?? ''])
          != null;

  /// Legt eine eigene Übung an (ohne Katalogschlüssel). Rückgabe: die neue Übung.
  ExerciseInfo createExercise({required String name, String kind = 'strength', List<String> primary = const [], String equipmentType = ''}) {
    final id = newId();
    local.upsert('exercise', {
      'id': id,
      'owner': '',
      'updated_at': nowStamp(),
      'deleted': 0,
      'name': name.trim(),
      'kind': kind,
      'muscles_primary': primary.join(' '),
      'equipment_type': equipmentType,
      'catalog_key': '',
    }, dirty: true);
    return ExerciseInfo(id, name.trim(), kind, '', null);
  }

  /// Benennt eine eigene Übung um oder ändert ihre Art und Muskeln. Katalogübungen bleiben wie sie sind.
  void updateExercise(String id, {String? name, String? kind, List<String>? primary}) {
    final r = local.row('SELECT * FROM exercise WHERE id = ?', [id]);
    if (r == null || (r['catalog_key'] as String).isNotEmpty) return;
    local.upsert('exercise', {
      ...r,
      'name': name?.trim() ?? r['name'],
      'kind': kind ?? r['kind'],
      'muscles_primary': primary == null ? r['muscles_primary'] : primary.join(' '),
      'updated_at': nowStamp(),
    }, dirty: true);
  }

  /// Löscht ein Workout mit allen Sätzen (Löschmarken, damit der Server es erfährt).
  void deleteWorkout(String id) {
    final w = local.row('SELECT * FROM workout WHERE id = ?', [id]);
    if (w == null) return;
    local.transaction(() {
      for (final s in local.rows('SELECT * FROM workout_set WHERE workout_id = ? AND deleted = 0', [id])) {
        local.upsert('workout_set', {...s, 'deleted': 1, 'updated_at': nowStamp()}, dirty: true);
      }
      local.upsert('workout', {...w, 'deleted': 1, 'updated_at': nowStamp()}, dirty: true);
    });
  }

  /// Notiz zum Workout.
  void setWorkoutNote(String id, String note) {
    final w = local.row('SELECT * FROM workout WHERE id = ?', [id]);
    if (w != null) local.upsert('workout', {...w, 'note': note.trim(), 'updated_at': nowStamp()}, dirty: true);
  }

  String workoutNote(String id) => (local.row('SELECT note FROM workout WHERE id = ?', [id])?['note'] as String?) ?? '';

  /// Ändert Gewicht, Wiederholungen oder Dauer eines Satzes; `null` lässt den Wert unverändert.
  void editSet(String id, {double? weight, int? reps, int? durationSeconds, String? kind, bool clearWeight = false}) {
    final r = local.row('SELECT * FROM workout_set WHERE id = ?', [id]);
    if (r == null) return;
    local.upsert('workout_set', {
      ...r,
      'weight': clearWeight ? null : (weight ?? r['weight']),
      'reps': reps ?? r['reps'],
      'duration_s': durationSeconds ?? r['duration_s'],
      'kind': kind ?? r['kind'],
      'updated_at': nowStamp(),
    }, dirty: true);
  }
}
