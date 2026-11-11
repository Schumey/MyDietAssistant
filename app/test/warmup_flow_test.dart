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
}
