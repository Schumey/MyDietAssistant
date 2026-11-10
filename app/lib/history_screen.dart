import 'package:flutter/material.dart';

import 'app_state.dart';
import 'l10n.dart';
import 'repo.dart';

String workoutSummaryLine(WorkoutSummary s) {
  final parts = <String>[
    if (s.routineName.isNotEmpty) s.routineName,
    tr('sets_count', [s.sets]),
    if (s.volume > 0) tr('volume', [L10n.kg(s.volume.roundToDouble())]),
    if (s.minutes != null) tr('duration_min', [s.minutes]),
  ];
  return parts.join(' · ');
}

String setLine(SetRow s, {bool usesWeight = true}) {
  final w = (s.weight ?? 0) > 0 ? '${L10n.kg(s.weight!)} kg × ' : '';
  final body = s.reps != null ? '$w${s.reps}' : '';
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

/// Ein abgeschlossenes Workout mit allen Sätzen.
class WorkoutDetailScreen extends StatelessWidget {
  const WorkoutDetailScreen({super.key, required this.app, required this.summary});

  final AppState app;
  final WorkoutSummary summary;

  @override
  Widget build(BuildContext context) {
    final detail = app.repo!.workoutDetail(summary.id);
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(L10n.dayLabel(summary.startedAt))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(workoutSummaryLine(summary), style: theme.textTheme.bodyMedium),
          const SizedBox(height: 16),
          for (final d in detail) ...[
            Text(d.exercise.name, style: theme.textTheme.titleMedium),
            const SizedBox(height: 4),
            for (final s in d.sets)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Text('${tr('set_n', [s.setNo ?? ''])}: ${setLine(s)}'),
              ),
            const SizedBox(height: 16),
          ],
        ],
      ),
    );
  }
}
