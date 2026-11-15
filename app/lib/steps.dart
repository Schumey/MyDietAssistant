import 'dart:convert';

import 'plates.dart';

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
    if (spec.containsKey('plates')) return _expandPlates(spec);
    List<double> grid;
    final values = spec['values'];
    if (values is List) {
      grid = {for (final v in values) if (v is num) _round(v.toDouble())}.toList()..sort();
    } else {
      final lo = (spec['min'] as num?)?.toDouble();
      final hi = (spec['max'] as num?)?.toDouble();
      final step = (spec['step'] as num?)?.toDouble();
      if (lo == null || hi == null || step == null || step <= 0 || hi < lo) return null;
      final n = ((hi - lo) / step).round();
      grid = [for (var i = 0; i <= n; i++) _round(lo + i * step)];
    }
    // Stack-loaded machine with an add-on weight: every pin position with and without it.
    final extra = (spec['extra'] as num?)?.toDouble();
    if (extra != null && extra > 0 && grid.isNotEmpty) {
      grid = {...grid, for (final v in grid) _round(v + extra)}.toList()..sort();
    }
    return grid.isEmpty ? null : grid;
  }
  if (spec is List) {
    final values = {for (final v in spec) if (v is num) _round(v.toDouble())}.toList()..sort();
    return values.isEmpty ? null : values;
  }
  return null;
}

/// Plate-loaded machine: `base` (sled/lever) plus plates; with plates on both sides (`sides` 2, default) the smallest
/// change is two of the smallest plate. `max` limits the load (default: 40 steps above `base`).
List<double>? _expandPlates(Map spec) {
  if (spec['limited'] == true) return _expandLimited(spec);
  final plates = [for (final p in (spec['plates'] is List ? spec['plates'] as List : const []) ) if (p is num && p > 0) p.toDouble()];
  if (plates.isEmpty) return null;
  final base = (spec['base'] as num?)?.toDouble() ?? 0;
  final unit = (spec['sides'] == 1 ? 1 : 2) * plates.reduce((a, b) => a < b ? a : b);
  final hi = (spec['max'] as num?)?.toDouble() ?? base + 40 * unit;
  if (base < 0 || hi < base || (hi - base) / unit > 2000) return null;
  final n = ((hi - base) / unit).round();
  return [for (var i = 0; i <= n; i++) _round(base + i * unit)];
}

/// Barbell with a limited plate stock (`limited`): `base` is the bar, `plates` the plates there are per side (one entry
/// per plate). Loadable weights: the bar plus twice every sum of a sub-selection of the plates; `max` caps the load.
List<double>? _expandLimited(Map spec) {
  final stock = barbellStock(jsonEncode(spec));
  if (stock == null) return null;
  final sums = <int>{0};
  for (final p in stock.plates) {
    final u = (p * 1000).round();
    sums.addAll([for (final s in sums.toList()) s + u]);
    if (sums.length > 2000) return null;
  }
  final hi = (spec['max'] as num?)?.toDouble();
  final out = {for (final s in sums) _round(stock.bar + 2 * s / 1000)}.where((w) => hi == null || w <= hi + 1e-9).toList()..sort();
  return out.isEmpty ? null : out;
}

/// Bar and plate stock (per side) of a barbell with a limited stock; null for every other steps JSON.
({double bar, List<double> plates})? barbellStock(String? json) {
  if (json == null || json.trim().isEmpty) return null;
  Object? spec;
  try {
    spec = jsonDecode(json);
  } catch (_) {
    return null;
  }
  if (spec is! Map || spec['limited'] != true || spec['plates'] is! List) return null;
  final plates = [for (final p in spec['plates'] as List) if (p is num && p > 0) p.toDouble()];
  final bar = (spec['base'] as num?)?.toDouble() ?? 0;
  if (plates.isEmpty || plates.length != (spec['plates'] as List).length || plates.length > 60 || bar < 0) return null;
  return (bar: bar, plates: plates);
}

double _round(double v) => (v * 10000).round() / 10000;

/// Stationen (Rack, Bank) sind nur der Ort der Übung; die Gewichtsstufen kommen von dem Gerät, das die Gewichte hält
/// (Langhantel, Kurzhanteln, Maschine). Eine Übung kann beides verknüpfen, z. B. Bankdrücken = Bank + Langhantel.
const stationTypes = {'rack', 'bench'};
bool isStationType(String type) => stationTypes.contains(type);

/// Gewicht eines Aufwärmsatzes: [pct] Prozent des Arbeitsgewichts auf der nächsten Stufe
/// (ohne Stufen: auf ein Vielfaches der Schrittweite [step]).
double warmupWeight(double working, double pct, List<double>? steps, double step) {
  final raw = working * pct / 100;
  if (steps != null && steps.isNotEmpty) return snapToSteps(raw, steps);
  if (step <= 0) return _round(raw);
  return _round((raw / step).round() * step);
}

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

