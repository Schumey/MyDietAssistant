import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/ai_plan.dart';
import 'package:hafs/app_state.dart';
import 'package:hafs/credentials.dart';
import 'package:hafs/l10n.dart';
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
  late FakeServer server;

  setUp(() async {
    L10n.lang = 'de';
    final local = openMemory();
    server = FakeServer(local.schema.syncTables);
    for (final e in [('e1', 'Bankdrücken'), ('e2', 'Rudern')]) {
      local.upsert('exercise', {
        'id': e.$1, 'owner': '', 'updated_at': '2026-01-01T00:00:00+00:00', 'deleted': 0, 'name': e.$2, 'kind': 'strength', 'catalog_key': '',
      }, dirty: false);
    }
    app = AppState(_Creds(), openDb: () async => local, connector: (a, t) async => server);
    await app.start();
  });

  Widget host() => MaterialApp(
        home: Builder(
          builder: (context) => Scaffold(body: TextButton(onPressed: () => showAiPlanDialog(context, app), child: const Text('open'))),
        ),
      );

  testWidgets('asks the AI, shows the draft and creates routines and a program', (tester) async {
    server.planDays = [
      {
        'name': 'Push',
        'exercises': [
          {'id': 'e1', 'name': 'Bankdrücken', 'sets': 4, 'reps_min': 6, 'reps_max': 10},
        ],
      },
      {
        'name': 'Pull',
        'exercises': [
          {'id': 'e2', 'name': 'Rudern', 'sets': 3, 'reps_min': 8, 'reps_max': 12},
        ],
      },
    ];
    await tester.pumpWidget(host());
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Keine Gewichte'), findsOneWidget); // the user sees what is sent
    await tester.tap(find.text('4'));
    await tester.tap(find.text('Vorschlag holen'));
    await tester.pumpAndSettle();
    expect(server.planRequests.single['days'], 4);
    expect(find.text('Entwurf der KI'), findsOneWidget);
    expect(find.text('Push'), findsOneWidget);
    await tester.tap(find.text('Übernehmen'));
    await tester.pumpAndSettle();
    final p = app.repo!.programs().single;
    expect(p.routineIds.length, 2);
    final push = app.repo!.routine(p.routineIds.first)!;
    expect((push.name, push.exercises.single.sets, push.exercises.single.repsMax), ('Push', 4, 10));
  });

  testWidgets('a failure is shown and nothing is created', (tester) async {
    server.planError = 'Home Assistant has no AI task set up (ai_task)';
    await tester.pumpWidget(host());
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Vorschlag holen'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Das hat nicht geklappt'), findsOneWidget);
    expect(app.repo!.programs(), isEmpty);
  });
}
