import 'db.dart';
import 'repo.dart';
import 'repo_gym.dart';
import 'templates.dart';

class ProgramInfo {
  ProgramInfo(this.id, this.name, this.routineIds, [this.weekdays = const []]);

  final String id;
  final String name;
  final List<String> routineIds; // in rotation order

  /// Weekday plan (1 = Monday .. 7 = Sunday), one per routine in order; empty = plain rotation.
  final List<int> weekdays;
}

/// Weekdays of a program rhythm like "1,3,5"; empty unless there is exactly one per routine (same rule as the server).
List<int> parseRhythm(String text, int count) {
  final days = <int>{};
  for (final x in text.split(',')) {
    if (x.trim().isEmpty) continue;
    final v = int.tryParse(x.trim());
    if (v == null) return [];
    days.add(v);
  }
  final sorted = days.toList()..sort();
  return sorted.length == count && sorted.every((d) => d >= 1 && d <= 7) ? sorted : [];
}

/// Index of the next routine: by weekday plan (today's routine, or the next training day once today is done),
/// otherwise rotation after the last finished one.
int pickNext(int count, int lastIndex, List<int> days, int today, bool trainedToday) {
  if (days.isEmpty) return (lastIndex + 1) % count;
  if (!trainedToday && days.contains(today)) return days.indexOf(today);
  final later = days.where((d) => d > today).toList();
  return later.isEmpty ? 0 : days.indexOf(later.first);
}

/// Programme: Routinen in fester Reihenfolge (Rotation A/B/C). Die Reihenfolge steht in `routine.position`,
/// die Zugehörigkeit in `routine.program_id`; das Schema kennt beides schon.
extension ProgramRepo on Repo {
  List<ProgramInfo> programs() => [
        for (final p in local.rows('SELECT id, name, rhythm FROM program WHERE deleted = 0 ORDER BY name COLLATE NOCASE'))
          _program(p),
      ];

  ProgramInfo _program(Map<String, Object?> p) {
    final ids = [
      for (final r in local.rows('SELECT id FROM routine WHERE program_id = ? AND deleted = 0 ORDER BY position, name COLLATE NOCASE', [p['id']]))
        r['id'] as String,
    ];
    return ProgramInfo(p['id'] as String, p['name'] as String, ids, parseRhythm(p['rhythm'] as String, ids.length));
  }

  /// Legt ein Programm an oder ändert es. [routineIds] in Rotationsreihenfolge; Routinen, die nicht mehr
  /// dabei sind, werden herausgelöst (die Routine selbst bleibt).
  String saveProgram({String? id, required String name, required List<String> routineIds, List<int> weekdays = const []}) {
    final pid = id ?? newId();
    local.transaction(() {
      final old = id == null ? null : local.row('SELECT * FROM program WHERE id = ?', [id]);
      local.upsert('program', {
        ...?old,
        'id': pid,
        'owner': old?['owner'] ?? '',
        'updated_at': nowStamp(),
        'deleted': 0,
        'name': name.trim(),
        'rhythm': weekdays.length == routineIds.length ? (weekdays.toList()..sort()).join(',') : '',
      }, dirty: true);
      for (final r in local.rows('SELECT * FROM routine WHERE program_id = ? AND deleted = 0', [pid])) {
        if (!routineIds.contains(r['id'])) local.upsert('routine', {...r, 'program_id': null, 'updated_at': nowStamp()}, dirty: true);
      }
      for (var i = 0; i < routineIds.length; i++) {
        final r = local.row('SELECT * FROM routine WHERE id = ? AND deleted = 0', [routineIds[i]]);
        if (r == null) continue;
        // a routine belongs to one program only
        if (r['program_id'] == pid && r['position'] == i) continue;
        local.upsert('routine', {...r, 'program_id': pid, 'position': i, 'updated_at': nowStamp()}, dirty: true);
      }
    });
    return pid;
  }

  void deleteProgram(String id) {
    final p = local.row('SELECT * FROM program WHERE id = ?', [id]);
    if (p == null) return;
    local.transaction(() {
      for (final r in local.rows('SELECT * FROM routine WHERE program_id = ? AND deleted = 0', [id])) {
        local.upsert('routine', {...r, 'program_id': null, 'updated_at': nowStamp()}, dirty: true);
      }
      local.upsert('program', {...p, 'deleted': 1, 'updated_at': nowStamp()}, dirty: true);
    });
  }

