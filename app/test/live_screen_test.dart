import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/app_state.dart';
import 'package:hafs/credentials.dart';
import 'package:hafs/l10n.dart';
import 'package:hafs/main.dart';
import 'package:hafs/workout_live.dart';

import 'support.dart';

class _Creds implements CredentialStore {
  @override
  Future<({String address, String token})?> load() async => (address: 'ha.local', token: 't');

  @override
  Future<void> save(String address, String token) async {}

  @override
  Future<void> clear() async {}
}

class _Notifier implements LiveNotifier {
  final List<LiveEntry> shown = [];
  int cancels = 0;

  @override
  Future<void> show(LiveEntry entry) async => shown.add(entry.copy());

  @override
  Future<void> cancel() async => cancels++;
}

void main() {
  late AppState app;
  late MemoryLiveStore store;
  late _Notifier notifier;

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
    store = MemoryLiveStore();
    notifier = _Notifier();
    app = AppState(_Creds(), openDb: () async => local, connector: (a, t) async => server, liveStore: store, liveNotifier: notifier);
  });

  Future<void> openExercise(WidgetTester tester) async {
    await tester.pumpWidget(HafsApp(app: app));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Workout starten'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Übung hinzufügen'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Bankdrücken'));
    await tester.pumpAndSettle();
  }

  testWidgets('choosing an exercise and changing values in the app update the notification; finishing removes it', (tester) async {
    await openExercise(tester);
    expect(notifier.shown.last.exerciseName, 'Bankdrücken');
    expect(notifier.shown.last.weight, 60);
    await tester.tap(find.byIcon(Icons.add).last); // reps +
    await tester.pumpAndSettle();
    expect(notifier.shown.last.reps, 9);
    expect((await app.live!.current())!.reps, 9);

    await tester.tap(find.text('Satz fertig'));
    await tester.pump(const Duration(milliseconds: 300));
    expect(notifier.shown.last.setNo, 2);
    await tester.tap(find.text('Stop')); // rest after the set
    await tester.pumpAndSettle();

    await tester.tap(find.text('Workout beenden'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Beenden').last);
    await tester.pumpAndSettle();
    expect(await app.live!.current(), isNull);
    expect(notifier.cancels, greaterThan(0));
  });

  testWidgets('buttons of the notification (set done, weight, reps) show up in the open screen', (tester) async {
    await openExercise(tester);
    // what the background handler does: it works on the same database and the stored entry
    await tester.runAsync(() async {
      await app.live!.handle(LiveAction.repsPlus);
      await app.live!.handle(LiveAction.repsPlus);
      await app.live!.handle(LiveAction.done);
    });
    await tester.pump(const Duration(seconds: 2)); // the screen polls every second
    await tester.pump(const Duration(milliseconds: 100));
    expect(find.textContaining('Satz 1: 60'), findsOneWidget); // the set card of the exercise
    expect(find.textContaining('Bankdrücken · Satz 2'), findsOneWidget); // the panel moved on to the next set
    expect(find.textContaining('10'), findsWidgets); // reps were raised twice in the notification
    await tester.tap(find.text('Stop'));
    await tester.pumpAndSettle();
  });
}
