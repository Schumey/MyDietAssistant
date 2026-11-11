import 'l10n.dart';

/// Griffe und Seile am Kabelzug. Gespeichert wird der Schlüssel in `workout_set.attachment`; die Anzeige kommt aus
/// den Texten der App (`att_<Schlüssel>`), Unbekanntes wird unverändert gezeigt.
const attachmentKeys = ['rope', 'straight', 'ez', 'lat_bar', 'v_bar', 'single', 'ankle', 'double'];

/// Anzeigename eines Griffs oder Seils; unbekannte Schlüssel erscheinen unverändert.
String attachmentLabel(String key) => attachmentKeys.contains(key) ? tr('att_$key') : key;
