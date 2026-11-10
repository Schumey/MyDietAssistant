import 'package:flutter/material.dart';

import 'app_state.dart';
import 'charts.dart';
import 'l10n.dart';
import 'muscles.dart';
import 'repo.dart';
import 'repo_stats.dart';
import 'stats.dart';

/// Reiter „Statistik“: Trainingshäufigkeit, Sätze je Muskelgruppe, Übungen.
class StatsTab extends StatelessWidget {
  const StatsTab({super.key, required this.app, this.today});

  final AppState app;
  final DateTime? today;

  @override
  Widget build(BuildContext context) {
    final repo = app.repo!;
    final now = today ?? DateTime.now();
    final theme = Theme.of(context);
    final exercises = repo.trainedExercises();
    if (exercises.isEmpty) return Center(child: Text(tr('stats_empty')));

    final weeks = workoutsPerWeek(repo.workoutDays(since: weekStart(now).subtract(const Duration(days: 7 * 11))), today: now);
    final perWeek = setsPerMuscleAndWeek(repo.muscleSets(weekStart(now).subtract(const Duration(days: 7 * 4))));
    final thisWeek = perWeek[weekStart(now)] ?? const <String, double>{};
    final avg = averageSetsPerWeek(perWeek, today: now);
    final muscles = {...thisWeek.keys, ...avg.keys}.toList()
      ..sort((a, b) => ((avg[b] ?? 0) + (thisWeek[b] ?? 0)).compareTo((avg[a] ?? 0) + (thisWeek[a] ?? 0)));
    final maxSets = muscles.fold<double>(1, (m, k) => [m, thisWeek[k] ?? 0, avg[k] ?? 0].reduce((a, b) => a > b ? a : b));

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(tr('stats_workouts_week'), style: theme.textTheme.titleMedium),
        const SizedBox(height: 8),
        BarChart(bars: [for (final w in weeks) ('${w.$1.day}.${w.$1.month}.', w.$2)]),
        const SizedBox(height: 24),
        Text(tr('stats_muscle_sets'), style: theme.textTheme.titleMedium),
        const SizedBox(height: 4),
        Text('${tr('stats_this_week')} · ${tr('stats_avg')}', style: theme.textTheme.bodySmall),
        const SizedBox(height: 8),
        for (final m in muscles)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(children: [
              SizedBox(width: 130, child: Text(muscleLabel(m), style: theme.textTheme.bodyMedium)),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  _Bar(value: (thisWeek[m] ?? 0) / maxSets, color: theme.colorScheme.primary),
                  const SizedBox(height: 2),
                  _Bar(value: (avg[m] ?? 0) / maxSets, color: theme.colorScheme.outline),
                ]),
              ),
              SizedBox(
                width: 70,
                child: Text('${_n(thisWeek[m] ?? 0)} · ${_n(avg[m] ?? 0)}', textAlign: TextAlign.right, style: theme.textTheme.bodySmall),
              ),
            ]),
          ),
        const SizedBox(height: 24),
        Text(tr('stats_exercises'), style: theme.textTheme.titleMedium),
        for (final e in exercises)
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(e.name),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => ExerciseStatsScreen(app: app, exercise: e))),
          ),
      ],
    );
  }

  static String _n(double v) => v == v.roundToDouble() ? v.toStringAsFixed(0) : v.toStringAsFixed(1).replaceAll('.', L10n.lang == 'de' ? ',' : '.');
}

class _Bar extends StatelessWidget {
  const _Bar({required this.value, required this.color});

  final double value;
  final Color color;

  @override
  Widget build(BuildContext context) => LayoutBuilder(
        builder: (context, c) => Container(
          height: 8,
          width: (c.maxWidth * value.clamp(0.0, 1.0)).clamp(2.0, c.maxWidth),
          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4)),
        ),
      );
}

/// Verlauf einer Übung: Diagramm, Rekorde und die letzten Workouts.
class ExerciseStatsScreen extends StatefulWidget {
  const ExerciseStatsScreen({super.key, required this.app, required this.exercise});

  final AppState app;
  final ExerciseInfo exercise;

  @override
  State<ExerciseStatsScreen> createState() => _ExerciseStatsScreenState();
}

