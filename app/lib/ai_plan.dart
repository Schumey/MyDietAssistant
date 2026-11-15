import 'package:flutter/material.dart';

import 'app_state.dart';
import 'ha_client.dart';
import 'l10n.dart';
import 'repo_program.dart';
import 'templates.dart';

/// Asks for a plan from the AI of Home Assistant, shows the draft and, on confirmation, creates routines and a program.
/// Returns true when a program was created.
Future<bool> showAiPlanDialog(BuildContext context, AppState app) async {
  final result = await showDialog<bool>(context: context, builder: (_) => _AiPlanDialog(app: app));
  return result == true;
}

class _AiPlanDialog extends StatefulWidget {
  const _AiPlanDialog({required this.app});

  final AppState app;

  @override
  State<_AiPlanDialog> createState() => _AiPlanDialogState();
}

class _AiPlanDialogState extends State<_AiPlanDialog> {
  int _days = 3;
  int _minutes = 60;
  final _notes = TextEditingController();
  bool _busy = false;
  String? _error;
  List<PlanDay>? _draft;

  @override
  void dispose() {
    _notes.dispose();
    super.dispose();
  }

  Future<void> _ask() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final draft = await widget.app.suggestPlan(days: _days, minutes: _minutes, notes: _notes.text.trim());
      if (mounted) setState(() => _draft = draft);
    } on HaException catch (e) {
      if (mounted) setState(() => _error = tr('ai_failed', [e.message]));
    } catch (e) {
      if (mounted) setState(() => _error = tr('ai_failed', ['$e']));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _take() {
    final id = widget.app.repo!.createFromPlan(_draft!, tr('from_ai'));
    if (id != null) widget.app.changed();
    Navigator.pop(context, id != null);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final draft = _draft;
    return AlertDialog(
      title: Text(draft == null ? tr('ai_title') : tr('ai_preview')),
      content: SizedBox(
        width: double.maxFinite,
        child: draft != null
            ? ListView(shrinkWrap: true, children: [
                for (final d in draft)
                  ExpansionTile(
                    tilePadding: EdgeInsets.zero,
                    title: Text(d.name),
                    subtitle: Text(tr('ai_exercises_n', [d.exercises.length])),
                    children: [
                      for (final x in d.exercises)
                        ListTile(dense: true, contentPadding: EdgeInsets.zero, title: Text(x.name), trailing: Text('${x.sets} × ${x.repsMin}–${x.repsMax}')),
                    ],
                  ),
              ])
            : ListView(shrinkWrap: true, children: [
                Text(tr('ai_privacy'), style: theme.textTheme.bodySmall),
                const SizedBox(height: 16),
                Text(tr('ai_days'), style: theme.textTheme.titleSmall),
                const SizedBox(height: 4),
                SegmentedButton<int>(
                  showSelectedIcon: false,
                  segments: [for (final d in [2, 3, 4, 5, 6]) ButtonSegment(value: d, label: Text('$d'))],
                  selected: {_days},
                  onSelectionChanged: (s) => setState(() => _days = s.first),
                ),
                const SizedBox(height: 16),
                Text(tr('ai_minutes'), style: theme.textTheme.titleSmall),
                const SizedBox(height: 4),
                SegmentedButton<int>(
                  showSelectedIcon: false,
                  segments: [for (final m in [45, 60, 90]) ButtonSegment(value: m, label: Text('$m'))],
                  selected: {_minutes},
                  onSelectionChanged: (s) => setState(() => _minutes = s.first),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _notes,
                  maxLines: 3,
                  maxLength: 500,
                  decoration: InputDecoration(labelText: tr('ai_notes'), border: const OutlineInputBorder()),
                ),
                if (_busy) ...[const SizedBox(height: 8), const LinearProgressIndicator(), const SizedBox(height: 4), Text(tr('ai_working'), style: theme.textTheme.bodySmall)],
                if (_error != null) Padding(padding: const EdgeInsets.only(top: 8), child: Text(_error!, style: TextStyle(color: theme.colorScheme.error))),
              ]),
      ),
      actions: [
        TextButton(onPressed: _busy ? null : () => Navigator.pop(context, false), child: Text(tr('cancel'))),
        if (draft == null) FilledButton(onPressed: _busy ? null : _ask, child: Text(tr('ai_ask'))) else FilledButton(onPressed: _take, child: Text(tr('ai_take'))),
      ],
    );
  }
}
