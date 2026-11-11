import 'package:flutter/material.dart';

import 'app_state.dart';
import 'gyms_screen.dart';
import 'history_calendar.dart';
import 'attachments.dart';
import 'l10n.dart';
import 'repo.dart';
import 'repo_edit.dart';

String workoutSummaryLine(WorkoutSummary s) {
  final parts = <String>[
    if (s.routineName.isNotEmpty) s.routineName,
    tr('sets_count', [s.sets]),
    if (s.volume > 0) tr('volume', [L10n.kg(s.volume.roundToDouble())]),
    if (s.minutes != null) tr('duration_min', [s.minutes]),
  ];
  return parts.join(' · ');
}

String setLine(SetRow s, {String? durationFor}) {
  final w = (s.weight ?? 0) > 0 ? '${L10n.kg(s.weight!)} kg × ' : '';
  final body = s.reps != null
      ? '$w${s.reps}'
      : (s.durationSeconds != null ? tr('duration_min', [(s.durationSeconds! / 60).toStringAsFixed(s.durationSeconds! % 60 == 0 ? 0 : 1)]) : '');
  final mark = switch (s.kind) { 'warmup' => ' (${tr('kind_warmup')})', 'drop' => ' (${tr('kind_drop')})', _ => '' };
  final att = s.attachment.isEmpty ? '' : ' · ${attachmentLabel(s.attachment)}';
  return '$body$mark$att${s.note.isEmpty ? '' : ' · ${s.note}'}';
}

class HistoryTab extends StatefulWidget {
  const HistoryTab({super.key, required this.app});

  final AppState app;

  @override
  State<HistoryTab> createState() => _HistoryTabState();
}

class _HistoryTabState extends State<HistoryTab> {
  static const _page = 100;
  int _limit = _page;
  bool _calendar = false;

  void _open(WorkoutSummary s) =>
      Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => WorkoutDetailScreen(app: widget.app, summary: s)));

  @override
  Widget build(BuildContext context) {
    final items = widget.app.repo!.history(limit: _calendar ? 100000 : _limit + 1);
    if (items.isEmpty) return Center(child: Text(tr('history_empty')));
    final more = !_calendar && items.length > _limit;
    final shown = more ? items.sublist(0, _limit) : items;
    return Column(children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
        child: SegmentedButton<bool>(
          showSelectedIcon: false,
          segments: [
            ButtonSegment(value: false, label: Text(tr('history_list')), icon: const Icon(Icons.list)),
            ButtonSegment(value: true, label: Text(tr('history_calendar')), icon: const Icon(Icons.calendar_month)),
          ],
          selected: {_calendar},
          onSelectionChanged: (s) => setState(() => _calendar = s.first),
        ),
      ),
      Expanded(
        child: _calendar
            ? SingleChildScrollView(child: HistoryCalendar(items: items, onOpen: _open))
            : ListView.separated(
                itemCount: shown.length + (more ? 1 : 0),
                separatorBuilder: (_, _) => const Divider(height: 1),
                itemBuilder: (context, i) {
                  if (i == shown.length) {
                    return TextButton(onPressed: () => setState(() => _limit += _page * 2), child: Text(tr('history_more')));
                  }
                  final s = shown[i];
                  return ListTile(
                    title: Text(L10n.dayLabel(s.startedAt)),
                    subtitle: Text(workoutSummaryLine(s)),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => _open(s),
                  );
                },
              ),
      ),
    ]);
  }
}

/// Ein Workout mit allen Sätzen. Sätze lassen sich antippen und korrigieren oder löschen.
class WorkoutDetailScreen extends StatefulWidget {
  const WorkoutDetailScreen({super.key, required this.app, required this.summary});

  final AppState app;
  final WorkoutSummary summary;

  @override
  State<WorkoutDetailScreen> createState() => _WorkoutDetailScreenState();
}

class _WorkoutDetailScreenState extends State<WorkoutDetailScreen> {
  Repo get repo => widget.app.repo!;

  Future<void> _editSet(WorkoutExercise d, SetRow s) async {
    final timed = d.exercise.kind == 'time' || d.exercise.kind == 'cardio';
    final weight = TextEditingController(text: (s.weight ?? 0) > 0 ? L10n.kg(s.weight!) : '');
    final reps = TextEditingController(text: timed ? '${((s.durationSeconds ?? 0) / 60).round()}' : '${s.reps ?? ''}');
    final note = TextEditingController(text: s.note);
    double? parse(String t) => double.tryParse(t.trim().replaceAll(',', '.'));
    final action = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('${d.exercise.name} · ${tr('set_n', [s.setNo ?? ''])}'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          if (!timed)
            TextField(
              controller: weight,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: InputDecoration(labelText: tr('weight_kg'), border: const OutlineInputBorder()),
            ),
          if (!timed) const SizedBox(height: 12),
          TextField(
            controller: reps,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(labelText: timed ? tr('minutes') : tr('reps'), border: const OutlineInputBorder()),
          ),
          const SizedBox(height: 12),
          TextField(controller: note, decoration: InputDecoration(labelText: tr('set_note'), border: const OutlineInputBorder())),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, 'delete'), child: Text(tr('delete_set'))),
          TextButton(onPressed: () => Navigator.pop(context), child: Text(tr('cancel'))),
          FilledButton(onPressed: () => Navigator.pop(context, 'save'), child: Text(tr('save'))),
        ],
      ),
    );
    if (action == 'delete') {
      repo.deleteSet(s.id);
    } else if (action == 'save') {
      final w = parse(weight.text), r = parse(reps.text);
      if (timed) {
        repo.editSet(s.id, durationSeconds: r == null ? null : (r * 60).round(), note: note.text);
      } else {
        repo.editSet(s.id, weight: w, reps: r?.round(), note: note.text, clearWeight: weight.text.trim().isEmpty);
      }
    } else {
      return;
    }
    widget.app.changed();
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final detail = repo.workoutDetail(widget.summary.id);
    final theme = Theme.of(context);
    final note = repo.workoutNote(widget.summary.id);
    return Scaffold(
      appBar: AppBar(
        title: Text(L10n.dayLabel(widget.summary.startedAt)),
        actions: [
          IconButton(
            tooltip: tr('delete_workout'),
            icon: const Icon(Icons.delete_outline),
            onPressed: () async {
              if (await confirm(context, tr('delete_workout_confirm'), tr('delete'))) {
                repo.deleteWorkout(widget.summary.id);
                widget.app.changed();
                if (context.mounted) Navigator.of(context).pop();
              }
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(workoutSummaryLine(widget.summary), style: theme.textTheme.bodyMedium),
          const SizedBox(height: 8),
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.notes),
            title: Text(note.isEmpty ? tr('workout_note') : note, style: note.isEmpty ? theme.textTheme.bodyMedium?.copyWith(color: theme.hintColor) : null),
            onTap: () async {
              final text = await askText(context, tr('workout_note'), initial: note);
              if (text != null) {
                repo.setWorkoutNote(widget.summary.id, text);
                widget.app.changed();
                if (mounted) setState(() {});
              }
            },
          ),
          const SizedBox(height: 8),
          for (final d in detail) ...[
            Text(d.exercise.name, style: theme.textTheme.titleMedium),
            const SizedBox(height: 4),
            for (final s in d.sets)
              InkWell(
                onTap: () => _editSet(d, s),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Text('${tr('set_n', [s.setNo ?? ''])}: ${setLine(s, durationFor: d.exercise.kind)}'),
                ),
              ),
            const SizedBox(height: 16),
          ],
        ],
      ),
    );
  }
}
