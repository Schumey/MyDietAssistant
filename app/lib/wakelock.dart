import 'package:wakelock_plus/wakelock_plus.dart';

/// Hält den Bildschirm an, solange ein Workout offen ist. Fehlt die Plattform-Unterstützung
/// (z. B. in Tests), passiert nichts.
Future<void> keepScreenOn(bool on) async {
  try {
    await WakelockPlus.toggle(enable: on);
  } catch (_) {}
}
