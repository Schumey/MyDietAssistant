import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/steps.dart';

void main() {
  test('expandSteps: range, list, JSON text, invalid', () {
    expect(expandSteps('{"min":5,"max":20,"step":5}'), [5, 10, 15, 20]);
    expect(expandSteps('[30, 20, 20, 25]'), [20, 25, 30]);
    expect(expandSteps('{"min":2.5,"max":7.5,"step":2.5}'), [2.5, 5, 7.5]);
    expect(expandSteps(null), isNull);
    // stack with add-on weight, plate-loaded machine
    expect(expandSteps('{"min":7,"max":21,"step":7,"extra":2.5}'), [7, 9.5, 14, 16.5, 21, 23.5]);
    expect(expandSteps('{"values":[10,20],"extra":2.5}'), [10, 12.5, 20, 22.5]);
    expect(expandSteps('{"base":100,"plates":[25,10,2.5],"max":120}'), [100, 105, 110, 115, 120]);
    expect(expandSteps('{"base":20,"plates":[1.25,5],"sides":1,"max":22.5}'), [20, 21.25, 22.5]);
    expect(expandSteps('{"base":100,"plates":[],"max":200}'), isNull);
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

  group('warm-up weight and stations', () {
    test('warmupWeight: percent of the working weight on the nearest step', () {
      expect(warmupWeight(100, 50, [for (var w = 20.0; w <= 140; w += 2.5) w], 2.5), 50);
      expect(warmupWeight(77.5, 50, [20, 30, 40, 50], 5), 40); // 38.75 -> nearest step
      expect(warmupWeight(77.5, 50, null, 2.5), 40); // no steps: multiples of the step size (38.75 -> 40)
      expect(warmupWeight(60, 60, null, 5), 35); // 36 -> 35
      expect(warmupWeight(0, 50, null, 2.5), 0);
    });

    test('stations are rack and bench only', () {
      expect(isStationType('rack') && isStationType('bench'), isTrue);
      expect(isStationType('barbell') || isStationType('machine_stack') || isStationType(''), isFalse);
    });
  });
}
