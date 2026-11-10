import 'repo.dart';

class ProgramInfo {
  ProgramInfo(this.id, this.name, this.routineIds);

  final String id;
  final String name;
  final List<String> routineIds; // in rotation order
}

/// Programme: Routinen in fester Reihenfolge (Rotation A/B/C). Die Reihenfolge steht in `routine.position`,
/// die Zugehörigkeit in `routine.program_id`; das Schema kennt beides schon.
extension ProgramRepo on Repo {
  List<ProgramInfo> programs() => [
        for (final p in local.rows('SELECT id, name FROM program WHERE deleted = 0 ORDER BY name COLLATE NOCASE'))
          ProgramInfo(p['id'] as String, p['name'] as String, [
            for (final r in local.rows(
                'SELECT id FROM routine WHERE program_id = ? AND deleted = 0 ORDER BY position, name COLLATE NOCASE', [p['id']]))
              r['id'] as String,
          ]),
      ];

  /// Legt ein Programm an oder ändert es. [routineIds] in Rotationsreihenfolge; Routinen, die nicht mehr
  /// dabei sind, werden herausgelöst (die Routine selbst bleibt).
  String saveProgram({String? id, required String name, required List<String> routineIds}) {
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

  /// Die nächste Routine der Rotation: die auf die zuletzt abgeschlossene folgende, sonst die erste.
  String? nextRoutineId(String programId) {
    final p = programs().where((x) => x.id == programId).firstOrNull;
    if (p == null || p.routineIds.isEmpty) return null;
    final last = local.row(
        'SELECT w.routine_id FROM workout w WHERE w.deleted = 0 AND w.ended_at IS NOT NULL AND w.routine_id IN '
        '(SELECT id FROM routine WHERE program_id = ? AND deleted = 0) ORDER BY w.started_at DESC LIMIT 1',
        [programId])?['routine_id'] as String?;
    final i = last == null ? -1 : p.routineIds.indexOf(last);
    return p.routineIds[(i + 1) % p.routineIds.length];
  }

  /// Vorschlag für den Start: die nächste Routine des ersten Programms mit Routinen.
  String? suggestedRoutineId() {
    for (final p in programs()) {
      final id = nextRoutineId(p.id);
      if (id != null) return id;
    }
    return null;
  }
}