/// The input of the equipment form, one piece per field. Stack machines use [input] (range or list) and [extra]
/// (an add-on weight); plate-loaded machines use [base], [plates], [sides] and [max]; everything else only [input].
class StepsForm {
  StepsForm({this.input = '', this.extra = '', this.base = '', this.plates = '', this.sides = 2, this.max = ''});

  final String input;
  final String extra;
  final String base;
  final String plates;
  final int sides;
  final String max;
}

/// Is [type] entered with the plate fields?
bool usesPlateFields(String type) => type == 'machine_plate' || type == 'barbell';

/// Barbell: the plate fields hold the bar and the plates per side (`5x2` = two 5 kg plates per side); both sides always
/// carry the same plates and there is no maximum. Left empty, the plain steps input still applies.
bool usesStockFields(String type) => type == 'barbell';

/// Is [type] entered with an add-on weight?
bool usesExtraField(String type) => type == 'machine_stack';

double? _number(String text) => double.tryParse(text.trim().replaceAll(',', '.'));

String _num(num v) {
  final r = (v.toDouble() * 10000).round() / 10000;
  return r == r.roundToDouble() ? r.toStringAsFixed(0) : r.toString().replaceAll('.', ',');
}

/// Reads the stored JSON back into the form fields without expanding it (so nothing is flattened by editing).
StepsForm decodeStepsForm(String? json) {
  if (json == null || json.trim().isEmpty) return StepsForm();
  Object? spec;
  try {
    spec = jsonDecode(json);
  } catch (_) {
    return StepsForm();
  }
  if (spec is List) return StepsForm(input: [for (final v in spec) if (v is num) _num(v)].join(' '));
  if (spec is! Map) return StepsForm();
  if (spec.containsKey('plates')) {
    final plates = spec['plates'];
    final stock = barbellStock(json);
    return StepsForm(
      base: spec['base'] is num ? _num(spec['base'] as num) : '',
      plates: stock != null
          ? formatPlates(stock.plates, (v) => _num(v))
          : plates is List ? [for (final p in plates) if (p is num) _num(p)].join(' ') : '',
      sides: spec['sides'] == 1 ? 1 : 2,
      max: spec['max'] is num ? _num(spec['max'] as num) : '',
    );
  }
  final extra = spec['extra'] is num ? _num(spec['extra'] as num) : '';
  if (spec['values'] is List) return StepsForm(input: [for (final v in spec['values'] as List) if (v is num) _num(v)].join(' '), extra: extra);
  if (spec['min'] is num && spec['max'] is num && spec['step'] is num) {
    return StepsForm(input: '${_num(spec['min'] as num)}-${_num(spec['max'] as num)}/${_num(spec['step'] as num)}', extra: extra);
  }
  return StepsForm(extra: extra);
}

/// The JSON for the database from the form of [type]; `''` = no steps known; `null` = invalid input.
String? encodeStepsForm(String type, StepsForm f) {
  if (usesStockFields(type) && (f.plates.trim().isNotEmpty || f.base.trim().isNotEmpty)) {
    final plates = parsePlates(f.plates);
    final bar = f.base.trim().isEmpty ? 0.0 : _number(f.base);
    if (plates == null || bar == null || bar < 0) return null;
    return jsonEncode({'base': bar, 'plates': plates, 'sides': 2, 'limited': true});
  }
  if (type == 'machine_plate') {
    final plates = [for (final p in f.plates.trim().replaceAll(',', '.').split(RegExp(r'[\s;]+'))) if (p.isNotEmpty) double.tryParse(p)];
    final hasAny = f.base.trim().isNotEmpty || plates.isNotEmpty || f.max.trim().isNotEmpty;
    if (!hasAny) return '';
    if (plates.isEmpty || plates.contains(null) || plates.any((p) => p! <= 0)) return null;
    final base = f.base.trim().isEmpty ? 0.0 : _number(f.base);
    final max = f.max.trim().isEmpty ? null : _number(f.max);
    if (base == null || base < 0) return null;
    if (f.max.trim().isNotEmpty && (max == null || max < base)) return null;
    final spec = {'base': base, 'plates': plates.cast<double>(), 'sides': f.sides == 1 ? 1 : 2, 'max': ?max};
    return expandSteps(jsonEncode(spec)) == null ? null : jsonEncode(spec);
  }
  final parsed = parseStepsInput(f.input);
  if (parsed == null || parsed.isEmpty) return parsed;
  if (!usesExtraField(type) || f.extra.trim().isEmpty) return parsed;
  final extra = _number(f.extra);
  if (extra == null || extra <= 0) return null;
  final spec = jsonDecode(parsed);
  return jsonEncode(spec is List ? {'values': spec, 'extra': extra} : {...(spec as Map), 'extra': extra});
}
