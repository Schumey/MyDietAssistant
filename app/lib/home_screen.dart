import 'package:flutter/material.dart';

import 'app_state.dart';
import 'history_screen.dart';
import 'l10n.dart';
import 'settings_screen.dart';
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
            _ => SettingsTab(app: app),
          },
          bottomNavigationBar: NavigationBar(
            selectedIndex: _tab,
            onDestinationSelected: (i) => setState(() => _tab = i),
            destinations: [
              NavigationDestination(icon: const Icon(Icons.fitness_center), label: tr('tab_training')),
              NavigationDestination(icon: const Icon(Icons.calendar_month), label: tr('tab_history')),
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
              onPressed: () => _open(context, repo.startWorkout()),
              icon: const Icon(Icons.add),
              label: Text(tr('start_workout'), style: theme.textTheme.titleLarge),
            ),
          ),
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