class _ExerciseStatsScreenState extends State<ExerciseStatsScreen> {
  String _metric = '';
  int _months = 0; // 0 = alles
  String? _equipmentId;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final repo = widget.app.repo!;
    final equipment = repo.equipmentUsed(widget.exercise.id);
    final all = exerciseSessions(repo.statSets(widget.exercise.id, equipmentId: _equipmentId));
    final cutoff = _months == 0 ? null : DateTime.now().subtract(Duration(days: 30 * _months));
    final sessions = cutoff == null ? all : [for (final s in all) if (!s.day.isBefore(cutoff)) s];
    final bodyweight = sessions.isNotEmpty && sessions.every((s) => s.topWeight == 0);
    final metrics = bodyweight ? ['reps'] : ['1rm', 'weight', 'volume'];
    final metric = metrics.contains(_metric) ? _metric : metrics.first;
    double? pick(SessionStat s) => switch (metric) {
          '1rm' => s.oneRepMax,
          'weight' => s.topWeight,
          'volume' => s.volume,
          _ => s.bestSetReps.toDouble(),
        };
    final points = [for (final s in sessions) if (pick(s) != null) (s.day, pick(s)!)];
    final recs = records(all);
    return Scaffold(
      appBar: AppBar(title: Text(widget.exercise.name)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (metrics.length > 1)
            SegmentedButton<String>(
              showSelectedIcon: false,
              segments: [for (final m in metrics) ButtonSegment(value: m, label: Text(tr('metric_${m == '1rm' ? '1rm' : m}')))],
              selected: {metric},
              onSelectionChanged: (s) => setState(() => _metric = s.first),
            )
          else
            Text(tr('metric_reps'), style: theme.textTheme.titleMedium),
          const SizedBox(height: 8),
          Wrap(spacing: 8, children: [
            for (final m in const [3, 12, 0])
              ChoiceChip(
                visualDensity: VisualDensity.compact,
                label: Text(tr(m == 0 ? 'range_all' : 'range_months', [m])),
                selected: _months == m,
                onSelected: (_) => setState(() => _months = m),
              ),
          ]),
          if (equipment.length > 1) ...[
            const SizedBox(height: 4),
            Wrap(spacing: 8, children: [
              ChoiceChip(
                visualDensity: VisualDensity.compact,
                label: Text(tr('all_equipment')),
                selected: _equipmentId == null,
                onSelected: (_) => setState(() => _equipmentId = null),
              ),
              for (final q in equipment)
                ChoiceChip(
                  visualDensity: VisualDensity.compact,
                  label: Text(q.$2),
                  selected: _equipmentId == q.$1,
                  onSelected: (_) => setState(() => _equipmentId = q.$1),
                ),
            ]),
          ],
          const SizedBox(height: 12),
          points.isEmpty ? Text(tr('stats_empty')) : LineChart(points: points),
          if (metric == '1rm') Text(tr('stats_note_1rm'), style: theme.textTheme.bodySmall),
          const SizedBox(height: 24),
          Text(tr('records'), style: theme.textTheme.titleMedium),
          for (final r in recs)
            ListTile(
              dense: true,
              contentPadding: EdgeInsets.zero,
              title: Text(tr(switch (r.label) { 'oneRepMax' => 'record_1rm', 'weight' => 'record_weight', 'volume' => 'record_volume', _ => 'record_reps' })),
              subtitle: Text(L10n.dayLabel(r.day)),
              trailing: Text(r.label == 'reps' ? '${r.value.round()}' : '${L10n.kg(double.parse(r.value.toStringAsFixed(1)))} kg', style: theme.textTheme.titleMedium),
            ),
          const SizedBox(height: 16),
          Text(tr('sessions_recent'), style: theme.textTheme.titleMedium),
          for (final s in sessions.reversed.take(10))
            ListTile(
              dense: true,
              contentPadding: EdgeInsets.zero,
              title: Text(L10n.dayLabel(s.day)),
              subtitle: Text([
                tr('sets_count', [s.sets]),
                if (s.topWeight > 0) '${L10n.kg(s.topWeight)} kg',
                if (s.volume > 0) tr('volume', [L10n.kg(s.volume.roundToDouble())]),
              ].join(' · ')),
            ),
        ],
      ),
    );
  }
}
