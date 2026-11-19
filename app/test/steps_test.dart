import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/steps.dart';

void main() {
  limitedBarbellTests();
  test('expandSteps: range, list, JSON text, invalid', () {
    expect(expandSteps('{"min":5,"max":20,"step":5}'), [5, 10, 15, 20]);
    expect(expandSteps('[30, 20, 20, 25]'), [20, 25, 30]);
    expect(expandSteps('{"min":2.5,"max":7.5,"step":2.5}'), [2.5, 5, 7.5]);
    expect(expandSteps(null), isNull);
    // stack with add-on weight, plate-loaded machine
    expect(expandSteps('{"min":7,"max":21,"step":7,"extra":2.5}'), [7, 9.5, 14, 16.5, 21, 23.5]);
    expect(expandSteps('{"values":[10,20],"extra":2.5}'), [10, 12.5, 20, 22.5]);
    // several add-on weights: every step plus each of them (0 and invalid entries are ignored)
    expect(expandSteps('{"values":[10,20],"extra":[0,1.1,2.3,3.4]}'), [10, 11.1, 12.3, 13.4, 20, 21.1, 22.3, 23.4]);
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

  group('equipment form', () {
    test('stack machine: range plus add-on weight, and back', () {
      final json = encodeStepsForm('machine_stack', StepsForm(input: '7-91/7', extra: '2,5'))!;
      expect(jsonDecode(json), {'min': 7.0, 'max': 91.0, 'step': 7.0, 'extra': 2.5});
      expect(expandSteps(json), containsAll([7, 9.5, 14, 16.5]));
      final f = decodeStepsForm(json);
      expect((f.input, f.extra), ('7-91/7', '2,5'));
      // saving the decoded form again changes nothing
      expect(jsonDecode(encodeStepsForm('machine_stack', f)!), jsonDecode(json));
    });

    test('stack machine: list with add-on weight becomes values + extra; no add-on stays a plain list', () {
      expect(jsonDecode(encodeStepsForm('machine_stack', StepsForm(input: '10 20 30', extra: '1.25'))!), {'values': [10.0, 20.0, 30.0], 'extra': 1.25});
      expect(jsonDecode(encodeStepsForm('machine_stack', StepsForm(input: '10 20 30'))!), [10.0, 20.0, 30.0]);
      expect(decodeStepsForm('{"values":[10,20],"extra":2.5}').extra, '2,5');
      expect(decodeStepsForm('{"values":[10,20],"extra":[1.1,2.3,3.4]}').extra, '1,1 2,3 3,4');
      expect(jsonDecode(encodeStepsForm('machine_stack', StepsForm(input: '10 20', extra: '0 1,1 2,3 3,4'))!), {'values': [10.0, 20.0], 'extra': [1.1, 2.3, 3.4]});
      expect(encodeStepsForm('machine_stack', StepsForm(input: '10 20', extra: '1,1 -2')), isNull);
      expect(encodeStepsForm('machine_stack', StepsForm(input: '10 20', extra: 'x')), isNull);
      expect(encodeStepsForm('machine_stack', StepsForm(input: 'bad')), isNull);
      expect(encodeStepsForm('machine_stack', StepsForm()), '');
    });

    test('other types ignore the add-on field', () {
      expect(jsonDecode(encodeStepsForm('machine', StepsForm(input: '5-20/5', extra: '2.5'))!), {'min': 5.0, 'max': 20.0, 'step': 5.0});
    });

    test('plate-loaded: base, plates, sides and maximum, round trip keeps the plate form', () {
      final json = encodeStepsForm('machine_plate', StepsForm(base: '20', plates: '25 10 5 2,5', sides: 2, max: '220'))!;
      expect(jsonDecode(json), {'base': 20.0, 'plates': [25.0, 10.0, 5.0, 2.5], 'sides': 2, 'max': 220.0});
      expect(expandSteps(json)!.take(3), [20, 25, 30]); // 2 x 2.5 kg
      final f = decodeStepsForm(json);
      expect((f.base, f.plates, f.sides, f.max), ('20', '25 10 5 2,5', 2, '220'));
      expect(jsonDecode(encodeStepsForm('machine_plate', f)!), jsonDecode(json));
    });

    test('plate-loaded: one side, no base, no maximum; invalid input is rejected', () {
      final json = encodeStepsForm('machine_plate', StepsForm(plates: '10 5', sides: 1))!;
      expect(jsonDecode(json), {'base': 0.0, 'plates': [10.0, 5.0], 'sides': 1});
      expect(expandSteps(json)!.take(3), [0, 5, 10]);
      expect(encodeStepsForm('machine_plate', StepsForm(base: '20')), isNull); // no plates
      expect(encodeStepsForm('machine_plate', StepsForm(base: '20', plates: '5 x')), isNull);
      expect(encodeStepsForm('machine_plate', StepsForm(base: '50', plates: '5', max: '20')), isNull);
      expect(encodeStepsForm('machine_plate', StepsForm()), '');
    });

    test('decode: empty, broken and old forms', () {
      expect(decodeStepsForm(null).input, '');
      expect(decodeStepsForm('nonsense').plates, '');
      expect(decodeStepsForm('[5,7.5]').input, '5 7,5');
      expect(usesPlateFields('machine_plate') && !usesPlateFields('machine_stack'), isTrue);
    });
  });
}

void limitedBarbellTests() {
  group('barbell with a limited plate stock', () {
    const json = '{"base":20.0,"plates":[25.0,20.0,15.0,10.0,10.0,5.0,5.0,2.5],"sides":2,"limited":true}';

    test('loadable weights are the bar plus twice every sub-selection', () {
      final steps = expandSteps(json)!;
      expect(steps.first, 20);
      expect(steps.last, 20 + 2 * 92.5);
      expect(steps, contains(120)); // 25 + 20 + 5 per side
      expect(steps, contains(25));
      expect(steps, isNot(contains(22.5)));
      expect(expandSteps('{"base":20,"plates":[25,5],"limited":true}'), [20, 30, 70, 80]);
      expect(expandSteps('{"base":20,"plates":[],"limited":true}'), isNull);
    });

    test('barbellStock reads bar and stock, null for other forms', () {
      final s = barbellStock(json)!;
      expect(s.bar, 20);
      expect(s.plates.length, 8);
      expect(barbellStock('{"base":20,"plates":[25],"max":60}'), isNull);
      expect(barbellStock('[20, 25]'), isNull);
      expect(barbellStock(null), isNull);
    });

    test('form: encode with counts, decode collapses them again', () {
      final enc = encodeStepsForm('barbell', StepsForm(base: '20', plates: '25 20 15 10x2 5x2 2,5'))!;
      expect(barbellStock(enc)!.plates, [25, 20, 15, 10, 10, 5, 5, 2.5]);
      final f = decodeStepsForm(enc);
      expect(f.base, '20');
      expect(f.plates, '25 20 15 10x2 5x2 2,5');
      expect(encodeStepsForm('barbell', f), enc);
    });

    test('form: empty stock keeps the plain steps input, invalid stock is rejected', () {
      expect(encodeStepsForm('barbell', StepsForm(input: '20-60/2,5')), '{"min":20.0,"max":60.0,"step":2.5}');
      expect(encodeStepsForm('barbell', StepsForm(plates: '25 x')), isNull);
      expect(encodeStepsForm('barbell', StepsForm(base: '-5', plates: '25')), isNull);
      expect(encodeStepsForm('machine_plate', StepsForm(base: '10', plates: '5')), isNotNull);
    });
  });
}
