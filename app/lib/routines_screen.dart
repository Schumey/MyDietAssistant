import 'package:flutter/material.dart';

import 'app_state.dart';
import 'exercise_picker.dart';
import 'gyms_screen.dart';
import 'l10n.dart';
import 'programs_screen.dart';
import 'repo_gym.dart';

String routineLine(RoutineInfo r) => tr('routine_exercises', [r.exercises.length]);

/// Routinen verwalten.
class RoutinesScreen extends StatefulWidget {
  const RoutinesScreen({super.key, required this.app});

  final AppState app;

  @override
  State<RoutinesScreen> createState() => _RoutinesScreenState();
}

class _RoutinesScreenState extends State<RoutinesScreen> {
  Future<void> _edit([String? id]) async {
    await Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => RoutineEditor(app: widget.app, routineId: id)));
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final routines = widget.app.repo!.routines();
    return Scaffold(
      appBar: AppBar(
        title: Text(tr('routines_title')),
        actions: [
          TextButton.icon(
            onPressed: () => Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => ProgramsScreen(app: widget.app))),
            icon: const Icon(Icons.autorenew),
            label: Text(tr('programs_title')),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(onPressed: () => _edit(), icon: const Icon(Icons.add), label: Text(tr('routine_add'))),
      body: routines.isEmpty
          ? Center(child: Text(tr('routines_empty')))
          : ListView(children: [
              for (final r in routines)
                ListTile(
                  leading: const Icon(Icons.list_alt),
                  title: Text(r.name),
                  subtitle: Text(routineLine(r)),
                  onTap: () => _edit(r.id),
                ),
            ]),
    );
  }
}

/// Group letters for rows; a row flagged `withPrev` joins the group of the row above (the first row can't).
List<String> supersetGroups(List<bool> withPrev) {
  final out = List.filled(withPrev.length, '');
  var next = 0;
  for (var i = 1; i < withPrev.length; i++) {
    if (!withPrev[i]) continue;
    if (out[i - 1].isEmpty) out[i - 1] = String.fromCharCode(65 + next++ % 26);
    out[i] = out[i - 1];
  }
  return out;
}

class _Row {
  _Row(this.exerciseId, this.name, this.sets, this.repsMin, this.repsMax, this.restSeconds,
      [this.withPrev = false, this.warmupSets = 0, this.warmupReps = 5, this.warmupPct = 50]);

  final String exerciseId;
  final String name;
  int sets;
  int repsMin;
  int repsMax;
  int? restSeconds;
  int warmupSets;
  int warmupReps;
  double warmupPct;

  /// Done as a superset together with the row above.
  bool withPrev;
}

/// Routine anlegen oder bearbeiten: Name und Übungen mit Sätzen und Wiederholungsbereich.
class RoutineEditor extends StatefulWidget {
  const RoutineEditor({super.key, required this.app, this.routineId});

  final AppState app;
  final String? routineId;

  @override
  State<RoutineEditor> createState() => _RoutineEditorState();
}

class _RoutineEditorState extends State<RoutineEditor> {
  final _name = TextEditingController();
  final List<_Row> _rows = [];

  @override
  void initState() {
    super.initState();
    final id = widget.routineId;
    final r = id == null ? null : widget.app.repo!.routine(id);
    if (r != null) {
      _name.text = r.name;
      for (final (i, x) in r.exercises.indexed) {
        final linked = i > 0 && x.group.isNotEmpty && x.group == r.exercises[i - 1].group;
        _rows.add(_Row(x.exerciseId, x.name, x.sets, x.repsMin, x.repsMax, x.restSeconds, linked, x.warmupSets,
            x.warmupReps > 0 ? x.warmupReps : 5, x.warmupPct > 0 ? x.warmupPct : 50));
      }
    }
  }

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  Future<void> _add() async {
    final e = await Navigator.of(context).push<dynamic>(MaterialPageRoute(builder: (_) => ExercisePicker(repo: widget.app.repo!)));
    if (e == null) return;
    setState(() => _rows.add(_Row(e.id as String, e.name as String, 3, 8, 12, null)));
  }

