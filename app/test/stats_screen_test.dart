import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/app_state.dart';
import 'package:hafs/credentials.dart';
import 'package:hafs/l10n.dart';
import 'package:hafs/repo.dart';
import 'package:hafs/repo_stats.dart';
import 'package:hafs/stats_screen.dart';

import 'support.dart';

class _Creds implements CredentialStore {
  @override
  Future<({String address, String token})?> load() async => null;

  @override
  Future<void> save(String address, String token) async {}

  @override
  Future<void> clear() async {}
}

void main() {
  final today = DateTime(2026, 11, 10, 12);
  late AppState app;

  setUp(() async {
    L10n.lang = 'de';
    app = AppState(_Creds(), openDb: () async => openMemory());
    await app.start();
    final local = app.local!;
    for (final e in [
      ('bench', 'Bankdrücken', 'chest', 'triceps shoulders'),
      ('row', 'Rudern', 'lats', 'biceps'),
    ]) {
      local.upsert('exercise', {
        'id': e.$1, 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'name': e.$2, 'kind': 'strength',
        'muscles_primary': e.$3, 'muscles_secondary': e.$4,
      }, dirty: false);
    }
  });

  /// A finished workout on [day] with the given sets of one exercise.
  void workout(DateTime day, String exercise, List<(double, int)> sets) {
    final r = Repo(app.local!, clock: () => day);
    final w = r.startWorkout();
    for (final s in sets) {
      r.addSet(workoutId: w, exerciseId: exercise, weight: s.$1, reps: s.$2);
    }
    r.finishWorkout(w);
  }

  Widget host(Widget child) => MaterialApp(home: Scaffold(body: child));

  testWidgets('empty state', (tester) async {
    await tester.pumpWidget(host(StatsTab(app: app, today: today)));
    expect(find.text('Noch keine Daten'), findsOneWidget);
  });

  testWidgets('muscle sets this week vs. average, exercise list', (tester) async {
    // last week: 4 sets bench; two weeks ago: 4 sets bench; this week: 3 sets rows
    workout(DateTime(2026, 11, 3, 18), 'bench', [(60, 8), (60, 8), (60, 8), (60, 8)]);
    workout(DateTime(2026, 10, 27, 18), 'bench', [(57.5, 8), (57.5, 8), (57.5, 8), (57.5, 8)]);
    workout(DateTime(2026, 11, 9, 18), 'row', [(50, 10), (50, 10), (50, 10)]);
    await tester.pumpWidget(host(StatsTab(app: app, today: today)));
    expect(find.text('Workouts pro Woche'), findsOneWidget);
    expect(find.text('Brust'), findsOneWidget);
    expect(find.text('Latissimus'), findsOneWidget);
    expect(find.text('Trizeps'), findsOneWidget); // secondary muscle of the bench
    // bench: not this week (0), average over 4 weeks = (4 + 4) / 4 = 2
    expect(find.text('0 · 2'), findsWidgets);
    // rows: 3 sets this week, no history before
    expect(find.text('3 · 0'), findsOneWidget);
    // the exercises are listed, most used first
    final tiles = tester.widgetList<ListTile>(find.byType(ListTile)).map((t) => (t.title as Text).data).toList();
    expect(tiles, ['Bankdrücken', 'Rudern']);
  });

  testWidgets('muscle average range can be widened', (tester) async {
    // 4 sets bench 6 weeks ago: outside 4 weeks, inside 12 weeks (avg 4 / 12 = 0.3)
    workout(DateTime(2026, 9, 29, 18), 'bench', [(60, 8), (60, 8), (60, 8), (60, 8)]);
    workout(DateTime(2026, 11, 9, 18), 'row', [(50, 10)]);
    await tester.pumpWidget(host(StatsTab(app: app, today: today)));
    expect(find.text('Brust'), findsNothing);
    await tester.tap(find.text('12 Wo.'));
    await tester.pump();
    expect(find.text('Brust'), findsOneWidget);
    expect(find.text('0 · 0,3'), findsOneWidget);
  });

  testWidgets('exercise screen: records, metric switch, recent workouts', (tester) async {
    workout(DateTime(2026, 11, 3, 18), 'bench', [(60, 8), (60, 8)]);
    workout(DateTime(2026, 11, 9, 18), 'bench', [(70, 3), (65, 6)]);
    tester.view.physicalSize = const Size(800, 3000); // tall enough that the lazy list builds every row
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    final e = app.repo!.exercise('bench')!;
    await tester.pumpWidget(host(ExerciseStatsScreen(app: app, exercise: e)));
    expect(find.text('Bankdrücken'), findsOneWidget);
    expect(find.text('Geschätztes 1RM'), findsWidgets);
    expect(find.text('Schwerstes Gewicht'), findsOneWidget);
    expect(find.text('70 kg'), findsOneWidget);
    expect(find.text('Größtes Volumen'), findsOneWidget);
    expect(find.text('1-RM'), findsNothing);
    expect(find.textContaining('1RM nach Epley'), findsOneWidget);
    await tester.tap(find.text('Gewicht'));
    await tester.pump();
    expect(find.textContaining('1RM nach Epley'), findsNothing);
    // two sessions listed, newest first
    final recent = tester.widgetList<ListTile>(find.byType(ListTile)).map((t) => (t.title as Text).data).toList();
    expect(recent.where((t) => t != null && t.contains('Nov.')).length, greaterThanOrEqualTo(2));
  });

  testWidgets('exercise screen: range and equipment filters', (tester) async {
    final local = app.local!;
    for (final q in [('q1', 'Maschine A'), ('q2', 'Maschine B')]) {
      local.upsert('equipment', {
        'id': q.$1, 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'gym_id': 'g', 'name': q.$2, 'type': 'machine',
      }, dirty: false);
    }
    final old = DateTime.now().subtract(const Duration(days: 400));
    final recent = DateTime.now().subtract(const Duration(days: 5));
    for (final w in [(old, 'q1', 40.0), (recent, 'q1', 50.0), (recent, 'q2', 90.0)]) {
      final r = Repo(app.local!, clock: () => w.$1);
      final id = r.startWorkout();
      r.addSet(workoutId: id, exerciseId: 'bench', equipmentId: w.$2, weight: w.$3, reps: 8);
      r.finishWorkout(id);
    }
    tester.view.physicalSize = const Size(800, 3000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    final e = app.repo!.exercise('bench')!;
    await tester.pumpWidget(host(ExerciseStatsScreen(app: app, exercise: e)));
    expect(find.text('Maschine A'), findsOneWidget);
    expect(find.text('Alle Geräte'), findsOneWidget);
    final before = find.byType(ListTile).evaluate().length;
    await tester.tap(find.text('3 Monate'));
    await tester.pump();
    expect(find.byType(ListTile).evaluate().length, before - 1); // the 400-day-old session drops out
    await tester.tap(find.text('Maschine B'));
    await tester.pump();
    expect(find.text('90 kg'), findsWidgets); // heaviest weight record is per selected equipment
  });

  test('queries: trained exercises, workout days, muscle sets', () {
    workout(DateTime(2026, 11, 3, 18), 'bench', [(60, 8)]);
    final repo = app.repo!;
    expect(repo.trainedExercises().single.id, 'bench');
    expect(repo.workoutDays(), hasLength(1));
    expect(repo.workoutDays(since: DateTime(2026, 11, 4)), isEmpty);
    final m = repo.muscleSets(DateTime(2026, 11, 1)).single;
    expect(m.primary, ['chest']);
    expect(m.secondary, ['triceps', 'shoulders']);
    expect(repo.statSets('bench').single.weight, 60);
    expect(repo.statSets('bench', equipmentId: 'x'), isEmpty);
  });
}
