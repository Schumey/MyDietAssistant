import 'l10n.dart';

/// Muskelgruppen wie im Katalog des Servers (`core/catalog.py`): Schlüssel → (deutsch, englisch).
const muscleGroups = {
  'chest': ('Brust', 'Chest'),
  'lats': ('Latissimus', 'Lats'),
  'upper_back': ('Oberer Rücken', 'Upper back'),
  'lower_back': ('Unterer Rücken', 'Lower back'),
  'traps': ('Trapezmuskel', 'Traps'),
  'shoulders': ('Schultern', 'Shoulders'),
  'rear_delts': ('Hintere Schulter', 'Rear delts'),
  'biceps': ('Bizeps', 'Biceps'),
  'triceps': ('Trizeps', 'Triceps'),
  'forearms': ('Unterarme', 'Forearms'),
  'abs': ('Bauch', 'Abs'),
  'obliques': ('Seitliche Bauchmuskeln', 'Obliques'),
  'quads': ('Oberschenkel vorn', 'Quads'),
  'hamstrings': ('Oberschenkel hinten', 'Hamstrings'),
  'glutes': ('Gesäß', 'Glutes'),
  'adductors': ('Adduktoren', 'Adductors'),
  'abductors': ('Abduktoren', 'Abductors'),
  'calves': ('Waden', 'Calves'),
  'hip_flexors': ('Hüftbeuger', 'Hip flexors'),
};

String muscleLabel(String key) {
  final m = muscleGroups[key];
  if (m == null) return key;
  return L10n.lang == 'de' ? m.$1 : m.$2;
}

/// Übungsarten wie in der Datenbank (`exercise.kind`).
const exerciseKinds = ['strength', 'bodyweight', 'time', 'cardio'];
