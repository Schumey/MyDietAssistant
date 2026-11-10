import 'dart:convert';

import 'db.dart';
import 'ha_client.dart';
import 'l10n.dart';

/// Version der WebSocket-API, die diese App spricht (`API_VERSION` der Integration).
const apiVersion = 1;

class SyncResult {
  SyncResult({this.pushed = 0, this.pulled = 0, this.rejected = 0});

  int pushed;
  int pulled;
  int rejected;
}

/// Gleicht die lokale Datenbank mit der Integration ab: erst eigene Änderungen senden,
/// dann abholen, was sich auf dem Server geändert hat (Zielwerte, Katalog, andere Geräte).
class SyncService {
  SyncService(this.local, this.connection, {this.batch = 500, this.pullLimit = 2000});

  final LocalDb local;
  final HaConnection connection;
  final int batch;
  final int pullLimit;

  Future<SyncResult> sync() async {
    await _checkServer();
    final result = SyncResult();
    await _push(result);
    await _pull(result);
    local.setState('last_sync', utcStamp(DateTime.now()));
    return result;
  }

  Future<void> _checkServer() async {
    final info = await connection.call('hafs/info') as Map<String, dynamic>;
    if (info['ready'] != true) throw HaException(tr('err_not_installed'));
    final server = info['api_version'] as int;
    if (server < apiVersion) throw HaException(tr('err_server_old', [server]));
    if (server > apiVersion) throw HaException(tr('err_app_old', [server]));
  }

  Future<void> _push(SyncResult result) async {
    for (final table in local.schema.syncTables) {
      while (true) {
        final rows = local.rows('SELECT * FROM $table WHERE dirty = 1 LIMIT ?', [batch]);
        if (rows.isEmpty) break;
        final records = [
          for (final r in rows) {for (final e in r.entries) if (e.key != 'dirty') e.key: e.value},
        ];
        final answer = await connection.call('hafs/sync/push', {'records': {table: records}}) as Map<String, dynamic>;
        final rejected = {
          for (final r in (answer['rejected'] as List? ?? const []))
            if ((r as Map)['table'] == table) r['id'] as String,
        };
        var cleared = 0;
        local.transaction(() {
          for (final r in rows) {
            final id = r['id'] as String;
            // Nur, wenn der Datensatz inzwischen nicht erneut geändert wurde.
            local.db.execute('UPDATE $table SET dirty = ? WHERE id = ? AND updated_at = ? AND dirty = 1',
                [rejected.contains(id) ? 2 : 0, id, r['updated_at']]);
            cleared += local.db.updatedRows;
          }
        });
        result.pushed += rows.length - rejected.length;
        result.rejected += rejected.length;
        if (cleared == 0) break; // alles inzwischen geändert: beim nächsten Abgleich erneut
      }
    }
  }

  Future<void> _pull(SyncResult result) async {
    final cursors = (jsonDecode(local.state('cursors') ?? '{}') as Map).cast<String, dynamic>();
    while (true) {
      final page = await connection.call('hafs/sync/pull', {
        if (cursors.isNotEmpty) 'cursors': cursors,
        'limit': pullLimit,
      }) as Map<String, dynamic>;
      final records = (page['records'] as Map).cast<String, dynamic>();
      local.transaction(() {
        for (final table in local.schema.syncTables) {
          for (final raw in (records[table] as List? ?? const [])) {
            if (_apply(table, (raw as Map).cast<String, Object?>())) result.pulled++;
          }
        }
        cursors.addAll((page['cursors'] as Map).cast<String, dynamic>());
        local.setState('cursors', jsonEncode(cursors));
      });
      if (page['more'] != true) break;
    }
  }

  /// Übernimmt einen Datensatz vom Server, außer lokal ist eine neuere, noch nicht gesendete Fassung.
  bool _apply(String table, Map<String, Object?> record) {
    final mine = local.row('SELECT dirty, updated_at FROM $table WHERE id = ?', [record['id']]);
    if (mine != null && mine['dirty'] == 1 && (mine['updated_at'] as String).compareTo(record['updated_at'] as String) > 0) {
      return false;
    }
    final known = {for (final r in local.db.select('PRAGMA table_info($table)')) r['name'] as String};
    local.upsert(table, {for (final e in record.entries) if (known.contains(e.key)) e.key: e.value}, dirty: false);
    return true;
  }
}