  void _save() {
    if (_name.text.trim().isEmpty) return;
    final groups = supersetGroups([for (final r in _rows) r.withPrev]);
    widget.app.repo!.saveRoutine(
      id: widget.routineId,
      name: _name.text,
      exercises: [
        for (final (i, r) in _rows.indexed)
          RoutineExercise(
              exerciseId: r.exerciseId,
              name: r.name,
              sets: r.sets,
              repsMin: r.repsMin,
              repsMax: r.repsMax,
              restSeconds: r.restSeconds,
              group: groups[i],
              warmupSets: r.warmupSets,
              warmupReps: r.warmupReps,
              warmupPct: r.warmupPct),
      ],
    );
    widget.app.changed();
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.routineId == null ? tr('routine_add') : tr('routine_edit')),
        actions: [
          if (widget.routineId != null)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              tooltip: tr('delete'),
              onPressed: () async {
                if (await confirm(context, tr('routine_delete_confirm', [_name.text]), tr('delete'))) {
                  widget.app.repo!.deleteRoutine(widget.routineId!);
                  widget.app.changed();
                  if (context.mounted) Navigator.of(context).pop();
                }
              },
            ),
          TextButton(onPressed: _save, child: Text(tr('save'))),
        ],
      ),
      body: Column(children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: TextField(controller: _name, decoration: InputDecoration(labelText: tr('routine_name'), border: const OutlineInputBorder())),
        ),
        Expanded(
          child: ReorderableListView(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            onReorderItem: (from, to) => setState(() => _rows.insert(to, _rows.removeAt(from))),
            children: [
              for (final (i, r) in _rows.indexed)
                Card(
                  key: ValueKey('${r.exerciseId}-$i'),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        Expanded(child: Text(r.name, style: theme.textTheme.titleSmall)),
                        IconButton(visualDensity: VisualDensity.compact, icon: const Icon(Icons.close), onPressed: () => setState(() => _rows.removeAt(i))),
                      ]),
                      if (i > 0)
                        Align(
                          alignment: Alignment.centerLeft,
                          child: FilterChip(
                            visualDensity: VisualDensity.compact,
                            avatar: const Icon(Icons.link, size: 16),
                            label: Text(tr('superset_with_prev')),
                            selected: r.withPrev,
                            onSelected: (v) => setState(() => r.withPrev = v),
                          ),
                        ),
                      Row(children: [
                        _mini(tr('routine_sets'), r.sets, 1, 20, (v) => setState(() => r.sets = v)),
                        _mini(tr('routine_reps_min'), r.repsMin, 1, 100, (v) => setState(() {
                              r.repsMin = v;
                              if (r.repsMax < v) r.repsMax = v;
                            })),
                        _mini(tr('routine_reps_max'), r.repsMax, 1, 100, (v) => setState(() {
                              r.repsMax = v;
                              if (r.repsMin > v) r.repsMin = v;
                            })),
                      ]),
                      Row(children: [
                        _mini(tr('routine_warmup_sets'), r.warmupSets, 0, 6, (v) => setState(() => r.warmupSets = v)),
                        if (r.warmupSets > 0) ...[
                          _mini(tr('routine_warmup_reps'), r.warmupReps, 1, 30, (v) => setState(() => r.warmupReps = v)),
                          _mini(tr('routine_warmup_pct'), r.warmupPct.round(), 10, 95, (v) => setState(() => r.warmupPct = v.toDouble()), step: 5),
                        ] else
                          const Spacer(flex: 2),
                      ]),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: ActionChip(
                          visualDensity: VisualDensity.compact,
                          avatar: const Icon(Icons.timer_outlined, size: 18),
                          label: Text(r.restSeconds == null ? tr('rest_global') : (r.restSeconds == 0 ? tr('rest_off') : tr('rest_seconds', [r.restSeconds!]))),
                          onPressed: () => setState(() => r.restSeconds = _nextRest(r.restSeconds)),
                        ),
                      ),
                    ]),
                  ),
                ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(16),
          child: OutlinedButton.icon(onPressed: _add, icon: const Icon(Icons.add), label: Text(tr('add_exercise'))),
        ),
      ]),
    );
  }

  static const _restChoices = [null, 0, 45, 60, 90, 120, 150, 180, 240, 300];

  /// Pause je Übung: wie global → keine → 45 s … 300 s → wieder global.
  int? _nextRest(int? current) {
    final i = _restChoices.indexOf(current);
    return _restChoices[(i + 1) % _restChoices.length];
  }

  Widget _mini(String label, int value, int min, int max, void Function(int) onChanged, {int step = 1}) {
    return Expanded(
      child: Column(children: [
        Text(label, style: Theme.of(context).textTheme.labelSmall),
        Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          IconButton(visualDensity: VisualDensity.compact, icon: const Icon(Icons.remove), onPressed: value > min ? () => onChanged((value - step).clamp(min, max)) : null),
          Text('$value', style: Theme.of(context).textTheme.titleMedium),
          IconButton(visualDensity: VisualDensity.compact, icon: const Icon(Icons.add), onPressed: value < max ? () => onChanged((value + step).clamp(min, max)) : null),
        ]),
      ]),
    );
  }
}
