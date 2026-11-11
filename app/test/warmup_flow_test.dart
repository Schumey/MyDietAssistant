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
  late AppState app;

  setUp(() {
    L10n.lang = 'de';
    final local = openMemory();
    final server = FakeServer(local.schema.syncTables);
    server.put('exercise', {
      'id': 'e1', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'deleted': 0, 'name': 'Bankdrücken', 'kind': 'strength', 'catalog_key': '',
    });
    server.put('target', {
      'id': 't1', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'deleted': 0, 'exercise_id': 'e1', 'equipment_id': '',
      'weight': 60.0, 'reps': 8, 'sets': null, 'reason': '', 'reason_code': 'manual', 'reason_params': '{}',
    });
    app = AppState(_Creds(), openDb: () async => local, connector: (a, t) async => server);
  });

  testWidgets('planned warm-up sets come first at a percentage of the working weight, then the working sets', (tester) async {
    await tester.pumpWidget(HafsApp(app: app));
    await tester.pumpAndSettle();
    app.repo!.saveRoutine(name: 'Push', exercises: [
      RoutineExercise(exerciseId: 'e1', name: 'Bankdrücken', sets: 3, warmupSets: 2, warmupReps: 5, warmupPct: 50),
    ]);
    await tester.tap(find.text('Workout starten'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Push'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Aufwärmen 0/2'), findsOneWidget); // the plan card announces them
    await tester.tap(find.text('Bankdrücken'));
    await tester.pumpAndSettle();
    for (var i = 0; i < 3; i++) {
      await tester.tap(find.text('Satz fertig'));
      await tester.pump(const Duration(milliseconds: 300));
    }
    final sets = app.repo!.local.rows('SELECT kind, weight, reps FROM workout_set ORDER BY done_at, set_no');
    expect([for (final s in sets) (s['kind'], s['weight'], s['reps'])], [
      ('warmup', 30.0, 5), // 50 % of 60 kg
      ('warmup', 30.0, 5),
      ('work', 60.0, 8), // back to the suggestion, with its target reps
    ]);
    await tester.tap(find.text('Stop')); // the rest after the work set
    await tester.pumpAndSettle();
  });

  testWidgets('after the planned sets the main button moves on to the next exercise; an extra set stays possible', (tester) async {
    await tester.pumpWidget(HafsApp(app: app));
    await tester.pumpAndSettle();
    app.repo!.local.upsert('exercise', {
      'id': 'e2', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'name': 'Kniebeuge', 'kind': 'strength'}, dirty: false);
    app.repo!.saveRoutine(name: 'Mix', exercises: [
      RoutineExercise(exerciseId: 'e1', name: 'Bankdrücken', sets: 1),
      RoutineExercise(exerciseId: 'e2', name: 'Kniebeuge', sets: 1),
    ]);
    await tester.tap(find.text('Workout starten'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Mix'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Bankdrücken'));
    await tester.pumpAndSettle();
    expect(find.text('Satz fertig'), findsOneWidget);
    expect(find.text('Nächste Übung'), findsNothing);
    await tester.tap(find.text('Satz fertig'));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Satz fertig'), findsNothing); // the one planned set is done
    expect(find.text('Zusätzlichen Satz erfassen'), findsOneWidget);
    await tester.tap(find.text('Nächste Übung'));
    await tester.pumpAndSettle();
    expect(find.text('Satz fertig'), findsOneWidget); // now Kniebeuge is open
    await tester.tap(find.text('Satz fertig'));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Nächste Übung'), findsNothing); // nothing planned left: the button finishes the workout
    expect(find.text('Workout beenden'), findsWidgets);
    await tester.tap(find.text('Zusätzlichen Satz erfassen'));
    await tester.pump(const Duration(milliseconds: 300));
    expect(app.repo!.local.rows('SELECT id FROM workout_set WHERE exercise_id = ?', ['e2']), hasLength(2));
    await tester.tap(find.text('Stop'));
    await tester.pumpAndSettle();
  });

  testWidgets('cable exercise: choose the rope, it is saved with the sets and offered again next time', (tester) async {
    await tester.pumpWidget(HafsApp(app: app));
    await tester.pumpAndSettle();
    app.repo!.local.upsert('exercise', {
      'id': 'k1', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'name': 'Trizepsdrücken am Kabel', 'kind': 'strength', 'equipment_type': 'cable'}, dirty: false);
    app.repo!.saveRoutine(name: 'Arme', exercises: [RoutineExercise(exerciseId: 'k1', name: 'Trizepsdrücken am Kabel', sets: 3)]);
    await tester.tap(find.text('Workout starten'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Arme'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Trizepsdrücken am Kabel'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Seil/Stange'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Seil'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Satz fertig'));
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.text('Satz fertig')); // the choice stays for the next set
    await tester.pump(const Duration(milliseconds: 300));
    expect([for (final r in app.repo!.local.rows('SELECT attachment FROM workout_set ORDER BY done_at, set_no')) r['attachment']], ['rope', 'rope']);
    expect(find.textContaining('· Seil'), findsWidgets); // shown behind the set
    await tester.tap(find.text('Stop'));
    await tester.pumpAndSettle();
  });
}
