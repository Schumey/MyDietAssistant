/// Texte der App (de, en). Die Sprache folgt dem Gerät; `tr('key', [a, b])` ersetzt `{0}`, `{1}`.
library;

import 'dart:ui';

class L10n {
  static const languages = ['de', 'en'];

  /// Aktuelle Sprache. Deutsch, bis `main()` die des Geräts einträgt (auch in Tests).
  static String lang = 'de';

  static Locale get locale => Locale(lang);

  static String resolve(String? code) {
    final short = (code ?? 'en').split(RegExp('[-_]')).first.toLowerCase();
    return languages.contains(short) ? short : 'en';
  }

  static const _weekdays = {
    'de': ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    'en': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  };
  static const _months = {
    'de': ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'],
    'en': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  };

  /// „Di, 10. Nov. 2026“ bzw. „Tue, Nov 10 2026“.
  static String dayLabel(DateTime d) {
    final w = _weekdays[lang]![d.weekday - 1];
    final m = _months[lang]![d.month - 1];
    return lang == 'de' ? '$w, ${d.day}. $m ${d.year}' : '$w, $m ${d.day} ${d.year}';
  }

  static String time(DateTime d) =>
      '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';

  /// Gewicht ohne überflüssige Nullen: 32.5 → „32,5“ (de) bzw. „32.5“ (en).
  static String kg(num value) {
    final text = value == value.roundToDouble() ? value.toStringAsFixed(0) : value.toStringAsFixed(2).replaceFirst(RegExp(r'0+$'), '');
    return lang == 'de' ? text.replaceAll('.', ',') : text;
  }
}

String tr(String key, [List<Object?> args = const []]) {
  var text = _strings[L10n.lang]?[key] ?? _strings['en']![key] ?? key;
  for (var i = 0; i < args.length; i++) {
    text = text.replaceAll('{$i}', '${args[i]}');
  }
  return text;
}

/// Begründung eines Zielwerts in der Sprache der App (Codes und Parameter kommen vom Server,
/// siehe `core/progression.py`). Unbekannter Code: der deutsche Text des Servers.
String reasonText(String code, Map<String, dynamic> params, {String fallback = ''}) {
  final template = _reasons[L10n.lang]?[code] ?? _reasons['en']![code];
  if (template == null) return fallback;
  final values = {...params};
  return template.replaceAllMapped(RegExp(r'\{(\w+)\}'), (m) {
    final v = values[m[1]];
    return v is num ? L10n.kg(v) : '${v ?? ''}';
  });
}

const _reasons = {
  'de': {
    'up': 'Obere Grenze ({reps_max} Wdh.) erreicht → eine Stufe mehr: {weight} kg',
    'up_cut': 'Diät: obere Grenze ({reps_max} Wdh.) {streak}× in Folge erreicht → eine Stufe mehr: {weight} kg',
    'hold': 'Im Bereich {reps_min}–{reps_max} Wdh. → Gewicht halten, Ziel {reps} Wdh.',
    'hold_cut': 'Diät: Gewicht {weight} kg halten, Ziel {reps} Wdh.',
    'down': 'Unter {reps_min} Wdh. → eine Stufe weniger: {weight} kg',
    'down_cut': 'Diät: unter {reps_min} Wdh. → eine Stufe weniger: {weight} kg',
    'cut_drop_set': 'Diät: unter {reps_min} Wdh. → erst einen Satz streichen ({sets} Sätze), Gewicht halten',
    'break': '{days} Tage Pause → eine Stufe weniger: {weight} kg',
    'device_change': 'Anderes Gerät oder neue Stufen → nächstliegendes Gewicht: {weight} kg (zuletzt {from} kg)',
    'at_max': 'Höchstes Gewicht des Geräts erreicht → mehr Wiederholungen ({reps_max})',
    'at_min': 'Niedrigstes Gewicht des Geräts erreicht → Wiederholungen steigern',
  },
  'en': {
    'up': 'Top of the range ({reps_max} reps) reached → one step up: {weight} kg',
    'up_cut': 'Cut: top of the range ({reps_max} reps) reached {streak}× in a row → one step up: {weight} kg',
    'hold': 'Within {reps_min}–{reps_max} reps → keep the weight, aim for {reps} reps',
    'hold_cut': 'Cut: keep {weight} kg, aim for {reps} reps',
    'down': 'Below {reps_min} reps → one step down: {weight} kg',
    'down_cut': 'Cut: below {reps_min} reps → one step down: {weight} kg',
    'cut_drop_set': 'Cut: below {reps_min} reps → drop a set first ({sets} sets), keep the weight',
    'break': '{days} days off → one step down: {weight} kg',
    'device_change': 'Different equipment or new steps → nearest weight: {weight} kg (last {from} kg)',
    'at_max': 'Heaviest weight of the equipment reached → more reps ({reps_max})',
    'at_min': 'Lightest weight of the equipment reached → build reps',
  },
};

