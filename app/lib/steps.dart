import 'dart:convert';

/// Gewichtsstufen eines Geräts (wie `expand_steps` in `core/progression.py`).
///
/// Gespeichert als JSON: Liste von Zahlen oder `{"min":5,"max":100,"step":5}`.
List<double>? expandSteps(String? json) {
  if (json == null || json.trim().isEmpty) return null;
  Object? spec;
  try {
    spec = jsonDecode(json);
  } catch (_) {
    return null;
  }
  if (spec is Map) {
    final lo = (spec['min'] as num?)?.toDouble();
    final hi = (spec['max'] as num?)?.toDouble();
    final step = (spec['step'] as num?)?.toDouble();
    if (lo == null || hi == null || step == null || step <= 0 || hi < lo) return null;
    final n = ((hi - lo) / step).round();
    return [for (var i = 0; i <= n; i++) _round(lo + i * step)];
  }
  if (spec is List) {
    final values = {for (final v in spec) if (v is num) _round(v.toDouble())}.toList()..sort();
    return values.isEmpty ? null : values;
  }
  return null;
}

double _round(double v) => (v * 10000).round() / 10000;

/// Nächst schwerere Stufe; ohne Stufenliste `weight + fallback`; `null` am oberen Ende des Geräts.
double? stepUp(double weight, List<double>? steps, double fallback) {
  if (steps == null) return _round(weight + fallback);
  for (final s in steps) {
    if (s > weight + 1e-9) return s;
  }
  return null;
}

/// Nächst leichtere Stufe; am unteren Ende bleibt es bei der leichtesten, ohne Liste nie unter 0.
double stepDown(double weight, List<double>? steps, double fallback) {
  if (steps == null) return _round((weight - fallback).clamp(0, double.infinity).toDouble());
  for (final s in steps.reversed) {
    if (s < weight - 1e-9) return s;
  }
  return steps.first;
}

/// Nächstliegende Stufe (bei Gleichstand die leichtere).
double snapToSteps(double weight, List<double>? steps) {
  if (steps == null || steps.isEmpty) return weight;
  var best = steps.first;
  for (final s in steps) {
    final d = (s - weight).abs(), b = (best - weight).abs();
    if (d < b - 1e-9) best = s;
  }
  return best;
}

/// Liest die Eingabe beim Anlegen eines Geräts und liefert das JSON für die Datenbank:
/// `5-100/5` (von 5 bis 100 in 5er-Schritten) oder eine Liste `20, 22.5, 25`.
/// Leere Eingabe → `''` (keine Stufen bekannt); ungültig → `null`.
String? parseStepsInput(String input) {
  final text = input.trim().replaceAll(',', '.').replaceAll('–', '-');
  if (text.isEmpty) return '';
  final range = RegExp(r'^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*[/x×]\s*(\d+(?:\.\d+)?)$', caseSensitive: false).firstMatch(text);
  if (range != null) {
    final lo = double.parse(range[1]!), hi = double.parse(range[2]!), step = double.parse(range[3]!);
    if (step <= 0 || hi < lo || (hi - lo) / step > 2000) return null;
    return jsonEncode({'min': lo, 'max': hi, 'step': step});
  }
  // Liste: die Eingabe mit Leerzeichen oder Semikolon getrennt (Komma ist oben schon Dezimaltrenner)
  final parts = text.split(RegExp(r'[\s;]+')).where((p) => p.isNotEmpty).toList();
  final numbers = [for (final p in parts) double.tryParse(p)];
  if (numbers.isEmpty || numbers.contains(null)) return null;
  return jsonEncode(numbers.cast<double>());
}

/// Kurzform für die Anzeige: „5–100 kg in 5er-Schritten“ bzw. „20, 22,5, 25 kg“.
String? stepsSummary(String? json, String Function(num) fmt, {required String rangeText, required String listText}) {
  final steps = expandSteps(json);
  if (steps == null) return null;
  if (steps.length > 6) {
    final diffs = {for (var i = 1; i < steps.length; i++) _round(steps[i] - steps[i - 1])};
    if (diffs.length == 1) {
      return rangeText.replaceAll('{0}', fmt(steps.first)).replaceAll('{1}', fmt(steps.last)).replaceAll('{2}', fmt(diffs.first));
    }
  }
  return listText.replaceAll('{0}', steps.map(fmt).join(', '));
}
