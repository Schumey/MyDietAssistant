/// Scheibenrechner für Langhanteln: welche Scheiben pro Seite auf die Stange müssen.
const defaultPlates = [25.0, 20.0, 15.0, 10.0, 5.0, 2.5, 1.25, 0.5];
const defaultBar = 20.0;

class PlateResult {
  PlateResult(this.perSide, this.remainder);

  /// Scheiben einer Seite, von innen nach außen (große zuerst).
  final List<double> perSide;

  /// Gewicht (gesamt), das mit den vorhandenen Scheiben nicht erreichbar ist; 0 = genau.
  final double remainder;
}

/// Verteilt [total] kg auf eine Stange von [bar] kg. Null, wenn das Gewicht unter der Stange liegt.
PlateResult? platesFor(double total, {double bar = defaultBar, List<double> plates = defaultPlates}) {
  if (total < bar) return null;
  var side = ((total - bar) / 2 * 1000).round() / 1000; // avoid float noise
  final out = <double>[];
  for (final p in [...plates]..sort((a, b) => b.compareTo(a))) {
    while (side + 1e-9 >= p) {
      out.add(p);
      side = ((side - p) * 1000).round() / 1000;
    }
  }
  return PlateResult(out, (side * 2 * 1000).round() / 1000);
}

String platesLine(PlateResult r, String Function(double) fmt) =>
    r.perSide.isEmpty ? '–' : r.perSide.map(fmt).join(' + ');
