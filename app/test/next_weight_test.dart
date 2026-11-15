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
  late AppState app;
  late FakeServer server;

  setUp(() {
    L10n.lang = 'de';
    final local = openMemory();
    server = FakeServer(local.schema.syncTables);
    server.put('exercise', {
      'id': 'e1', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'deleted': 0, 'name': 'Bankdrücken', 'kind': 'strength', 'catalog_key': '',
    });
    server.put('target', {
      'id': 't1', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'deleted': 0, 'exercise_id': 'e1', 'equipment_id': '',
      'weight': 60.0, 'reps': 8, 'sets': null, 'reason': '', 'reason_code': 'manual', 'reason_params': '{}',
    });
    app = AppState(_Creds(), openDb: () async => local, connector: (a, t) async => server);
  });

  Future<void> openExercise(WidgetTester tester) async {
    await tester.pumpWidget(HafsApp(app: app));
    await tester.pumpAndSettle();
    app.repo!.saveRoutine(name: 'Push', exercises: [RoutineExercise(exerciseId: 'e1', name: 'Bankdrücken', sets: 3)]);
    await tester.tap(find.text('Workout starten'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Push'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Bankdrücken'));
    await tester.pumpAndSettle();
  }

  testWidgets('the next weight can be set from the workout; the suggestion shows the new value after the sync', (tester) async {
    await openExercise(tester);
    expect(find.textContaining('60 kg × 8'), findsOneWidget);
    await tester.tap(find.byKey(const Key('next-weight')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), '65,5');
    await tester.tap(find.text('Speichern'));
    await tester.pumpAndSettle();
    expect(server.targetSets, [
      {'exercise_id': 'e1', 'weight': 65.5}
    ]);
    expect(find.textContaining('65,5 kg × 8'), findsOneWidget);
  });

  testWidgets('without a connection the change is refused with a message and the suggestion stays', (tester) async {
    await openExercise(tester);
    server.offline = true;
    await tester.tap(find.byKey(const Key('next-weight')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), '70');
    await tester.tap(find.text('Speichern'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Nicht gespeichert'), findsOneWidget);
    expect(find.textContaining('60 kg × 8'), findsOneWidget);
  });
}
