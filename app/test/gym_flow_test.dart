import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/app_state.dart';
import 'package:hafs/credentials.dart';
import 'package:hafs/l10n.dart';
import 'package:hafs/main.dart';
import 'package:hafs/repo_gym.dart';
import 'package:hafs/steps.dart';

import 'support.dart';

class _Creds implements CredentialStore {
  @override
  Future<({String address, String token})?> load() async => (address: 'ha.local', token: 't');

  @override
  Future<void> save(String address, String token) async {}

  @override
  Future<void> clear() async {}
}

/// Studio, Gerät mit Stufen und Routine anlegen und damit ein Workout fahren.
void main() {
  late AppState app;

  setUp(() {
    L10n.lang = 'de';
    final local = openMemory();
    final server = FakeServer(local.schema.syncTables);
    for (final e in [('e1', 'Flachbankdrücken Langhantel'), ('e2', 'Kniebeuge')]) {
      server.put('exercise', {
        'id': e.$1, 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'deleted': 0, 'name': e.$2, 'kind': 'strength', 'catalog_key': '',
      });
    }
    app = AppState(_Creds(), openDb: () async => local, connector: (a, t) async => server);
  });

  Future<void> settle(WidgetTester t) => t.pumpAndSettle();

  testWidgets('gym, equipment with steps, routine, workout from the routine', (tester) async {
    await tester.pumpWidget(HafsApp(app: app));
    await settle(tester);

    // Studio anlegen
    await tester.tap(find.text('Studios und Geräte'));
    await settle(tester);
    expect(find.textContaining('Noch kein Studio'), findsOneWidget);
    await tester.tap(find.text('Studio hinzufügen'));
    await settle(tester);
    await tester.enterText(find.byType(TextField), 'Studio A');
    await tester.tap(find.text('Speichern'));
    await settle(tester);
    expect(find.text('Studio A'), findsOneWidget);

    // Gerät mit Gewichtsstufen
    await tester.tap(find.text('Studio A'));
    await settle(tester);
    await tester.tap(find.text('Gerät hinzufügen'));
    await settle(tester);
    await tester.enterText(find.widgetWithText(TextField, 'Name des Geräts'), 'Brustpresse');
    await tester.enterText(find.widgetWithText(TextField, 'Gewichtsstufen'), '20-100/10');
    await tester.tap(find.text('Übungen an diesem Gerät'));
    await settle(tester);
    await tester.tap(find.text('Flachbankdrücken Langhantel'));
    await tester.tap(find.text('OK'));
    await settle(tester);
    expect(find.text('1 Übungen'), findsOneWidget);
    await tester.tap(find.text('Speichern'));
    await settle(tester);
    expect(find.text('Maschine · 20–100 kg in 10er-Schritten'), findsOneWidget);
    expect(app.repo!.gyms().single.equipmentCount, 1);

    // zurück zum Training, Routine anlegen
    await tester.tap(find.byType(BackButton).last);
    await settle(tester);
    await tester.tap(find.byType(BackButton).last);
    await settle(tester);
    await tester.tap(find.text('Trainingstage'));
    await settle(tester);
    expect(find.text('Noch kein Trainingstag'), findsOneWidget);
    await tester.tap(find.text('Trainingstag anlegen'));
    await settle(tester);
    await tester.enterText(find.widgetWithText(TextField, 'Name des Trainingstags'), 'Push');
    await tester.tap(find.text('Übung hinzufügen'));
    await settle(tester);
    await tester.tap(find.text('Flachbankdrücken Langhantel'));
    await settle(tester);
    expect(find.text('3'), findsOneWidget); // Sätze, Standard
    await tester.tap(find.text('Speichern'));
    await settle(tester);
    expect(find.text('Push'), findsOneWidget);
    expect(find.text('1 Übungen'), findsOneWidget);
    await tester.tap(find.byType(BackButton).last);
    await settle(tester);

    // Workout aus der Routine
    await tester.tap(find.text('Workout starten'));
    await settle(tester);
    expect(find.text('Freies Workout'), findsOneWidget);
    await tester.tap(find.text('Push'));
    await settle(tester);
    expect(find.text('Training · Studio A'), findsOneWidget); // the workout was started in the only gym
    expect(find.text('0/3 Sätze'), findsOneWidget);
    expect(find.text('8–12 Wdh.'), findsOneWidget);

    // geplante Übung wählen: das Gerät ist da, das Gewicht liegt auf der leichtesten Stufe
    await tester.tap(find.text('Flachbankdrücken Langhantel'));
    await settle(tester);
    expect(find.text('Gerät: Brustpresse'), findsOneWidget);
    expect(find.text('20'), findsOneWidget);
    expect(find.textContaining('Stufe'), findsNothing); // known steps: no step chip
    await tester.tap(find.byIcon(Icons.add).at(1));
    await tester.pump();
    expect(find.text('30'), findsOneWidget); // next step of the machine
    await tester.tap(find.text('Satz fertig'));
    await tester.pump(const Duration(milliseconds: 300));
    expect(find.text('1/3 Sätze'), findsOneWidget);
    expect(find.text('Satz 1: 30 kg × 8'), findsOneWidget);
    final set = app.repo!.local.row('SELECT equipment_id FROM workout_set')!;
    expect(set['equipment_id'], app.repo!.equipment(app.repo!.gyms().single.id).single.id);

    // Pause stoppen, Workout beenden
    await tester.tap(find.text('Stop'));
    await settle(tester);
    await tester.tap(find.text('Workout beenden'));
    await settle(tester);
    expect(find.text('Als Trainingstag speichern'), findsNothing); // it came from a routine
    await tester.tap(find.text('Beenden'));
    await settle(tester);
    expect(app.repo!.activeWorkout(), isNull);
    final w = app.repo!.history().single;
    expect(w.routineName, 'Push');
  });

  testWidgets('plate-loaded and stack machines can be entered in the app', (tester) async {
    await tester.pumpWidget(HafsApp(app: app));
    await settle(tester);
    final g = app.repo!.addGym('Studio A');
    app.changed();
    await tester.tap(find.text('Studios und Geräte'));
    await settle(tester);
    await tester.tap(find.text('Studio A'));
    await settle(tester);

    Future<void> pickType(String label) async {
      await tester.tap(find.byType(DropdownButtonFormField<String>));
      await settle(tester);
      await tester.tap(find.text(label).last);
      await settle(tester);
    }

    await tester.tap(find.text('Gerät hinzufügen'));
    await settle(tester);
    await tester.enterText(find.widgetWithText(TextField, 'Name des Geräts'), 'Beinpresse');
    await pickType('Maschine, Scheiben (Plate-Loaded)');
    expect(find.widgetWithText(TextField, 'Gewichtsstufen'), findsNothing);
    await tester.enterText(find.widgetWithText(TextField, 'Grundgewicht (kg)'), '50');
    await tester.enterText(find.widgetWithText(TextField, 'Vorhandene Scheiben (kg)'), '25 10 5');
    await tester.enterText(find.widgetWithText(TextField, 'Höchstgewicht (kg, optional)'), '250');
    await tester.tap(find.text('Speichern'));
    await settle(tester);
    var q = app.repo!.equipment(g).single;
    expect(q.type, 'machine_plate');
    expect(expandSteps(q.steps)!.take(3), [50, 60, 70]); // 2 x 5 kg
    expect(app.repo!.local.row('SELECT base_weight FROM equipment WHERE id = ?', [q.id])!['base_weight'], 50);

    // editing it again shows the plate fields, not a flattened list
    await tester.tap(find.text('Beinpresse'));
    await settle(tester);
    expect(find.widgetWithText(TextField, 'Vorhandene Scheiben (kg)'), findsOneWidget);
    await tester.tap(find.text('Speichern'));
    await settle(tester);
    expect(jsonDecode(app.repo!.equipment(g).single.steps), containsPair('plates', [25.0, 10.0, 5.0]));

    await tester.tap(find.text('Gerät hinzufügen'));
    await settle(tester);
    await tester.enterText(find.widgetWithText(TextField, 'Name des Geräts'), 'Latzug');
    await pickType('Maschine, Gewichtsblock (Stack)');
    await tester.enterText(find.widgetWithText(TextField, 'Gewichtsstufen'), '7-91/7');
    await tester.enterText(find.widgetWithText(TextField, 'Zusatzgewicht (optional)'), '2,5');
    await tester.tap(find.text('Speichern'));
    await settle(tester);
    q = app.repo!.equipment(g).firstWhere((e) => e.name == 'Latzug');
    expect(expandSteps(q.steps)!.take(4), [7, 9.5, 14, 16.5]);
  });

  testWidgets('free workout can be saved as a routine', (tester) async {
    await tester.pumpWidget(HafsApp(app: app));
    await settle(tester);
    await tester.tap(find.text('Workout starten'));
    await settle(tester);
    await tester.tap(find.text('Übung hinzufügen'));
    await settle(tester);
    await tester.tap(find.text('Kniebeuge'));
    await settle(tester);
    await tester.tap(find.text('Satz fertig'));
    await tester.pump(const Duration(milliseconds: 300));
    await tester.tap(find.text('Stop'));
    await settle(tester);
    await tester.tap(find.text('Workout beenden'));
    await settle(tester);
    await tester.tap(find.text('Als Trainingstag speichern'));
    await settle(tester);
    await tester.enterText(find.byType(TextField), 'Beine');
    await tester.tap(find.text('Speichern'));
    await settle(tester);
    final routines = app.repo!.routines();
    expect(routines.single.name, 'Beine');
    expect(routines.single.exercises.single.name, 'Kniebeuge');
  });

  testWidgets('several gyms: the start sheet asks which one', (tester) async {
    await tester.pumpWidget(HafsApp(app: app));
    await settle(tester);
    app.repo!.addGym('Studio A');
    final b = app.repo!.addGym('Studio B');
    app.changed();
    await settle(tester);
    await tester.tap(find.text('Workout starten'));
    await settle(tester);
    expect(find.text('Studio A'), findsOneWidget);
    await tester.tap(find.text('Studio B'));
    await tester.tap(find.text('Freies Workout'));
    await settle(tester);
    expect(find.text('Training · Studio B'), findsOneWidget);
    expect(app.repo!.workoutGym(app.repo!.activeWorkout()!['id'] as String), b);
  });
}
