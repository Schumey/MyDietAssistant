import 'package:flutter/material.dart';

import 'app_state.dart';
import 'gyms_screen.dart';
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
  return '$body$mark';
}

class HistoryTab extends StatelessWidget {
  const HistoryTab({super.key, required this.app});

  final AppState app;

  @override
  Widget build(BuildContext context) {
    final items = app.repo!.history();
    if (items.isEmpty) return Center(child: Text(tr('history_empty')));
    return ListView.separated(
      itemCount: items.length,
      separatorBuilder: (_, _) => const Divider(height: 1),
      itemBuilder: (context, i) {
        final s = items[i];
        return ListTile(
          title: Text(L10n.dayLabel(s.startedAt)),
          subtitle: Text(workoutSummaryLine(s)),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => Navigator.of(context)
              .push(MaterialPageRoute<void>(builder: (_) => WorkoutDetailScreen(app: app, summary: s))),
        );
      },
    );
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
        repo.editSet(s.id, durationSeconds: r == null ? null : (r * 60).round());
      } else {
        repo.editSet(s.id, weight: w, reps: r?.round(), clearWeight: weight.text.trim().isEmpty);
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