const _strings = {
  'de': {
    'app_name': 'HAFS',
    'connect_title': 'Mit Home Assistant verbinden',
    'address': 'Adresse',
    'address_hint': 'http://homeassistant.local:8123',
    'token': 'Langlebiger Zugriffstoken',
    'token_help': 'In Home Assistant: Profil → Sicherheit → Langlebige Zugriffstoken',
    'connect': 'Verbinden',
    'err_token': 'Token ungültig',
    'err_address_missing': 'Bitte eine Adresse eingeben',
    'err_address_invalid': 'Ungültige Adresse',
    'err_no_answer': 'Keine Antwort von Home Assistant',
    'err_no_connection': 'Keine Verbindung: {0}',
    'err_closed': 'Verbindung beendet',
    'err_unknown': 'Unbekannter Fehler',
    'err_not_installed': 'Die Integration HAFS ist in Home Assistant nicht eingerichtet',
    'err_server_old': 'Der Server ist zu alt für diese App (API {0}). Bitte die Integration aktualisieren.',
    'err_app_old': 'Die App ist zu alt für den Server (API {0}). Bitte die App aktualisieren.',
    'tab_training': 'Training',
    'tab_history': 'Verlauf',
    'tab_settings': 'Einstellungen',
    'start_workout': 'Workout starten',
    'resume_workout': 'Workout fortsetzen',
    'workout_running': 'Workout läuft seit {0}',
    'finish_workout': 'Workout beenden',
    'finish_confirm': 'Workout beenden?',
    'discard_empty': 'Ohne Sätze wird das Workout verworfen.',
    'cancel': 'Abbrechen',
    'finish': 'Beenden',
    'add_exercise': 'Übung hinzufügen',
    'search_exercise': 'Übung suchen',
    'no_exercises': 'Keine Übung gefunden',
    'recent': 'Zuletzt benutzt',
    'all_exercises': 'Alle Übungen',
    'weight_kg': 'Gewicht (kg)',
    'reps': 'Wiederholungen',
    'save_set': 'Satz fertig',
    'set_n': 'Satz {0}',
    'last_time': 'Letztes Mal',
    'target': 'Vorschlag',
    'no_sets_yet': 'Noch keine Sätze',
    'delete_set': 'Satz löschen',
    'step': 'Stufe {0} kg',
    'kind_work': 'Arbeitssatz',
    'kind_warmup': 'Aufwärmen',
    'kind_drop': 'Dropsatz',
    'history_empty': 'Noch keine Workouts',
    'sets_count': '{0} Sätze',
    'volume': 'Volumen {0} kg',
    'duration_min': '{0} min',
    'sync_now': 'Jetzt synchronisieren',
    'syncing': 'Synchronisiere…',
    'sync_done': 'Synchronisiert',
    'sync_failed': 'Synchronisierung fehlgeschlagen: {0}',
    'sync_pending': '{0} Änderungen warten auf die Übertragung',
    'sync_first': 'Erste Synchronisierung…',
    'phase': 'Ernährungsphase',
    'phase_auto': 'Automatisch',
    'phase_bulk': 'Masse',
    'phase_maintain': 'Halten',
    'phase_cut': 'Diät',
    'phase_help': 'Bestimmt, wie schnell die Gewichtsvorschläge steigen.',
    'logout': 'Abmelden',
    'logout_confirm': 'Abmelden? Nicht übertragene Änderungen bleiben auf dem Gerät.',
    'server': 'Server',
    'offline_hint': 'Offline – wird später übertragen',
    'workout_of': 'Workout vom {0}',
    'rest_label': 'Pause',
    'rest_off': 'Pause aus',
    'rest_seconds': 'Pause {0} s',
    'rest_title': 'Pause',
    'rest_channel_running': 'Pause läuft',
    'rest_channel_done': 'Pause vorbei',
    'rest_add': '+30 s',
    'rest_stop': 'Stop',
    'rest_over': 'Pause vorbei',
    'rest_next_set': 'Nächster Satz',
  },
  'en': {
    'app_name': 'HAFS',
    'connect_title': 'Connect to Home Assistant',
    'address': 'Address',
    'address_hint': 'http://homeassistant.local:8123',
    'token': 'Long-lived access token',
    'token_help': 'In Home Assistant: Profile → Security → Long-lived access tokens',
    'connect': 'Connect',
    'err_token': 'Invalid token',
    'err_address_missing': 'Please enter an address',
    'err_address_invalid': 'Invalid address',
    'err_no_answer': 'No answer from Home Assistant',
    'err_no_connection': 'No connection: {0}',
    'err_closed': 'Connection closed',
    'err_unknown': 'Unknown error',
    'err_not_installed': 'The HAFS integration is not set up in Home Assistant',
    'err_server_old': 'The server is too old for this app (API {0}). Please update the integration.',
    'err_app_old': 'The app is too old for the server (API {0}). Please update the app.',
    'tab_training': 'Training',
    'tab_history': 'History',
    'tab_settings': 'Settings',
    'start_workout': 'Start workout',
    'resume_workout': 'Resume workout',
    'workout_running': 'Workout running since {0}',
    'finish_workout': 'Finish workout',
    'finish_confirm': 'Finish workout?',
    'discard_empty': 'A workout without sets is discarded.',
    'cancel': 'Cancel',
    'finish': 'Finish',
    'add_exercise': 'Add exercise',
    'search_exercise': 'Search exercise',
    'no_exercises': 'No exercise found',
    'recent': 'Recently used',
    'all_exercises': 'All exercises',
    'weight_kg': 'Weight (kg)',
    'reps': 'Reps',
    'save_set': 'Set done',
    'set_n': 'Set {0}',
    'last_time': 'Last time',
    'target': 'Suggestion',
    'no_sets_yet': 'No sets yet',
    'delete_set': 'Delete set',
    'step': 'Step {0} kg',
    'kind_work': 'Work set',
    'kind_warmup': 'Warm-up',
    'kind_drop': 'Drop set',
    'history_empty': 'No workouts yet',
    'sets_count': '{0} sets',
    'volume': 'Volume {0} kg',
    'duration_min': '{0} min',
    'sync_now': 'Sync now',
    'syncing': 'Syncing…',
    'sync_done': 'Synced',
    'sync_failed': 'Sync failed: {0}',
    'sync_pending': '{0} changes waiting to be sent',
    'sync_first': 'First sync…',
    'phase': 'Nutrition phase',
    'phase_auto': 'Automatic',
    'phase_bulk': 'Bulk',
    'phase_maintain': 'Maintain',
    'phase_cut': 'Cut',
    'phase_help': 'Decides how fast the weight suggestions go up.',
    'logout': 'Log out',
    'logout_confirm': 'Log out? Changes that were not sent stay on the device.',
    'server': 'Server',
    'offline_hint': 'Offline – will be sent later',
    'workout_of': 'Workout of {0}',
    'rest_label': 'Rest',
    'rest_off': 'No rest',
    'rest_seconds': 'Rest {0} s',
    'rest_title': 'Rest',
    'rest_channel_running': 'Rest running',
    'rest_channel_done': 'Rest over',
    'rest_add': '+30 s',
    'rest_stop': 'Stop',
    'rest_over': 'Rest over',
    'rest_next_set': 'Next set',
  },
};