  /// Die nächste Routine: mit Wochenplan die des heutigen (oder nächsten) Trainingstags, sonst die auf die zuletzt
  /// abgeschlossene folgende der Rotation, sonst die erste.
  String? nextRoutineId(String programId, {DateTime? now}) {
    final p = programs().where((x) => x.id == programId).firstOrNull;
    if (p == null || p.routineIds.isEmpty) return null;
    final last = local.row(
        'SELECT w.routine_id, w.started_at FROM workout w WHERE w.deleted = 0 AND w.ended_at IS NOT NULL AND w.routine_id IN '
        '(SELECT id FROM routine WHERE program_id = ? AND deleted = 0) ORDER BY w.started_at DESC LIMIT 1',
        [programId]);
    final lastId = last?['routine_id'] as String?;
    final i = lastId == null ? -1 : p.routineIds.indexOf(lastId);
    final today = now ?? DateTime.now();
    final trainedToday = last != null && (last['started_at'] as String).startsWith(localStamp(today).substring(0, 10));
    return p.routineIds[pickNext(p.routineIds.length, i, p.weekdays, today.weekday, trainedToday)];
  }

  /// Vorschlag für den Start: die nächste Routine des ersten Programms mit Routinen.
  String? suggestedRoutineId({DateTime? now}) {
    for (final p in programs()) {
      final id = nextRoutineId(p.id, now: now);
      if (id != null) return id;
    }
    return null;
  }

  /// Übungen mit Hauptmuskeln und der Zahl ihrer bisherigen Arbeitssätze, als Grundlage für Vorlagen.
  List<Candidate> templateCandidates() => [
        for (final r in local.rows(
            'SELECT e.id, e.name, e.kind, e.muscles_primary mp, '
            "(SELECT COUNT(*) FROM workout_set s WHERE s.exercise_id = e.id AND s.deleted = 0 AND s.kind = 'work') n "
            'FROM exercise e WHERE e.deleted = 0'))
          Candidate(
            id: r['id'] as String,
            name: r['name'] as String,
            kind: r['kind'] as String,
            primary: (r['mp'] as String).split(' ').where((m) => m.isNotEmpty).toList(),
            uses: r['n'] as int,
          ),
      ];

  /// Legt aus einer Vorlage Routinen und ein Programm an. [dayName] übersetzt die Tag-Schlüssel.
  /// Gibt die ID des Programms zurück, null wenn keine Übung gepasst hat.
  String? createFromTemplate(TemplateDef t, String programName, String Function(String key) dayName) {
    final plan = buildPlan(t, templateCandidates());
    if (plan.isEmpty) return null;
    final ids = <String>[];
    for (final day in plan) {
      ids.add(saveRoutine(name: dayName(day.name), exercises: [
        for (final x in day.exercises) RoutineExercise(exerciseId: x.exerciseId, name: x.name, sets: x.sets, repsMin: x.repsMin, repsMax: x.repsMax),
      ]));
    }
    return saveProgram(name: programName, routineIds: ids);
  }

  /// Alternativen zu einer Übung („Gerät besetzt“): gleiche Hauptmuskelgruppe, Kraftübung, die meistgenutzten zuerst.
  /// Ist ein Studio mit Geräten gewählt, kommen Übungen mit Gerät dort zuerst.
  List<Candidate> alternatives(String exerciseId, {String? gymId, int limit = 8}) {
    final all = templateCandidates();
    final me = all.where((c) => c.id == exerciseId).firstOrNull;
    if (me == null || me.primary.isEmpty) return [];
    final same = all.where((c) => c.id != exerciseId && c.kind == 'strength' && c.primary.isNotEmpty && c.primary.first == me.primary.first).toList();
    bool here(Candidate c) => gymId != null && equipmentFor(c.id, gymId).isNotEmpty;
    same.sort((a, b) {
      final h = (here(b) ? 1 : 0) - (here(a) ? 1 : 0);
      if (h != 0) return h;
      final u = b.uses.compareTo(a.uses);
      return u != 0 ? u : a.name.toLowerCase().compareTo(b.name.toLowerCase());
    });
    return same.take(limit).toList();
  }
}
