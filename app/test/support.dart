import 'dart:io';

import 'package:hafs/db.dart';
import 'package:hafs/ha_client.dart';
import 'package:sqlite3/sqlite3.dart';

/// Das echte Schema des Servers aus `assets/schema.json`.
Schema realSchema() => Schema.parse(File('assets/schema.json').readAsStringSync());

LocalDb openMemory() => LocalDb.open(sqlite3.openInMemory(), realSchema());

/// Bildet das Verhalten der Integration nach: `hafs/info`, `hafs/sync/push` (neuere Fassung gewinnt,
/// Datensätze ohne Pflichtfelder werden abgelehnt) und `hafs/sync/pull` (Cursor je Tabelle).
class FakeServer implements HaConnection {
  FakeServer(this.tables, {this.apiVersion = 1, this.ready = true});

  final List<String> tables;
  final int apiVersion;
  final bool ready;
  final Map<String, Map<String, Map<String, Object?>>> data = {};
  final List<String> calls = [];
  final Map<String, String> prefs = {};
  bool offline = false;
  String? userId; // the HA user of this connection, reported by hafs/info
  String? currentGymId;
  List<Map<String, Object?>> planDays = [];
  String? planError;
  final List<Map> planRequests = [];
  final List<Map> targetSets = [];
  List<Map<String, Object?>> reviewStagnating = [];
  Set<String> rejectIds = {};

  void put(String table, Map<String, Object?> record) => (data[table] ??= {})[record['id'] as String] = record;

  @override
  Future<void> get closed => Future.value();

  @override
  Future<void> close() async {}

  @override
  Future<dynamic> call(String type, [Map<String, dynamic> payload = const {}]) async {
    calls.add(type);
    if (offline) throw HaException('offline');
    switch (type) {
      case 'hafs/info':
        return {'api_version': apiVersion, 'version': '0.1.0', 'ready': ready, 'schema_version': 3, if (userId != null) 'user_id': userId};
      case 'hafs/plan/suggest':
        planRequests.add(payload);
        if (planError != null) throw HaException(planError!);
        return {'days': planDays};
      case 'hafs/gym/current':
        return {'zone': currentGymId == null ? null : 'zone.x', 'gym_id': currentGymId, 'gym': null};
      case 'hafs/pref/get':
        return {'key': payload['key'], 'value': prefs[payload['key']] ?? ''};
      case 'hafs/pref/set':
        prefs[payload['key'] as String] = payload['value'] as String;
        return {'key': payload['key'], 'value': payload['value'], 'targets': {}};
      case 'hafs/review':
        return {'stagnating': reviewStagnating, 'neglected': [], 'text': payload['ai'] == true ? 'KI-Text' : null};
      case 'hafs/target/set':
        targetSets.add(payload);
        for (final t in (data['target'] ??= {}).values) {
          if (t['exercise_id'] == payload['exercise_id']) {
            t['weight'] = payload['weight'];
            t['reason_code'] = 'manual';
            t['updated_at'] = '2099-01-01T00:00:00+00:00';
          }
        }
        return {'written': 1};
      case 'hafs/sync/push':
        var applied = 0;
        final rejected = <Map<String, Object?>>[];
        for (final entry in (payload['records'] as Map).entries) {
          for (final rec in (entry.value as List).cast<Map>()) {
            final r = rec.cast<String, Object?>();
            if (rejectIds.contains(r['id'])) {
              rejected.add({'table': entry.key, 'id': r['id'], 'reason': 'test'});
              continue;
            }
            final old = data[entry.key]?[r['id']];
            if (old == null || (r['updated_at'] as String).compareTo(old['updated_at'] as String) >= 0) {
              put(entry.key as String, {...r, 'owner': 'u1'});
              applied++;
            }
          }
        }
        return {'applied': applied, 'skipped': 0, 'rejected': rejected};
      case 'hafs/sync/pull':
        final cursors = ((payload['cursors'] ?? {}) as Map).cast<String, dynamic>();
        final limit = payload['limit'] as int;
        final records = <String, List<Map<String, Object?>>>{};
        final out = {...cursors};
        var more = false;
        for (final t in tables) {
          final cur = (cursors[t] ?? {'at': '', 'id': ''}) as Map;
          final rows = (data[t]?.values.toList() ?? [])
            ..sort((a, b) {
              final c = (a['updated_at'] as String).compareTo(b['updated_at'] as String);
              return c != 0 ? c : (a['id'] as String).compareTo(b['id'] as String);
            });
          final fresh = rows.where((r) {
            final c = (r['updated_at'] as String).compareTo(cur['at'] as String);
            return c > 0 || (c == 0 && (r['id'] as String).compareTo(cur['id'] as String) > 0);
          }).toList();
          if (fresh.length > limit) more = true;
          final page = fresh.take(limit).toList();
          records[t] = page;
          if (page.isNotEmpty) out[t] = {'at': page.last['updated_at'], 'id': page.last['id']};
        }
        return {'records': records, 'cursors': out, 'more': more};
    }
    throw HaException('unknown command $type', code: 'unknown_command');
  }
}
