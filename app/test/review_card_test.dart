import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/app_state.dart';
import 'package:hafs/credentials.dart';
import 'package:hafs/l10n.dart';
import 'package:hafs/review_card.dart';

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
    app = AppState(_Creds(), openDb: () async => local, connector: (a, t) async => server);
    await app.start();
  });

  Future<void> pump(WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: ReviewCard(app: app))));
    await tester.pumpAndSettle();
  }

  testWidgets('nothing stands out: no card', (tester) async {
    await pump(tester);
    expect(find.text('Rückblick'), findsNothing);
  });

  testWidgets('stagnating exercises are listed; the AI summary comes only on request', (tester) async {
    server.reviewStagnating = [
      {'name': 'Bankdrücken', 'sessions': 4, 'weeks': 6, 'best': 100.0}
    ];
    await pump(tester);
    expect(find.text('Rückblick'), findsOneWidget);
    expect(find.textContaining('Bankdrücken: 4 Workouts in 6 Wochen ohne neue Bestleistung (bisher 100 kg)'), findsOneWidget);
    expect(find.text('KI-Text'), findsNothing);
    await tester.tap(find.byKey(const Key('review-ai')));
    await tester.pumpAndSettle();
    expect(find.text('KI-Text'), findsOneWidget);
  });

  testWidgets('offline: no card and no error', (tester) async {
    server.reviewStagnating = [
      {'name': 'Bankdrücken', 'sessions': 4, 'weeks': 6, 'best': 100.0}
    ];
    server.offline = true;
    await pump(tester);
    expect(find.text('Rückblick'), findsNothing);
  });
}
