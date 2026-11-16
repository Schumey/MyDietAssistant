import 'update_dialog.dart';
import 'package:flutter/material.dart';

import 'app_state.dart';
import 'gyms_screen.dart';
import 'history_screen.dart';
import 'l10n.dart';
import 'nutrition_view.dart';
import 'repo.dart';
import 'repo_gym.dart';
import 'repo_program.dart';
import 'routines_screen.dart';
import 'settings_screen.dart';
import 'stats_screen.dart';
import 'theme_tokens.dart';
import 'workout_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.app});

  final AppState app;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _tab = 0;
  bool _nutritionOpened = false;

  @override
  void initState() {
    super.initState();
    // Once a day (and silently) look for a newer app package on the connected Home Assistant.
    final updater = widget.app.updater;
    if (updater != null) {
      updater.checkDaily().then((offer) {
        if (offer != null && mounted) showUpdateDialog(context, updater, offer: offer);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final app = widget.app;
    return ListenableBuilder(
      listenable: app,
      builder: (context, _) {
        final nutrition = app.area == 'nutrition';
        if (nutrition) _nutritionOpened = true;
        return Scaffold(
          appBar: AppBar(
            title: AreaSwitch(app: app),
            actions: [if (!nutrition) _SyncButton(app: app)],
          ),
          // the nutrition page stays alive once opened (its WebView keeps the diary and the session)
          body: IndexedStack(index: nutrition ? 1 : 0, children: [
            switch (_tab) {
              0 => TrainingTab(app: app),
              1 => HistoryTab(app: app),
              2 => StatsTab(app: app),
              _ => SettingsTab(app: app),
            },
            if (_nutritionOpened) NutritionView(app: app) else const SizedBox.shrink(),
          ]),
          bottomNavigationBar: nutrition ? null : NavigationBar(
            selectedIndex: _tab,
            // like the nutrition page's bar (its six or seven tabs only fit without labels): label on the tab shown
            labelBehavior: NavigationDestinationLabelBehavior.onlyShowSelected,
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

/// The switch Nutrition | Training in the app bar, with the two halves of the logo (apple, dumbbell).
class AreaSwitch extends StatelessWidget {
  const AreaSwitch({super.key, required this.app});

  final AppState app;

  static const nutritionColor = HafsTokens.colorNutrition;
  static const trainingColor = HafsTokens.colorTraining;

  @override
  Widget build(BuildContext context) {
    final area = app.area;
    final narrow = MediaQuery.sizeOf(context).width < 360;
    return SegmentedButton<String>(
      showSelectedIcon: false,
      style: ButtonStyle(
        visualDensity: VisualDensity.compact,
        backgroundColor: WidgetStateProperty.resolveWith((s) =>
            s.contains(WidgetState.selected) ? (area == 'nutrition' ? nutritionColor : trainingColor) : null),
        foregroundColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? Colors.white : null),
      ),
      segments: [
        ButtonSegment(value: 'nutrition', icon: const Icon(Icons.restaurant), label: narrow ? null : Text(tr('area_nutrition')), tooltip: tr('area_nutrition')),
        ButtonSegment(value: 'training', icon: const Icon(Icons.fitness_center), label: narrow ? null : Text(tr('area_training')), tooltip: tr('area_training')),
      ],
      selected: {area},
      onSelectionChanged: (s) => app.setArea(s.first),
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
    if (repo.gyms().any((g) => g.zone.isNotEmpty)) await app.detectGym();
    if (!context.mounted) return;
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
        if (active == null && repo.suggestedRoutineId() != null) ...[
          const SizedBox(height: 8),
          Builder(builder: (context) {
            final next = repo.routine(repo.suggestedRoutineId()!);
            if (next == null) return const SizedBox.shrink();
            return FilledButton.tonalIcon(
              onPressed: () async {
                if (repo.gyms().any((g) => g.zone.isNotEmpty)) await app.detectGym();
                if (!context.mounted) return;
                final gym = repo.lastGymId() ?? repo.gyms().firstOrNull?.id;
                await _open(context, repo.startWorkout(routineId: next.id, routineName: next.name, gymId: gym));
              },
              icon: const Icon(Icons.skip_next),
              label: Text(tr('start_next', [next.name])),
            );
          }),
        ],
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
              label: FittedBox(fit: BoxFit.scaleDown, child: Text(tr('gyms_title'), maxLines: 1)),
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
    final suggested = widget.repo.suggestedRoutineId();
    final routines = [...widget.repo.routines()]..sort((a, b) => (b.id == suggested ? 1 : 0) - (a.id == suggested ? 1 : 0));
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
              subtitle: Text(r.id == suggested ? '${tr('next_in_program')} · ${routineLine(r)}' : routineLine(r)),
              selected: r.id == suggested,
              onTap: () => Navigator.pop(context, (routineId: r.id, gymId: gymId)),
            ),
        ],
      ),
    );
  }
}
