import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/app_state.dart';
import 'package:hafs/credentials.dart';
import 'package:hafs/history_calendar.dart';
import 'package:hafs/history_screen.dart';
import 'package:hafs/l10n.dart';
import 'package:hafs/repo.dart';

import 'support.dart';

class _Creds implements CredentialStore {
  @override
  Future<({String address, String token})?> load() async => null;

  @override
  Future<void> save(String address, String token) async {}

  @override
  Future<void> clear() async {}
}

void main() {
  test('month grid: weeks start on Monday, padded with nulls', () {
    final g = monthGrid(DateTime(2026, 11)); // 1 Nov 2026 is a Sunday
    expect(g.every((w) => w.length == 7), isTrue);
    expect(g.first.indexOf(DateTime(2026, 11, 1)), 6);
    expect(g.first.take(6).every((d) => d == null), isTrue);
    expect(g.expand((w) => w).whereType<DateTime>().length, 30);
    final feb = monthGrid(DateTime(2027, 2)); // 1 Feb 2027 is a Monday, 28 days -> 4 full weeks
    expect(feb.length, 4);
    expect(feb.first.first, DateTime(2027, 2, 1));
  });

  group('history tab', () {
    late AppState app;

    setUp(() async {
      L10n.lang = 'de';
      app = AppState(_Creds(), openDb: () async => openMemory());
      await app.start();
      app.local!.upsert('exercise', {
        'id': 'e', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'name': 'Bank', 'kind': 'strength',
      }, dirty: false);
    });

    void workout(DateTime day) {
      final r = Repo(app.local!, clock: () => day);
      final w = r.startWorkout();
      r.addSet(workoutId: w, exerciseId: 'e', weight: 50, reps: 8);
      r.finishWorkout(w);
    }

    Widget host() => MaterialApp(home: Scaffold(body: HistoryTab(app: app)));

    testWidgets('list shows older workouts on demand', (tester) async {
      tester.view.physicalSize = const Size(800, 40000);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);
      for (var i = 0; i < 130; i++) {
        workout(DateTime(2025, 1, 1).add(Duration(days: i)));
      }
      await tester.pumpWidget(host());
      expect(find.byType(ListTile), findsNWidgets(100));
      expect(find.text('Ältere anzeigen'), findsOneWidget);
      await tester.tap(find.text('Ältere anzeigen'));
      await tester.pump();
      expect(find.byType(ListTile), findsNWidgets(130));
      expect(find.text('Ältere anzeigen'), findsNothing);
    });

    testWidgets('calendar marks workout days, navigates months and opens a workout', (tester) async {
      final now = DateTime.now();
      workout(DateTime(now.year, now.month, 1, 18));
      await tester.pumpWidget(host());
      await tester.tap(find.text('Kalender'));
      await tester.pumpAndSettle();
      expect(find.text('1 Workouts in diesem Monat'), findsOneWidget);
      await tester.tap(find.byTooltip('<'));
      await tester.pump();
      expect(find.text('0 Workouts in diesem Monat'), findsOneWidget);
      await tester.tap(find.byTooltip('>'));
      await tester.pump();
      await tester.tap(find.text('1').first);
      await tester.pumpAndSettle();
      expect(find.text('Bank'), findsWidgets); // the workout detail opened
    });
  });
}
