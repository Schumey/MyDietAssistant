import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/app_state.dart';
import 'package:hafs/credentials.dart';
import 'package:hafs/ha_client.dart';
import 'package:hafs/l10n.dart';
import 'package:hafs/main.dart';

import 'support.dart';

class MemoryCredentials implements CredentialStore {
  ({String address, String token})? saved;

  @override
  Future<({String address, String token})?> load() async => saved;

  @override
  Future<void> save(String address, String token) async => saved = (address: address, token: token);

  @override
  Future<void> clear() async => saved = null;
}

/// Die Oberfläche von der Anmeldung bis zum beendeten Workout, gegen das Server-Double.
void main() {
  late FakeServer server;
  late MemoryCredentials creds;
  late AppState app;

  setUp(() {
    L10n.lang = 'de';
    creds = MemoryCredentials();
    final local = openMemory();
    server = FakeServer(local.schema.syncTables);
    server.put('exercise', {
      'id': 'e1', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'deleted': 0, 'name': 'Flachbankdrücken Langhantel',
      'kind': 'strength', 'catalog_key': 'bench_press_barbell',
    });
    server.put('exercise', {
      'id': 'e2', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'deleted': 0, 'name': 'Kniebeuge', 'kind': 'strength',
      'catalog_key': 'squat_barbell',
    });
    server.put('target', {
      'id': 't1', 'owner': 'u1', 'updated_at': '2026-11-09T10:00:00+00:00', 'deleted': 0, 'exercise_id': 'e1', 'equipment_id': '',
      'weight': 62.5, 'reps': 8, 'reason': 'Obere Grenze erreicht', 'reason_code': 'up',
      'reason_params': '{"from":60.0,"weight":62.5,"reps_max":8,"streak":1}',
    });
    app = AppState(creds, openDb: () async => local, connector: (a, t) async => server);
  });

  testWidgets('login, workout with a set, finish, history', (tester) async {
    await tester.pumpWidget(HafsApp(app: app));
    await tester.pumpAndSettle();

    // Anmeldung
    expect(find.text('Mit Home Assistant verbinden'), findsOneWidget);
    await tester.enterText(find.byType(TextField).at(0), 'ha.local:8123');
    await tester.enterText(find.byType(TextField).at(1), 'token');
    await tester.tap(find.text('Verbinden'));
    await tester.pumpAndSettle();
    expect(creds.saved?.address, 'ha.local:8123');
    expect(find.text('Workout starten'), findsOneWidget);

    // Workout starten, Übung wählen
    await tester.tap(find.text('Workout starten'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Übung hinzufügen'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), 'bank');
    await tester.pumpAndSettle();
    expect(find.text('Kniebeuge'), findsNothing);
    await tester.tap(find.text('Flachbankdrücken Langhantel'));
    await tester.pumpAndSettle();

    // Vorschlag des Servers ist vorbelegt und wird begründet angezeigt
    expect(find.textContaining('Vorschlag: 62,5 kg × 8'), findsOneWidget);
    expect(find.text('62,5'), findsOneWidget);
    expect(find.text('8'), findsOneWidget);

    // Gewicht um eine Stufe erhöhen, Satz speichern
    await tester.tap(find.byIcon(Icons.add).at(1)); // + beim Gewicht
    await tester.pumpAndSettle();
    expect(find.text('65'), findsOneWidget);
    await tester.tap(find.text('Satz fertig'));
    await tester.pump(const Duration(milliseconds: 300)); // der Pausen-Timer läuft jetzt: kein pumpAndSettle
    expect(find.text('Satz 1: 65 kg × 8'), findsOneWidget);
    expect(find.text('1:30'), findsOneWidget); // Standardpause 90 s
    await tester.tap(find.text('+30 s'));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('2:00'), findsOneWidget);

    // Zweiter Satz mit weniger Wiederholungen
    await tester.tap(find.byIcon(Icons.remove).at(1));
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.text('Satz fertig'));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('Satz 2: 65 kg × 7'), findsOneWidget);

    // Beenden
    await tester.tap(find.text('Workout beenden'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Beenden'));
    await tester.pumpAndSettle();
    expect(find.text('Workout starten'), findsOneWidget);

    // Verlauf
    await tester.tap(find.text('Verlauf'));
    await tester.pumpAndSettle();
    expect(find.textContaining('2 Sätze'), findsOneWidget);

    // Alles ging zum Server
    expect(server.data['workout_set']!.length, 2);
    expect(server.data['workout']!.values.single['ended_at'], isNotNull);
    expect(app.pending, 0);
  });

  testWidgets('offline start: workout is recorded and sent later', (tester) async {
    creds.saved = (address: 'ha.local', token: 't');
    server.offline = true;
    await tester.pumpWidget(HafsApp(app: app));
    await tester.pumpAndSettle();
    expect(find.text('Workout starten'), findsOneWidget); // usable without a connection
    expect(app.syncError, isNotNull);

    await tester.tap(find.text('Workout starten'));
    await tester.pumpAndSettle();
    expect(find.text('Noch keine Sätze'), findsOneWidget);
    // ohne Sätze beenden: verworfen
    await tester.tap(find.text('Workout beenden'));
    await tester.pumpAndSettle();
    expect(find.text('Ohne Sätze wird das Workout verworfen.'), findsOneWidget);
    await tester.tap(find.text('Beenden'));
    await tester.pumpAndSettle();
    expect(app.repo!.history(), isEmpty);
  });

  testWidgets('wrong token shows the error and stays on the login screen', (tester) async {
    final failing = AppState(creds, openDb: () async => openMemory(), connector: (a, t) async => throw HaAuthException());
    await tester.pumpWidget(HafsApp(app: failing));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField).at(0), 'ha.local');
    await tester.enterText(find.byType(TextField).at(1), 'falsch');
    await tester.tap(find.text('Verbinden'));
    await tester.pumpAndSettle();
    expect(find.text('Token ungültig'), findsOneWidget);
    expect(creds.saved, isNull);
  });

  testWidgets('settings: phase is sent to the server', (tester) async {
    creds.saved = (address: 'ha.local', token: 't');
    await tester.pumpWidget(HafsApp(app: app));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Einstellungen'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Diät'));
    await tester.pumpAndSettle();
    expect(server.calls, contains('hafs/pref/set'));
    expect(app.phase, 'cut');
  });

  testWidgets('settings: progression rule is stored on the server and read back', (tester) async {
    creds.saved = (address: 'ha.local', token: 't');
    server.prefs['hit_fraction'] = '0.5';
    await tester.pumpWidget(HafsApp(app: app));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Einstellungen'));
    await tester.pumpAndSettle();
    expect(app.settings['hit_fraction'], '0.5'); // read during the first sync
    await tester.tap(find.text('¾ der Sätze'));
    await tester.pumpAndSettle();
    expect(server.prefs['hit_fraction'], '0.75');
    expect(app.settings['hit_fraction'], '0.75');
    await tester.drag(find.byType(ListView), const Offset(0, -400));
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(SwitchListTile, 'Diät: erst einen Satz streichen'));
    await tester.pumpAndSettle();
    expect(server.prefs['cut_drop_set_first'], '1');
  });
}
