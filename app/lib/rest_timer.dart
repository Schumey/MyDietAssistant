import 'dart:async';

import 'package:flutter/foundation.dart';

/// Wo der Timer seinen Zustand ablegt. Auf dem Gerät liegt er in den Einstellungen, damit auch die
/// Benachrichtigungs-Knöpfe (die im Hintergrund laufen) ihn ändern können.
abstract class RestStore {
  Future<int?> endMs();
  Future<void> setEndMs(int? value);
  Future<String> name();
  Future<void> setName(String value);
  Future<int?> restFor(String exerciseId);
  Future<void> setRestFor(String exerciseId, int seconds);
}

/// Zeigt die Benachrichtigung zum Timer (Android); Attrappe auf anderen Systemen und in Tests.
abstract class RestNotifier {
  /// Zeigt den Countdown und plant die Meldung „Pause vorbei“ für [endsAt].
  Future<void> show(DateTime endsAt, String exerciseName);
  Future<void> cancel();
  Future<void> requestPermission();
}

class MemoryRestStore implements RestStore {
  int? _end;
  String _name = '';
  final Map<String, int> _rest = {};

  @override
  Future<int?> endMs() async => _end;

  @override
  Future<void> setEndMs(int? value) async => _end = value;

  @override
  Future<String> name() async => _name;

  @override
  Future<void> setName(String value) async => _name = value;

  @override
  Future<int?> restFor(String exerciseId) async => _rest[exerciseId];

  @override
  Future<void> setRestFor(String exerciseId, int seconds) async => _rest[exerciseId] = seconds;
}

class NoopRestNotifier implements RestNotifier {
  @override
  Future<void> show(DateTime endsAt, String exerciseName) async {}

  @override
  Future<void> cancel() async {}

  @override
  Future<void> requestPermission() async {}
}

/// Pausen-Timer zwischen den Sätzen.
///
/// Das Ende steht im [RestStore] und in einer geplanten Benachrichtigung; die App zeigt nur an.
/// So läuft die Pause weiter und meldet sich, wenn die App im Hintergrund ist oder das Handy gesperrt wird.
class RestTimer extends ChangeNotifier {
  RestTimer({RestStore? store, RestNotifier? notifier, DateTime Function()? clock, this.syncEvery = 3})
      : store = store ?? MemoryRestStore(),
        notifier = notifier ?? NoopRestNotifier(),
        _clock = clock ?? DateTime.now;

  final RestStore store;
  final RestNotifier notifier;
  final DateTime Function() _clock;

  /// Alle wie viele Sekunden der Zustand neu aus dem Speicher gelesen wird (Knöpfe der Benachrichtigung).
  final int syncEvery;

  /// Voreinstellungen für die Pausenlänge in Sekunden; 0 = keine Pause.
  static const presets = [0, 45, 60, 90, 120, 180, 240];
  static const defaultSeconds = 90;
  static const extendSeconds = 30;

  DateTime? _endsAt;
  String _exercise = '';
  Timer? _ticker;
  int _ticks = 0;

  DateTime? get endsAt => _endsAt;
  String get exercise => _exercise;
  bool get running => _endsAt != null && remaining > Duration.zero;

  Duration get remaining {
    final end = _endsAt;
    if (end == null) return Duration.zero;
    final d = end.difference(_clock());
    return d.isNegative ? Duration.zero : d;
  }

  /// „1:05“ für die Anzeige.
  static String format(Duration d) {
    final s = (d.inMilliseconds / 1000).ceil();
    return '${s ~/ 60}:${(s % 60).toString().padLeft(2, '0')}';
  }

  Future<void> start(int seconds, {String exercise = ''}) async {
    if (seconds <= 0) return;
    _exercise = exercise;
    await _setEnd(_clock().add(Duration(seconds: seconds)));
  }

  /// Verlängert die laufende Pause (oder startet eine neue, wenn keine läuft).
  Future<void> extend([int seconds = extendSeconds]) async {
    final base = running ? _endsAt! : _clock();
    await _setEnd(base.add(Duration(seconds: seconds)));
  }

  Future<void> stop() async {
    _endsAt = null;
    _ticker?.cancel();
    _ticker = null;
    await store.setEndMs(null);
    await notifier.cancel();
    notifyListeners();
  }

  Future<void> _setEnd(DateTime end) async {
    _endsAt = end;
    await store.setEndMs(end.millisecondsSinceEpoch);
    await store.setName(_exercise);
    await notifier.show(end, _exercise);
    _startTicker();
    notifyListeners();
  }

  /// Liest den Zustand aus dem Speicher: nach dem Start der App und wenn die Benachrichtigung ihn geändert hat.
  Future<void> restore() async {
    final ms = await store.endMs();
    final end = ms == null ? null : DateTime.fromMillisecondsSinceEpoch(ms);
    if (end == null || !end.isAfter(_clock())) {
      if (_endsAt != null) {
        _endsAt = null;
        _ticker?.cancel();
        _ticker = null;
        notifyListeners();
      }
      return;
    }
    _exercise = await store.name();
    if (_endsAt != end) {
      _endsAt = end;
      _startTicker();
      notifyListeners();
    }
  }

  void _startTicker() {
    _ticker?.cancel();
    _ticks = 0;
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) async {
      _ticks++;
      if (syncEvery > 0 && _ticks % syncEvery == 0) await restore();
      if (_endsAt != null && remaining == Duration.zero) {
        _endsAt = null;
        _ticker?.cancel();
        _ticker = null;
        await store.setEndMs(null);
      }
      notifyListeners();
    });
  }

  // --- Pausenlänge je Übung ----------------------------------------------------------

  /// Pausenlänge einer Übung: was auf dem Gerät für die Übung eingestellt wurde, sonst die Pause aus dem Trainingstag
  /// ([planned]), sonst die globale Pause vom Server ([global]), sonst 90 s.
  Future<int> restSeconds(String exerciseId, {int? planned, int? global}) async =>
      await store.restFor(exerciseId) ?? planned ?? global ?? defaultSeconds;

  /// Schaltet die Pausenlänge der Übung auf die nächste Voreinstellung und gibt sie zurück.
  Future<int> cycleRest(String exerciseId, {int? planned, int? global}) async {
    final current = await restSeconds(exerciseId, planned: planned, global: global);
    final i = presets.indexWhere((p) => p > current);
    final next = i == -1 ? presets.first : presets[i];
    await store.setRestFor(exerciseId, next);
    return next;
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }
}
