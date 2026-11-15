/// Scheibenrechner für Langhanteln: welche Scheiben pro Seite auf die Stange müssen.
///
/// Die Liste der Scheiben ist der Bestand **je Seite**: jeder Eintrag ist eine vorhandene Scheibe, mehrfach
/// vorhandene stehen mehrfach (`5x4` in der Eingabe = vier 5-kg-Scheiben je Seite). Es gibt also z. B. nur eine
/// 25er je Seite; 50 kg je Seite werden zu 25 + 20 + 5.
const defaultPlates = [25.0, 20.0, 15.0, 10.0, 5.0, 5.0, 5.0, 5.0, 2.5, 1.25, 0.5];
const defaultBar = 20.0;

class PlateResult {
  PlateResult(this.perSide, this.remainder);

  /// Scheiben einer Seite, von innen nach außen (große zuerst).
  final List<double> perSide;

  /// Gewicht (gesamt), das mit den vorhandenen Scheiben nicht erreichbar ist; 0 = genau.
  final double remainder;
}

/// Verteilt [total] kg auf eine Stange von [bar] kg mit dem Bestand [plates] je Seite. Gewählt wird die Auswahl, die
/// am nächsten unter dem Ziel bleibt, bei Gleichstand mit den wenigsten Scheiben (dann die schwereren zuerst).
/// Null, wenn das Gewicht unter der Stange liegt.
PlateResult? platesFor(double total, {double bar = defaultBar, List<double> plates = defaultPlates}) {
  if (total < bar) return null;
  int units(double v) => (v * 1000).round();
  final target = units((total - bar) / 2);
  // distinct plate sizes, largest first, with how many there are per side
  final counts = <int, int>{};
  for (final p in plates) {
    if (p > 0) counts.update(units(p), (c) => c + 1, ifAbsent: () => 1);
  }
  final sizes = counts.keys.toList()..sort((a, b) => b.compareTo(a));

  var bestLeft = target + 1;
  var bestCount = 1 << 30;
  var best = <int>[];
  final chosen = <int>[];
  void search(int i, int left, int used) {
    if (left < bestLeft || (left == bestLeft && used < bestCount)) {
      bestLeft = left;
      bestCount = used;
      best = [...chosen];
    }
    if (i >= sizes.length || left == 0) return;
    final size = sizes[i];
    final most = [counts[size]!, left ~/ size].reduce((a, b) => a < b ? a : b);
    for (var n = most; n >= 0; n--) {
      for (var k = 0; k < n; k++) {
        chosen.add(size);
      }
      search(i + 1, left - n * size, used + n);
      chosen.length -= n;
    }
  }

  search(0, target, 0);
  return PlateResult([for (final u in best) u / 1000], bestLeft * 2 / 1000);
}

String platesLine(PlateResult r, String Function(double) fmt) =>
    r.perSide.isEmpty ? '–' : r.perSide.map(fmt).join(' + ');

/// Parses "25 20 15 10 5x4 2,5 1,25" (space or semicolon separated; `5x4` = four plates of 5 kg per side);
/// null if invalid or empty. Every entry is one plate, so repeated sizes come back repeated.
List<double>? parsePlates(String text) {
  final parts = text.split(RegExp(r'[\s;]+')).where((s) => s.isNotEmpty);
  final out = <double>[];
  for (final s in parts) {
    final m = RegExp(r'^(.+?)[x×](\d+)$', caseSensitive: false).firstMatch(s);
    final v = double.tryParse((m?[1] ?? s).replaceAll(',', '.'));
    final n = m == null ? 1 : int.parse(m[2]!);
    if (v == null || v <= 0 || v > 100 || n < 1 || n > 20) return null;
    out.addAll(List.filled(n, v));
  }
  return out.isEmpty || out.length > 60 ? null : out;
}

/// Inverse of [parsePlates] for display: equal plates collapse to `5x4`, largest first.
String formatPlates(List<double> plates, String Function(double) fmt) {
  final counts = <double, int>{};
  for (final p in plates) {
    counts.update(p, (c) => c + 1, ifAbsent: () => 1);
  }
  final sizes = counts.keys.toList()..sort((a, b) => b.compareTo(a));
  return [for (final s in sizes) counts[s]! > 1 ? '${fmt(s)}x${counts[s]}' : fmt(s)].join(' ');
}
