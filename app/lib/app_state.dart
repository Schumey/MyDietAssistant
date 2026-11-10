import 'plates.dart';
import 'dart:async';

import 'package:flutter/foundation.dart';

import 'credentials.dart';
import 'db.dart';
import 'ha_client.dart';
import 'repo.dart';
import 'rest_timer.dart';
import 'sync.dart';

typedef Connector = Future<HaConnection> Function(String address, String token);

/// Zustand der App: Anmeldedaten, lokale Datenbank und der Abgleich mit Home Assistant.
///
/// Die Datenbank ist immer offen, auch ohne Verbindung: Training erfassen geht offline,
/// abgeglichen wird, wenn eine Verbindung da ist.
class AppState extends ChangeNotifier {
  AppState(this.credentials, {required this.openDb, Connector? connector, RestTimer? rest})
      : _connector = connector ?? ((a, t) => HaClient.connect(a, t)),
        rest = rest ?? RestTimer();

  final CredentialStore credentials;
  final Future<LocalDb> Function() openDb;
  final Connector _connector;

  /// Pausen-Timer zwischen den Sätzen.
  final RestTimer rest;

  bool loaded = false;
  String? address;
  String? _token;
  LocalDb? local;
  Repo? repo;
  bool syncing = false;
  String? syncError;
  String phase = '';

  /// Progression settings kept on the server (`hafs/pref/*`), cached here: key -> value ('' = default).
  static const settingKeys = ['hit_fraction', 'cut_drop_set_first'];
  final Map<String, String> settings = {};

  bool get hasCredentials => address != null && _token != null;

  DateTime? get lastSync {
    final s = local?.state('last_sync');
    return s == null ? null : DateTime.tryParse(s)?.toLocal();
  }

  int get pending => local?.pendingCount() ?? 0;

  Future<void> start() async {
    final saved = await credentials.load();
    address = saved?.address;
    _token = saved?.token;
    local = await openDb();
    repo = Repo(local!);
    phase = local!.state('phase') ?? '';
    for (final k in settingKeys) {
      settings[k] = local!.state('pref_$k') ?? '';
    }
    loaded = true;
    notifyListeners();
    unawaited(rest.restore());
    if (hasCredentials) unawaited(syncNow());
  }

  /// Meldet an, speichert die Daten nur bei Erfolg und holt die Daten zum ersten Mal.
  Future<void> login(String addr, String token) async {
    final trimmed = addr.trim();
    final connection = await _connector(trimmed, token.trim());
    try {
      final result = SyncService(local!, connection);
      await result.sync();
    } finally {
      await connection.close();
    }
    await credentials.save(trimmed, token.trim());
    address = trimmed;
    _token = token.trim();
    syncError = null;
    notifyListeners();
  }

  Future<void> syncNow() async {
    if (!hasCredentials || syncing) return;
    syncing = true;
    syncError = null;
    notifyListeners();
    HaConnection? connection;
    try {
      connection = await _connector(address!, _token!);
      await SyncService(local!, connection).sync();
      final p = (await connection.call('hafs/pref/get', {'key': 'phase'}) as Map)['value'] as String? ?? '';
      phase = p;
      local!.setState('phase', p);
      for (final k in settingKeys) {
        try {
          final v = (await connection.call('hafs/pref/get', {'key': k}) as Map)['value'] as String? ?? '';
          settings[k] = v;
          local!.setState('pref_$k', v);
        } on HaException {
          // older server without this setting: keep the cached value
        }
      }
    } on HaException catch (e) {
      syncError = e.message;
    } catch (e) {
      syncError = '$e';
    } finally {
      await connection?.close();
      syncing = false;
      notifyListeners();
    }
  }

  /// Setzt die Ernährungsphase auf dem Server; die Zielwerte werden dort neu berechnet und beim Abgleich geholt.
  Future<void> setPhase(String value) async {
    if (!hasCredentials) return;
    final connection = await _connector(address!, _token!);
    try {
      await connection.call('hafs/pref/set', {'key': 'phase', 'value': value});
      phase = value;
      local!.setState('phase', value);
    } finally {
      await connection.close();
    }
    notifyListeners();
    await syncNow();
  }

  /// Barbell for the plate calculator (device local, not synced).
  double get plateBar => double.tryParse(local?.state('plate_bar') ?? '') ?? defaultBar;
  List<double> get plateSet => parsePlates(local?.state('plate_set') ?? '') ?? defaultPlates;

  void setPlates(double bar, List<double> plates) {
    local?.setState('plate_bar', '$bar');
    local?.setState('plate_set', plates.join(' '));
    notifyListeners();
  }

  /// Ändert eine Progressions-Einstellung auf dem Server (rechnet dort alle Zielwerte neu) und holt sie.
  Future<void> setSetting(String key, String value) async {
    if (!hasCredentials) return;
    final connection = await _connector(address!, _token!);
    try {
      await connection.call('hafs/pref/set', {'key': key, 'value': value});
      settings[key] = value;
      local!.setState('pref_$key', value);
    } finally {
      await connection.close();
    }
    notifyListeners();
    await syncNow();
  }

  /// Ein Schreibzugriff auf die Daten ist erfolgt: Oberfläche aktualisieren.
  void changed() => notifyListeners();

  /// Meldet ab. Die lokalen Daten (auch noch nicht gesendete) bleiben auf dem Gerät.
  Future<void> logout() async {
    await credentials.clear();
    address = null;
    _token = null;
    notifyListeners();
  }
}
