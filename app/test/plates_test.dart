import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/plates.dart';

void main() {
  test('plates per side, largest first', () {
    expect(platesFor(100)!.perSide, [25, 15]);        // (100 - 20) / 2 = 40
    expect(platesFor(60)!.perSide, [20]);
    expect(platesFor(20)!.perSide, isEmpty);
    expect(platesFor(22.5)!.perSide, [1.25]);
    expect(platesFor(142.5)!.perSide, [25, 25, 10, 1.25]);
    expect(platesFor(100)!.remainder, 0);
  });

  test('below the bar, unreachable remainder, custom bar and plates', () {
    expect(platesFor(15), isNull);
    final r = platesFor(21)!; // 0.5 per side, smallest plate 0.5 -> reachable
    expect(r.perSide, [0.5]);
    final odd = platesFor(20.5)!; // 0.25 per side: not reachable
    expect(odd.perSide, isEmpty);
    expect(odd.remainder, 0.5);
    expect(platesFor(35, bar: 15)!.perSide, [10]);
    expect(platesFor(60, plates: [10, 5])!.perSide, [10, 10]);
  });

  test('line formatting', () {
    expect(platesLine(platesFor(100)!, (v) => '$v'), '25.0 + 15.0');
    expect(platesLine(platesFor(20)!, (v) => '$v'), '–');
  });
  test('parsePlates', () {
    expect(parsePlates('25 20 2,5'), [25, 20, 2.5]);
    expect(parsePlates(''), isNull);
    expect(parsePlates('25 x'), isNull);
    expect(parsePlates('0'), isNull);
  });
}
