import 'package:flutter/material.dart';

import 'app_state.dart';
import 'gyms_screen.dart';
import 'history_plan.dart';
import 'l10n.dart';
import 'repo_gym.dart';
import 'repo_program.dart';
import 'templates.dart';

/// Programme verwalten (Rotation von Routinen).
class ProgramsScreen extends StatefulWidget {
  const ProgramsScreen({super.key, required this.app});

  final AppState app;

  @override
  State<ProgramsScreen> createState() => _ProgramsScreenState();
}

class _ProgramsScreenState extends State<ProgramsScreen> {
  Future<void> _edit([String? id]) async {
    await Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => ProgramEditor(app: widget.app, programId: id)));
    if (mounted) setState(() {});
  }

  Future<void> _fromTemplate() async {
    final t = await showDialog<TemplateDef>(
      context: context,
      builder: (context) => SimpleDialog(
        title: Text(tr('template_pick')),
        children: [
          for (final t in templates)
            SimpleDialogOption(
              onPressed: () => Navigator.pop(context, t),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(tr('tpl_${t.key}'), style: Theme.of(context).textTheme.titleMedium),
                Text(tr('tpl_${t.key}_desc'), style: Theme.of(context).textTheme.bodySmall),
              ]),
            ),
        ],
      ),
    );
    if (t == null || !mounted) return;
    final id = widget.app.repo!.createFromTemplate(t, tr('tpl_${t.key}'), (k) => t.key == 'fullbody' ? '${tr('tpl_fullbody')} $k' : tr('tpl_day_$k'));
    widget.app.changed();
    if (id == null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(tr('template_empty'))));
    }
    if (mounted) setState(() {});
  }

  /// Offers the routines found in the history (e.g. an imported PPL) and creates routines plus a program from them.
  Future<void> _fromHistory() async {
    final repo = widget.app.repo!;
    final found = repo.historyRoutines();
    if (found.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(tr('history_plan_empty'))));
      return;
    }
    final picked = {for (final h in found) h.name};
    final chosen = await showDialog<List<HistoryRoutine>>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialog) => AlertDialog(
          title: Text(tr('history_plan_title')),
          content: SizedBox(
            width: double.maxFinite,
            child: ListView(shrinkWrap: true, children: [
              Text(tr('history_plan_help'), style: Theme.of(context).textTheme.bodySmall),
              for (final h in found)
                CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  value: picked.contains(h.name),
                  onChanged: (v) => setDialog(() => v == true ? picked.add(h.name) : picked.remove(h.name)),
                  title: Text(h.name),
                  subtitle: Text('${tr('history_plan_info', [h.workouts, h.exercises.length])} · ${h.exercises.map((x) => x.name).take(3).join(', ')}…'),
                ),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: Text(tr('cancel'))),
            FilledButton(
              onPressed: picked.isEmpty ? null : () => Navigator.pop(context, [for (final h in found) if (picked.contains(h.name)) h]),
              child: Text(tr('history_plan_create')),
            ),
          ],
        ),
      ),
    );
    if (chosen == null || chosen.isEmpty || !mounted) return;
    final name = await askText(context, tr('program_name'), initial: chosen.map((h) => h.name).join(' / '));
    if (name == null || name.trim().isEmpty || !mounted) return;
    repo.createFromHistory(chosen, name);
    widget.app.changed();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final repo = widget.app.repo!;
    final programs = repo.programs();
    final names = {for (final r in repo.routines()) r.id: r.name};
    return Scaffold(
      appBar: AppBar(
        title: Text(tr('programs_title')),
        actions: [
          TextButton.icon(onPressed: _fromHistory, icon: const Icon(Icons.history), label: Text(tr('from_history'))),
          TextButton.icon(onPressed: _fromTemplate, icon: const Icon(Icons.auto_awesome), label: Text(tr('from_template'))),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(onPressed: () => _edit(), icon: const Icon(Icons.add), label: Text(tr('program_add'))),
      body: programs.isEmpty
          ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(tr('programs_empty'), textAlign: TextAlign.center)))
          : ListView(children: [
              for (final p in programs)
                ListTile(
                  leading: const Icon(Icons.autorenew),
                  title: Text(p.name),
                  subtitle: Text(p.routineIds.map((id) => names[id] ?? '?').join(' → ')),
                  onTap: () => _edit(p.id),
                ),
            ]),
    );
  }
}

/// Programm anlegen oder bearbeiten: Name, Routinen ankreuzen, Reihenfolge ziehen.
class ProgramEditor extends StatefulWidget {
  const ProgramEditor({super.key, required this.app, this.programId});

  final AppState app;
  final String? programId;

  @override
  State<ProgramEditor> createState() => _ProgramEditorState();
}

class _ProgramEditorState extends State<ProgramEditor> {
  final _name = TextEditingController();
  late final List<({String id, String name})> _order; // all routines, members first in rotation order
  final Set<String> _selected = {};

  @override
  void initState() {
    super.initState();
    final repo = widget.app.repo!;
    final all = {for (final r in repo.routines()) r.id: r.name};
    final p = widget.programId == null ? null : repo.programs().where((x) => x.id == widget.programId).firstOrNull;
    if (p != null) {
      _name.text = p.name;
      _selected.addAll(p.routineIds);
    }
    final members = [for (final id in p?.routineIds ?? const <String>[]) if (all.containsKey(id)) id];
    _order = [
      for (final id in members) (id: id, name: all[id]!),
      for (final e in all.entries) if (!members.contains(e.key)) (id: e.key, name: e.value),
    ];
  }

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  void _save() {
    if (_name.text.trim().isEmpty) return;
    widget.app.repo!.saveProgram(
      id: widget.programId,
      name: _name.text,
      routineIds: [for (final r in _order) if (_selected.contains(r.id)) r.id],
    );
    widget.app.changed();
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.programId == null ? tr('program_add') : tr('program_edit')),
        actions: [
          if (widget.programId != null)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              tooltip: tr('delete'),
              onPressed: () async {
                if (await confirm(context, tr('program_delete_confirm', [_name.text]), tr('delete'))) {
                  widget.app.repo!.deleteProgram(widget.programId!);
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
          child: TextField(controller: _name, decoration: InputDecoration(labelText: tr('program_name'), border: const OutlineInputBorder())),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Align(alignment: Alignment.centerLeft, child: Text(tr('program_hint'), style: Theme.of(context).textTheme.bodySmall)),
        ),
        Expanded(
          child: _order.isEmpty
              ? Center(child: Text(tr('routines_empty')))
              : ReorderableListView(
                  onReorderItem: (from, to) => setState(() => _order.insert(to, _order.removeAt(from))),
                  children: [
                    for (final r in _order)
                      CheckboxListTile(
                        key: ValueKey(r.id),
                        title: Text(r.name),
                        value: _selected.contains(r.id),
                        onChanged: (v) => setState(() => v == true ? _selected.add(r.id) : _selected.remove(r.id)),
                      ),
                  ],
                ),
        ),
      ]),
    );
  }
}
