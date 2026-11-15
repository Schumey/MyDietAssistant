import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/home_widget.dart';
import 'package:hafs/l10n.dart';
import 'package:hafs/nutrition_bridge.dart';

void main() {
  late List<String> js;
  late List<(String, double, double)> sums;
  late int updates;

  NutritionBridge bridge({Map<String, String>? scan, (String, String)? health}) => NutritionBridge(
        run: (s) async => js.add(s),
        summary: (d, k, g) async => sums.add((d, k, g)),
        scan: () async => scan ?? {'code': '4001234567890', 'error': ''},
        health: (days, ask) async => health ?? ('{"weights":[]}', ''),
        checkUpdate: () async => updates++,
      );

  setUp(() {
    js = [];
    sums = [];
    updates = 0;
  });

  String msg(String m, [List<Object?> a = const []]) => jsonEncode({'m': m, 'a': a});

  test('summary goes to the widget', () async {
    await bridge().handle(msg('summary', [jsonEncode({'day': '2026-11-15', 'kcal': 1200.5, 'goal': 2000})]));
    expect(sums, [('2026-11-15', 1200.5, 2000.0)]);
  });

  test('scanner and health answer through the page callbacks', () async {
    await bridge().handle(msg('scanBarcode'));
    expect(js.single, 'window.mdaScanResult && window.mdaScanResult("4001234567890", "")');
    js.clear();
    await bridge(health: ('', 'denied')).handle(msg('healthRead', [7, true]));
    expect(js.single, 'window.mdaHealthResult && window.mdaHealthResult("", "denied")');
  });

  test('update check, print and garbage', () async {
    await bridge().handle(msg('checkUpdate'));
    await bridge().handle(msg('print', ['x']));
    await bridge().handle('not json');
    expect(updates, 1);
    expect(js, isEmpty);
  });

  test('widget action script', () {
    expect(jsAction('scan'), 'window.mdaAction ? (window.mdaAction("scan"), 1) : 0');
  });

  test('widget "Nutrition today"', () {
    L10n.lang = 'de';
    final now = DateTime(2026, 11, 15, 12);
    final w = buildNutritionWidget('2026-11-15', 1500, 2000, now: now);
    expect(w.kicker, 'Ernährung heute');
    expect(w.title, '500 kcal übrig');
    expect(w.lines, ['1500 von 2000 kcal']);
    expect(buildNutritionWidget('2026-11-15', 2300, 2000, now: now).title, '300 kcal drüber');
    expect(buildNutritionWidget('2026-11-14', 2300, 2000, now: now).title, '–');      // yesterday's numbers are not shown
  });
}
