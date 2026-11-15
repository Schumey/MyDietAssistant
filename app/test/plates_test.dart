import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/plates.dart';

void main() {
  test('plates per side, largest first', () {
    expect(platesFor(100)!.perSide, [25, 15]);        // (100 - 20) / 2 = 40
    expect(platesFor(60)!.perSide, [20]);
    expect(platesFor(20)!.perSide, isEmpty);
    expect(platesFor(22.5)!.perSide, [1.25]);
    expect(platesFor(142.5)!.perSide, [25, 20, 15, 1.25]); // 61.25 per side
    expect(platesFor(100)!.remainder, 0);
  });

  test('only one pair of each plate except the 5s: 50 per side is 25 + 20 + 5', () {
    expect(platesFor(120)!.perSide, [25, 20, 5]);
    expect(platesFor(120)!.remainder, 0);
    expect(platesFor(140)!.perSide, [25, 20, 15]);       // 60 per side
    expect(platesFor(170)!.perSide, [25, 20, 15, 10, 5]); // 75 per side
    // 40 per side: fewest plates wins (25 + 15, not 20 + 10 + 5 + 5)
    expect(platesFor(100)!.perSide, [25, 15]);
  });

  test('not enough plates: closest below the target, remainder reported', () {
    // everything on the bar: 25+20+15+10+5x4+2.5+1.25+0.5 = 94.25 per side
    final r = platesFor(20 + 2 * 100)!;
    expect(r.perSide.fold<double>(0, (a, b) => a + b), 94.25);
    expect(r.remainder, 11.5);
  });

  test('below the bar, unreachable remainder, custom bar and plates', () {
    expect(platesFor(15), isNull);
    final r = platesFor(21)!; // 0.5 per side, smallest plate 0.5 -> reachable
    expect(r.perSide, [0.5]);
    final odd = platesFor(20.5)!; // 0.25 per side: not reachable
    expect(odd.perSide, isEmpty);
    expect(odd.remainder, 0.5);
    expect(platesFor(35, bar: 15)!.perSide, [10]);
    expect(platesFor(60, plates: [10, 5])!.perSide, [10, 5]); // 20 per side, only 15 there
    expect(platesFor(60, plates: [10, 10])!.perSide, [10, 10]);
    expect(platesFor(60, plates: [10, 10])!.remainder, 0);
  });

  test('line formatting', () {
    expect(platesLine(platesFor(100)!, (v) => '$v'), '25.0 + 15.0');
    expect(platesLine(platesFor(20)!, (v) => '$v'), '–');
  });

  test('parsePlates', () {
    expect(parsePlates('25 20 2,5'), [25, 20, 2.5]);
    expect(parsePlates('25 5x3 2,5x2'), [25, 5, 5, 5, 2.5, 2.5]);
    expect(parsePlates(''), isNull);
    expect(parsePlates('25 x'), isNull);
    expect(parsePlates('0'), isNull);
    expect(parsePlates('5x0'), isNull);
    expect(parsePlates('5x99'), isNull);
  });

  test('formatPlates collapses equal plates and round-trips', () {
    expect(formatPlates(defaultPlates, (v) => v == v.roundToDouble() ? '${v.round()}' : '$v'), '25 20 15 10 5x4 2.5 1.25 0.5');
    expect(parsePlates('25 20 15 10 5x4 2.5 1.25 0.5'), defaultPlates);
  });
}
