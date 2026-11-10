import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/app_state.dart';
import 'package:hafs/credentials.dart';
import 'package:hafs/db.dart';
import 'package:hafs/l10n.dart';
import 'package:hafs/main.dart';
import 'package:hafs/repo.dart';
import 'package:hafs/repo_edit.dart';

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
  group('repository', () {
    late LocalDb local;
    late Repo repo;

    setUp(() {
      L10n.lang = 'de';
      local = openMemory();
      repo = Repo(local, clock: () => DateTime(2026, 11, 10, 18));
      local.upsert('exercise', {'id': 'e1', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'name': 'Bankdrücken', 'kind': 'strength', 'catalog_key': 'bench'}, dirty: false);
    });

    tearDown(() => local.close());

    test('create an exercise, name check is case-insensitive', () {
      expect(repo.exerciseNameTaken('bankdrücken'), isTrue);
      expect(repo.exerciseNameTaken('Neu'), isFalse);
      final e = repo.createExercise(name: ' Neu ', kind: 'time', primary: ['abs', 'obliques']);
      expect(e.name, 'Neu');
      final row = local.row('SELECT * FROM exercise WHERE id = ?', [e.id])!;
      expect((row['kind'], row['muscles_primary'], row['catalog_key'], row['dirty']), ('time', 'abs obliques', '', 1));
      expect(repo.exerciseNameTaken('NEU'), isTrue);
      expect(repo.exercises().map((x) => x.name), contains('Neu'));
    });

    test('catalog exercises cannot be edited, custom ones can', () {
      final mine = repo.createExercise(name: 'Meine');
      repo.updateExercise(mine.id, name: 'Meine 2', kind: 'bodyweight', primary: ['chest']);
      expect(local.row('SELECT name, kind, muscles_primary FROM exercise WHERE id = ?', [mine.id]), {'name': 'Meine 2', 'kind': 'bodyweight', 'muscles_primary': 'chest'});
      repo.updateExercise('e1', name: 'Hacked');
      expect(local.row('SELECT name FROM exercise WHERE id = ?', ['e1'])!['name'], 'Bankdrücken');
    });

    test('edit a set: weight, reps, clearing the weight, duration', () {
      final w = repo.startWorkout();
      final s = repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 8);
      repo.editSet(s, weight: 62.5, reps: 6);
      var set = repo.workoutDetail(w).single.sets.single;
      expect((set.weight, set.reps), (62.5, 6));
      repo.editSet(s, clearWeight: true);
      set = repo.workoutDetail(w).single.sets.single;
      expect((set.weight, set.reps), (null, 6));
      repo.editSet(s, durationSeconds: 90);
      expect(repo.workoutDetail(w).single.sets.single.durationSeconds, 90);
      expect(local.row('SELECT dirty FROM workout_set WHERE id = ?', [s])!['dirty'], 1);
    });

    test('delete a workout: tombstones for workout and sets, gone from the history', () {
      final w = repo.startWorkout();
      repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 8);
      repo.finishWorkout(w);
      expect(repo.history(), hasLength(1));
      repo.deleteWorkout(w);
      expect(repo.history(), isEmpty);
      expect(local.row('SELECT COUNT(*) c FROM workout_set WHERE deleted = 0')!['c'], 0);
      expect(local.row('SELECT deleted, dirty FROM workout WHERE id = ?', [w]), {'deleted': 1, 'dirty': 1});
    });

    test('note', () {
      final w = repo.startWorkout();
      expect(repo.workoutNote(w), '');
      repo.setWorkoutNote(w, '  gut gelaufen ');
      expect(repo.workoutNote(w), 'gut gelaufen');
    });
  });

  group('screens', () {
    late AppState app;

    setUp(() {
      L10n.lang = 'de';
      final local = openMemory();
      final server = FakeServer(local.schema.syncTables);
      server.put('exercise', {'id': 'e1', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'deleted': 0, 'name': 'Bankdrücken', 'kind': 'strength', 'catalog_key': 'bench'});
      app = AppState(_Creds(), openDb: () async => local, connector: (a, t) async => server);
    });

    testWidgets('create a custom exercise from the picker and use it', (tester) async {
      await tester.pumpWidget(HafsApp(app: app));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Workout starten'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Übung hinzufügen'));
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextField), 'Klimmzug an Ringen');
      await tester.pumpAndSettle();
      expect(find.text('Keine Übung gefunden'), findsOneWidget);
      await tester.tap(find.text('Neue Übung').last);
      await tester.pumpAndSettle();
      // name is prefilled from the search
      expect(find.widgetWithText(TextField, 'Klimmzug an Ringen'), findsOneWidget);
      await tester.tap(find.text('Brust'));
      await tester.tap(find.text('Speichern'));
      await tester.pumpAndSettle();
      // the new exercise is selected in the workout
      expect(find.textContaining('Klimmzug an Ringen'), findsWidgets);
      expect(find.text('Satz fertig'), findsOneWidget);
      final row = app.repo!.local.row("SELECT kind, muscles_primary FROM exercise WHERE name = 'Klimmzug an Ringen'")!;
      expect(row, {'kind': 'strength', 'muscles_primary': 'chest'});
    });

    testWidgets('an existing name is refused', (tester) async {
      await tester.pumpWidget(HafsApp(app: app));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Workout starten'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Übung hinzufügen'));
      await tester.pumpAndSettle();
      await tester.tap(find.byTooltip('Neue Übung'));
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextField), 'bankdrücken');
      await tester.tap(find.text('Speichern'));
      await tester.pumpAndSettle();
      expect(find.text('Diese Übung gibt es schon'), findsOneWidget);
    });

    testWidgets('correct a set in the history, add a note, delete the workout', (tester) async {
      final repo = (await _started(tester, app)).$1;
      final w = repo.startWorkout();
      repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 8);
      repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 7);
      repo.finishWorkout(w);
      app.changed();
      await tester.tap(find.text('Verlauf'));
      await tester.pumpAndSettle();
      await tester.tap(find.textContaining('2 Sätze'));
      await tester.pumpAndSettle();
      expect(find.text('Satz 2: 60 kg × 7'), findsOneWidget);

      // correct set 2
      await tester.tap(find.text('Satz 2: 60 kg × 7'));
      await tester.pumpAndSettle();
      await tester.enterText(find.widgetWithText(TextField, 'Gewicht (kg)'), '62,5');
      await tester.enterText(find.widgetWithText(TextField, 'Wiederholungen'), '6');
      await tester.tap(find.text('Speichern'));
      await tester.pumpAndSettle();
      expect(find.text('Satz 2: 62,5 kg × 6'), findsOneWidget);

      // delete set 1
      await tester.tap(find.text('Satz 1: 60 kg × 8'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Satz löschen'));
      await tester.pumpAndSettle();
      expect(find.text('Satz 1: 62,5 kg × 6'), findsOneWidget); // renumbered

      // note
      await tester.tap(find.text('Notiz'));
      await tester.pumpAndSettle();
      await tester.enterText(find.byType(TextField), 'Schulter zwickt');
      await tester.tap(find.text('Speichern'));
      await tester.pumpAndSettle();
      expect(find.text('Schulter zwickt'), findsOneWidget);
      expect(repo.workoutNote(w), 'Schulter zwickt');

      // delete the workout
      await tester.tap(find.byTooltip('Workout löschen'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Löschen'));
      await tester.pumpAndSettle();
      expect(find.text('Noch keine Workouts'), findsOneWidget);
      expect(repo.history(), isEmpty);
    });
  });
}

Future<(Repo,)> _started(WidgetTester tester, AppState app) async {
  await tester.pumpWidget(HafsApp(app: app));
  await tester.pumpAndSettle();
  return (app.repo!,);
}
