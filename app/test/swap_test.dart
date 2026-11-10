import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/app_state.dart';
import 'package:hafs/credentials.dart';
import 'package:hafs/l10n.dart';
import 'package:hafs/main.dart';
import 'package:hafs/repo_gym.dart';

import 'support.dart';

class _Creds implements CredentialStore {
  @override
  Future<({String address, String token})?> load() async => (address: 'ha.local', token: 't');

  @override
  Future<void> save(String address, String token) async {}

  @override
  Future<void> clear() async {}
}

void main() {
  group("plate hint", plateHintTests);
  late AppState app;

  setUp(() {
    L10n.lang = 'de';
    final local = openMemory();
    final server = FakeServer(local.schema.syncTables);
    for (final e in [('e1', 'Bankdrücken'), ('e2', 'Kniebeuge'), ('e3', 'Rudern')]) {
      server.put('exercise', {
        'id': e.$1, 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'deleted': 0, 'name': e.$2, 'kind': 'strength', 'catalog_key': '',
      });
    }
    app = AppState(_Creds(), openDb: () async => local, connector: (a, t) async => server);
  });

  Future<void> start(WidgetTester tester) async {
    await tester.pumpWidget(HafsApp(app: app));
    await tester.pumpAndSettle();
    final repo = app.repo!;
    final r = repo.saveRoutine(name: 'Mix', exercises: [
      RoutineExercise(exerciseId: 'e1', name: 'Bankdrücken'),
      RoutineExercise(exerciseId: 'e2', name: 'Kniebeuge'),
    ]);
    await tester.tap(find.text('Workout starten'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Mix'));
    await tester.pumpAndSettle();
    expect(r, isNotEmpty);
  }

  testWidgets('skip removes a planned exercise from the screen', (tester) async {
    await start(tester);
    expect(find.text('Bankdrücken'), findsOneWidget);
    await tester.tap(find.byIcon(Icons.more_vert).first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Überspringen'));
    await tester.pumpAndSettle();
    expect(find.text('Bankdrücken'), findsNothing);
    expect(find.text('Kniebeuge'), findsOneWidget);
  });

  testWidgets('swap replaces the planned exercise and selects the new one', (tester) async {
    await start(tester);
    await tester.tap(find.byIcon(Icons.more_vert).first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Austauschen'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Rudern'));
    await tester.pumpAndSettle();
    expect(find.text('Bankdrücken'), findsNothing);
    expect(find.text('Rudern'), findsWidgets); // card + entry panel
    await tester.tap(find.text('Satz fertig'));
    await tester.pump(const Duration(milliseconds: 300));
    final sets = app.repo!.local.rows('SELECT exercise_id FROM workout_set');
    expect(sets.single['exercise_id'], 'e3');
    await tester.tap(find.text('Stop'));
    await tester.pumpAndSettle();
  });

  testWidgets('equipment busy offers an exercise for the same muscle', (tester) async {
    await start(tester);
    app.local!.upsert('exercise', {
      'id': 'e4', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'name': 'Fliegende', 'kind': 'strength', 'muscles_primary': 'chest', 'muscles_secondary': '',
    }, dirty: false);
    app.local!.upsert('exercise', {
      'id': 'e1', 'owner': 'u1', 'updated_at': '2026-01-02T00:00:00+00:00', 'name': 'Bankdrücken', 'kind': 'strength', 'muscles_primary': 'chest triceps', 'muscles_secondary': '',
    }, dirty: false);
    await tester.tap(find.byIcon(Icons.more_vert).first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Gerät besetzt'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Statt'), findsOneWidget);
    expect(find.text('Rudern'), findsNothing); // other muscle group
    await tester.tap(find.text('Fliegende'));
    await tester.pumpAndSettle();
    expect(find.text('Bankdrücken'), findsNothing);
    expect(find.text('Fliegende'), findsWidgets);
  });

  testWidgets('a note is saved with the next set only and shown in the history line', (tester) async {
    await start(tester);
    await tester.tap(find.text('Bankdrücken'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Notiz'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), 'links');
    await tester.tap(find.text('Speichern'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Satz fertig'));
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.text('Satz fertig'));
    await tester.pump(const Duration(milliseconds: 300));
    final notes = app.repo!.local.rows('SELECT note FROM workout_set ORDER BY done_at, set_no').map((r) => r['note']).toList();
    expect(notes, ['links', '']); // cleared after the first set
    expect(find.textContaining('· links'), findsOneWidget);
    await tester.tap(find.text('Stop'));
    await tester.pumpAndSettle();
  });

  testWidgets('exercises that already have sets cannot be swapped', (tester) async {
    await start(tester);
    await tester.tap(find.text('Bankdrücken'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Satz fertig'));
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.text('Stop'));
    await tester.pumpAndSettle();
    // only the second planned exercise still offers the menu
    expect(find.byIcon(Icons.more_vert), findsOneWidget);
  });
}

void plateHintTests() {
  late AppState app;

  setUp(() {
    L10n.lang = 'de';
    final local = openMemory();
    final server = FakeServer(local.schema.syncTables);
    server.put('exercise', {
      'id': 'e1', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'deleted': 0, 'name': 'Kniebeuge', 'kind': 'strength', 'catalog_key': '',
    });
    app = AppState(_Creds(), openDb: () async => local, connector: (a, t) async => server);
  });

  testWidgets('barbell equipment shows the plates per side', (tester) async {
    await tester.pumpWidget(HafsApp(app: app));
    await tester.pumpAndSettle();
    final repo = app.repo!;
    final g = repo.addGym('A');
    final q = repo.saveEquipment(gymId: g, name: 'Stange', type: 'barbell', steps: '');
    repo.setExercisesOf(q, {'e1'});
    final w = repo.startWorkout(gymId: g);
    repo.addSet(workoutId: w, exerciseId: 'e1', equipmentId: q, weight: 100, reps: 5);
    app.changed();
    await tester.pumpAndSettle();
    await tester.tap(find.text('Workout fortsetzen'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Kniebeuge').first);
    await tester.pumpAndSettle();
    expect(find.textContaining('Pro Seite: 25'), findsOneWidget);
  });
}
