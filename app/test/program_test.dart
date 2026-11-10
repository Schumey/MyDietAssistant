import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/app_state.dart';
import 'package:hafs/credentials.dart';
import 'package:hafs/l10n.dart';
import 'package:hafs/main.dart';
import 'package:hafs/repo.dart';
import 'package:hafs/repo_gym.dart';
import 'package:hafs/repo_program.dart';

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
  late AppState app;
  late Repo repo;
  late String a, b, c;

  setUp(() async {
    L10n.lang = 'de';
    final local = openMemory();
    final server = FakeServer(local.schema.syncTables);
    server.put('exercise', {
      'id': 'e1', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'deleted': 0, 'name': 'Bankdrücken', 'kind': 'strength', 'catalog_key': '',
    });
    app = AppState(_Creds(), openDb: () async => local, connector: (x, y) async => server);
  });

  /// Plain tests start the app themselves; widget tests let HafsApp do it and call this afterwards.
  void seed() {
    repo = app.repo!;
    RoutineExercise ex() => RoutineExercise(exerciseId: 'e1', name: 'Bankdrücken');
    a = repo.saveRoutine(name: 'Push', exercises: [ex()]);
    b = repo.saveRoutine(name: 'Pull', exercises: [ex()]);
    c = repo.saveRoutine(name: 'Beine', exercises: [ex()]);
  }

  Future<void> boot() async {
    await app.start();
    seed();
  }

  /// A finished workout of the routine at [day].
  void did(String routineId, DateTime day) {
    final r = Repo(repo.local, clock: () => day);
    final w = r.startWorkout(routineId: routineId);
    r.addSet(workoutId: w, exerciseId: 'e1', weight: 50, reps: 8);
    r.finishWorkout(w);
  }

  test('save, order, remove', () async {
    await boot();
    final p = repo.saveProgram(name: 'PPL', routineIds: [b, a, c]);
    expect(repo.programs().single.routineIds, [b, a, c]);
    repo.saveProgram(id: p, name: 'PPL', routineIds: [a, b]);
    expect(repo.programs().single.routineIds, [a, b]);
    expect(repo.local.row('SELECT program_id FROM routine WHERE id = ?', [c])!['program_id'], isNull);
    expect(repo.routines(), hasLength(3)); // routines survive
  });

  test('a routine belongs to one program only', () async {
    await boot();
    final p1 = repo.saveProgram(name: 'X', routineIds: [a, b]);
    final p2 = repo.saveProgram(name: 'Y', routineIds: [b, c]);
    expect(repo.programs().firstWhere((p) => p.id == p2).routineIds, [b, c]);
    expect(repo.programs().firstWhere((p) => p.id == p1).routineIds, [a]);
  });

  test('next routine rotates and wraps; free workouts do not count', () async {
    await boot();
    final p = repo.saveProgram(name: 'PPL', routineIds: [a, b, c]);
    expect(repo.nextRoutineId(p), a);
    did(a, DateTime(2026, 11, 2, 18));
    expect(repo.nextRoutineId(p), b);
    did(b, DateTime(2026, 11, 4, 18));
    did(c, DateTime(2026, 11, 6, 18));
    expect(repo.nextRoutineId(p), a); // wrapped around
    final r = Repo(repo.local, clock: () => DateTime(2026, 11, 8, 18));
    final w = r.startWorkout();
    r.addSet(workoutId: w, exerciseId: 'e1', weight: 50, reps: 8);
    r.finishWorkout(w);
    expect(repo.nextRoutineId(p), a);
  });

  test('an unfinished workout does not advance the rotation', () async {
    await boot();
    final p = repo.saveProgram(name: 'PPL', routineIds: [a, b]);
    repo.startWorkout(routineId: a);
    expect(repo.nextRoutineId(p), a);
  });

  test('suggestion: none without a program; deleting a program frees its routines', () async {
    await boot();
    expect(repo.suggestedRoutineId(), isNull);
    final p = repo.saveProgram(name: 'PPL', routineIds: [b, a]);
    expect(repo.suggestedRoutineId(), b);
    repo.deleteProgram(p);
    expect(repo.programs(), isEmpty);
    expect(repo.suggestedRoutineId(), isNull);
    expect(repo.routines(), hasLength(3));
  });

  testWidgets('start sheet puts the next routine first', (tester) async {
    await tester.pumpWidget(HafsApp(app: app));
    await tester.pumpAndSettle();
    seed();
    final p = repo.saveProgram(name: 'PPL', routineIds: [a, b, c]);
    did(a, DateTime(2026, 11, 2, 18));
    expect(repo.nextRoutineId(p), b);
    app.changed();
    await tester.pumpAndSettle();
    await tester.tap(find.text('Workout starten'));
    await tester.pumpAndSettle();
    final titles = tester.widgetList<ListTile>(find.byType(ListTile)).map((t) => (t.title as Text).data).toList();
    expect(titles.skipWhile((t) => t != 'Freies Workout').toList(), ['Freies Workout', 'Pull', 'Push', 'Beine']);
    expect(find.textContaining('Als Nächstes'), findsOneWidget);
  });

  testWidgets('create a program on screen', (tester) async {
    await tester.pumpWidget(HafsApp(app: app));
    await tester.pumpAndSettle();
    seed();
    await tester.tap(find.text('Routinen'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Programme'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Noch kein Programm'), findsOneWidget);
    await tester.tap(find.text('Programm anlegen'));
    await tester.pumpAndSettle();
    await tester.enterText(find.widgetWithText(TextField, 'Name des Programms'), 'PPL');
    await tester.tap(find.widgetWithText(CheckboxListTile, 'Push'));
    await tester.tap(find.widgetWithText(CheckboxListTile, 'Pull'));
    await tester.pump();
    await tester.tap(find.text('Speichern'));
    await tester.pumpAndSettle();
    expect(find.text('PPL'), findsOneWidget);
    expect(find.text('Push → Pull'), findsOneWidget);
    expect(repo.programs().single.routineIds, hasLength(2));
  });
}
