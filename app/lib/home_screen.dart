import 'package:flutter/material.dart';

import 'app_state.dart';
import 'gyms_screen.dart';
import 'history_screen.dart';
import 'l10n.dart';
import 'repo.dart';
import 'repo_gym.dart';
import 'routines_screen.dart';
import 'settings_screen.dart';
import 'stats_screen.dart';
import 'workout_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.app});

  final AppState app;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    final app = widget.app;
    return ListenableBuilder(
      listenable: app,
      builder: (context, _) {
        return Scaffold(
          appBar: AppBar(
            title: Text(tr('app_name')),
            actions: [_SyncButton(app: app)],
          ),
          body: switch (_tab) {
            0 => TrainingTab(app: app),
            1 => HistoryTab(app: app),
            2 => StatsTab(app: app),
            _ => SettingsTab(app: app),
          },
          bottomNavigationBar: NavigationBar(
            selectedIndex: _tab,
            onDestinationSelected: (i) => setState(() => _tab = i),
            destinations: [
              NavigationDestination(icon: const Icon(Icons.fitness_center), label: tr('tab_training')),
              NavigationDestination(icon: const Icon(Icons.calendar_month), label: tr('tab_history')),
              NavigationDestination(icon: const Icon(Icons.show_chart), label: tr('tab_stats')),
              NavigationDestination(icon: const Icon(Icons.settings), label: tr('tab_settings')),
            ],
          ),
        );
      },
    );
  }
}

/// Zeigt den Abgleich: dreht sich beim Synchronisieren, warnt bei Fehlern und zeigt wartende Änderungen.
class _SyncButton extends StatelessWidget {
  const _SyncButton({required this.app});

  final AppState app;

  @override
  Widget build(BuildContext context) {
    final pending = app.pending;
    if (app.syncing) {
      return const Padding(
        padding: EdgeInsets.all(14),
        child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
      );
    }
    final failed = app.syncError != null;
    return IconButton(
      tooltip: failed ? tr('offline_hint') : (pending > 0 ? tr('sync_pending', [pending]) : tr('sync_now')),
      onPressed: app.syncNow,
      icon: Badge(
        isLabelVisible: pending > 0,
        label: Text('$pending'),
        child: Icon(failed ? Icons.cloud_off : Icons.cloud_done_outlined),
      ),
    );
  }
}

class TrainingTab extends StatelessWidget {
  const TrainingTab({super.key, required this.app});

  final AppState app;

  Future<void> _open(BuildContext context, String workoutId) async {
    await Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => WorkoutScreen(app: app, workoutId: workoutId)));
    app.changed();
  }

  /// Startet ein Workout. Gibt es Routinen oder mehrere Studios, wird vorher gefragt.
  Future<void> _start(BuildContext context) async {
    final repo = app.repo!;
    final gyms = repo.gyms();
    final routines = repo.routines();
    if (routines.isEmpty && gyms.length < 2) {
      await _open(context, repo.startWorkout(gymId: gyms.firstOrNull?.id));
      return;
    }
    final choice = await showModalBottomSheet<({String? routineId, String gymId})>(
      context: context,
      isScrollControlled: true,
      builder: (context) => _StartSheet(repo: repo),
    );
    if (choice == null || !context.mounted) return;
    final routine = choice.routineId == null ? null : repo.routine(choice.routineId!);
    await _open(context, repo.startWorkout(routineId: routine?.id, routineName: routine?.name ?? '', gymId: choice.gymId.isEmpty ? null : choice.gymId));
  }

  @override
  Widget build(BuildContext context) {
    final repo = app.repo!;
    final active = repo.activeWorkout();
    final theme = Theme.of(context);
    final last = repo.history(limit: 1);
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (active != null) ...[
          Card(
            color: theme.colorScheme.primaryContainer,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(tr('workout_running', [L10n.time(DateTime.parse(active['started_at'] as String))]),
                    style: theme.textTheme.titleMedium),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: () => _open(context, active['id'] as String),
                  icon: const Icon(Icons.play_arrow),
                  label: Text(tr('resume_workout')),
                ),
              ]),
            ),
          ),
        ] else
          SizedBox(
            height: 72,
            child: FilledButton.icon(
              onPressed: () => _start(context),
              icon: const Icon(Icons.add),
              label: Text(tr('start_workout'), style: theme.textTheme.titleLarge),
            ),
          ),
        const SizedBox(height: 8),
        Row(children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () => Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => RoutinesScreen(app: app))).then((_) => app.changed()),
              icon: const Icon(Icons.list_alt),
              label: Text(tr('routines_title')),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () => Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => GymsScreen(app: app))).then((_) => app.changed()),
              icon: const Icon(Icons.store),
              label: Text(tr('gyms_title')),
            ),
          ),
        ]),
        const SizedBox(height: 24),
        if (last.isNotEmpty && active == null)
          Card(
            child: ListTile(
              title: Text(L10n.dayLabel(last.first.startedAt)),
              subtitle: Text(workoutSummaryLine(last.first)),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.of(context)
                  .push(MaterialPageRoute<void>(builder: (_) => WorkoutDetailScreen(app: app, summary: last.first))),
            ),
          ),
      ],
    );
  }
}

/// Auswahl beim Start: Studio und Routine (oder freies Workout).
class _StartSheet extends StatefulWidget {
  const _StartSheet({required this.repo});

  final Repo repo;

  @override
  State<_StartSheet> createState() => _StartSheetState();
}

class _StartSheetState extends State<_StartSheet> {
  late final List<GymInfo> gyms = widget.repo.gyms();
  late String gymId = widget.repo.lastGymId() ?? (gyms.isEmpty ? '' : gyms.first.id);

  @override
  Widget build(BuildContext context) {
    final routines = widget.repo.routines();
    return SafeArea(
      child: ListView(
        shrinkWrap: true,
        padding: const EdgeInsets.all(16),
        children: [
          Text(tr('start_with'), style: Theme.of(context).textTheme.titleLarge),
          if (gyms.length > 1) ...[
            const SizedBox(height: 12),
            Wrap(spacing: 8, children: [
              for (final g in gyms)
                ChoiceChip(label: Text(g.name), selected: gymId == g.id, onSelected: (_) => setState(() => gymId = g.id)),
            ]),
          ],
          const SizedBox(height: 8),
          ListTile(
            leading: const Icon(Icons.add),
            title: Text(tr('free_workout')),
            onTap: () => Navigator.pop(context, (routineId: null, gymId: gymId)),
          ),
          for (final r in routines)
            ListTile(
              leading: const Icon(Icons.list_alt),
              title: Text(r.name),
              subtitle: Text(routineLine(r)),
              onTap: () => Navigator.pop(context, (routineId: r.id, gymId: gymId)),
            ),
        ],
      ),
    );
  }
}
