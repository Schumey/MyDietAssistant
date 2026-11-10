import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/steps.dart';

void main() {
  test('expandSteps: range, list, JSON text, invalid', () {
    expect(expandSteps('{"min":5,"max":20,"step":5}'), [5, 10, 15, 20]);
    expect(expandSteps('[30, 20, 20, 25]'), [20, 25, 30]);
    expect(expandSteps('{"min":2.5,"max":7.5,"step":2.5}'), [2.5, 5, 7.5]);
    expect(expandSteps(null), isNull);
    expect(expandSteps(''), isNull);
    expect(expandSteps('kaputt'), isNull);
    expect(expandSteps('[]'), isNull);
    expect(expandSteps('{"min":10,"max":5,"step":5}'), isNull);
    expect(expandSteps('{"min":5,"max":20,"step":0}'), isNull);
  });

  const steps = [20.0, 22.5, 25.0, 27.5, 30.0];

  test('stepUp / stepDown / snap', () {
    expect(stepUp(25, steps, 2.5), 27.5);
    expect(stepUp(30, steps, 2.5), isNull);
    expect(stepUp(26, steps, 2.5), 27.5);
    expect(stepUp(30, null, 2.5), 32.5);
    expect(stepDown(25, steps, 2.5), 22.5);
    expect(stepDown(20, steps, 2.5), 20);
    expect(stepDown(1, null, 2.5), 0);
    expect(stepDown(26, steps, 2.5), 25);
    expect(snapToSteps(26, steps), 25);
    expect(snapToSteps(23.75, steps), 22.5); // tie: the lighter one
    expect(snapToSteps(26, null), 26);
  });

  test('parseStepsInput', () {
    expect(jsonDecode(parseStepsInput('5-100/5')!), {'min': 5, 'max': 100, 'step': 5});
    expect(jsonDecode(parseStepsInput('2,5 – 50 x 2,5')!), {'min': 2.5, 'max': 50, 'step': 2.5});
    expect(jsonDecode(parseStepsInput('20 22,5 25')!), [20, 22.5, 25]);
    expect(jsonDecode(parseStepsInput('20; 25; 30')!), [20, 25, 30]);
    expect(parseStepsInput(''), '');
    expect(parseStepsInput('  '), '');
    expect(parseStepsInput('abc'), isNull);
    expect(parseStepsInput('100-5/5'), isNull);
    expect(parseStepsInput('5-100/0'), isNull);
    expect(parseStepsInput('1-100000/1'), isNull);
  });

  test('parsed input expands to the expected weights', () {
    expect(expandSteps(parseStepsInput('5-100/5')), [for (var i = 5; i <= 100; i += 5) i.toDouble()]);
  });

  test('stepsSummary', () {
    String fmt(num v) => v == v.roundToDouble() ? v.toStringAsFixed(0) : '$v';
    const range = '{0}–{1} kg in {2}er-Schritten';
    const list = '{0} kg';
    expect(stepsSummary('{"min":5,"max":100,"step":5}', fmt, rangeText: range, listText: list), '5–100 kg in 5er-Schritten');
    expect(stepsSummary('[20, 22.5, 25]', fmt, rangeText: range, listText: list), '20, 22.5, 25 kg');
    expect(stepsSummary(null, fmt, rangeText: range, listText: list), isNull);
  });
}
