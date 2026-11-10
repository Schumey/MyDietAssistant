import 'dart:async';

import 'package:flutter/foundation.dart';

import 'credentials.dart';
import 'db.dart';
import 'ha_client.dart';
import 'repo.dart';
import 'sync.dart';

typedef Connector = Future<HaConnection> Function(String address, String token);

/// Zustand der App: Anmeldedaten, lokale Datenbank und der Abgleich mit Home Assistant.
///
/// Die Datenbank ist immer offen, auch ohne Verbindung: Training erfassen geht offline,
/// abgeglichen wird, wenn eine Verbindung da ist.
class AppState extends ChangeNotifier {
  AppState(this.credentials, {required this.openDb, Connector? connector})
      : _connector = connector ?? ((a, t) => HaClient.connect(a, t));

  final CredentialStore credentials;
  final Future<LocalDb> Function() openDb;
  final Connector _connector;

  bool loaded = false;
  String? address;
  String? _token;
  LocalDb? local;
  Repo? repo;
  bool syncing = false;
  String? syncError;
  String phase = '';

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
    loaded = true;
    notifyListeners();
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
