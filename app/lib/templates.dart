/// Plan-Vorlagen ohne KI: Aufteilung (Ganzkörper, Ober-/Unterkörper, Push/Pull/Beine) mit Übungen
/// aus dem eigenen Bestand. Bevorzugt werden Übungen, die du schon oft trainiert hast.
class Candidate {
  Candidate({required this.id, required this.name, required this.primary, this.kind = 'strength', this.uses = 0});

  final String id;
  final String name;
  final List<String> primary; // Muskelgruppen-Schlüssel
  final String kind;
  final int uses; // Zahl bisher erfasster Arbeitssätze

  bool get compound => primary.length >= 2;
}

class PlanExercise {
  PlanExercise(this.exerciseId, this.name, this.sets, this.repsMin, this.repsMax);

  final String exerciseId;
  final String name;
  final int sets;
  final int repsMin;
  final int repsMax;
}

class PlanDay {
  PlanDay(this.name, this.exercises);

  final String name;
  final List<PlanExercise> exercises;
}

/// Eine Übungsposition eines Tages: erste passende Muskelgruppe der Liste, für die es eine Übung gibt.
typedef Slot = List<String>;

class TemplateDef {
  const TemplateDef(this.key, this.days);

  final String key;
  final List<(String, List<Slot>)> days; // (Name des Tages, Positionen)
}

const _quads = ['quads'];
const _posterior = ['hamstrings', 'glutes'];

const templates = [
  TemplateDef('fullbody', [
    ('A', [_quads, ['chest'], ['lats'], ['shoulders'], ['abs']]),
    ('B', [_posterior, ['upper_back', 'lats'], ['chest'], ['biceps'], ['triceps']]),
    ('C', [_quads, ['shoulders'], ['lats'], ['chest'], ['calves']]),
  ]),
  TemplateDef('upper_lower', [
    ('upper_a', [['chest'], ['lats'], ['shoulders'], ['biceps'], ['triceps']]),
    ('lower_a', [_quads, _posterior, ['calves'], ['abs']]),
    ('upper_b', [['lats'], ['chest'], ['upper_back', 'rear_delts'], ['triceps'], ['biceps']]),
    ('lower_b', [_posterior, _quads, ['glutes', 'adductors'], ['abs']]),
  ]),
  TemplateDef('ppl', [
    ('push', [['chest'], ['shoulders'], ['chest'], ['triceps'], ['triceps']]),
    ('pull', [['lats'], ['upper_back'], ['rear_delts'], ['biceps'], ['biceps']]),
    ('legs', [_quads, _posterior, ['glutes'], ['calves'], ['abs']]),
  ]),
];

/// Tag-Namen sind Schlüssel (`tpl_day_<key>` in l10n), der Name wird erst beim Anlegen übersetzt.
/// Baut die Tage einer Vorlage. Eine Übung kommt im ganzen Programm nur einmal vor, solange es
/// Alternativen gibt; Tage ohne passende Übung bleiben leer und werden weggelassen.
List<PlanDay> buildPlan(TemplateDef t, List<Candidate> pool) {
  final usable = pool.where((c) => c.kind == 'strength' && c.primary.isNotEmpty).toList()
    ..sort((a, b) {
      final byUse = b.uses.compareTo(a.uses);
      return byUse != 0 ? byUse : a.name.toLowerCase().compareTo(b.name.toLowerCase());
    });
  final usedInPlan = <String>{};
  final days = <PlanDay>[];
  for (final (name, slots) in t.days) {
    final inDay = <String>{};
    final rows = <PlanExercise>[];
    for (final slot in slots) {
      Candidate? pick;
      for (final muscle in slot) {
        final matches = usable.where((c) => c.primary.first == muscle && !inDay.contains(c.id)).toList();
        // the main muscle first; compound lifts lead a slot for the big groups
        pick = matches.where((c) => !usedInPlan.contains(c.id)).firstOrNull ?? matches.firstOrNull;
        if (pick != null) break;
      }
      if (pick == null) continue;
      inDay.add(pick.id);
      usedInPlan.add(pick.id);
      final first = rows.isEmpty;
      rows.add(first || pick.compound
          ? PlanExercise(pick.id, pick.name, first ? 4 : 3, 6, 10)
          : PlanExercise(pick.id, pick.name, 3, 10, 15));
    }
    if (rows.isNotEmpty) days.add(PlanDay(name, rows));
  }
  return days;
}
