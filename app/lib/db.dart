import 'dart:convert';

import 'package:sqlite3/sqlite3.dart';

/// Das Datenbankschema des Servers (`assets/schema.json`, erzeugt von `tools/export_schema.py`).
class Schema {
  Schema(this.migrations, this.syncTables);

  final List<String> migrations;
  final List<String> syncTables;

  factory Schema.parse(String json) {
    final data = jsonDecode(json) as Map<String, dynamic>;
    return Schema(
      [for (final m in data['migrations'] as List) m as String],
      [for (final t in data['sync_tables'] as List) t as String],
    );
  }
}

/// Zeitstempel im Format des Servers (`2026-11-10T18:00:00+00:00`, UTC, Sekunden), damit der
/// Textvergleich beim Abgleich stimmt.
String utcStamp(DateTime t) {
  final u = t.toUtc();
  String p(int v, [int w = 2]) => v.toString().padLeft(w, '0');
  return '${p(u.year, 4)}-${p(u.month)}-${p(u.day)}T${p(u.hour)}:${p(u.minute)}:${p(u.second)}+00:00';
}

/// Ortszeit ohne Zone (`2026-11-10T18:00:00`), wie Workouts und Sätze sie speichern.
String localStamp(DateTime t) {
  final l = t.toLocal();
  String p(int v, [int w = 2]) => v.toString().padLeft(w, '0');
  return '${p(l.year, 4)}-${p(l.month)}-${p(l.day)}T${p(l.hour)}:${p(l.minute)}:${p(l.second)}';
}

/// Lokale Kopie der Daten. Gleiche Tabellen wie auf dem Server, dazu je Tabelle `dirty`
/// (0 = abgeglichen, 1 = noch zu senden, 2 = vom Server abgelehnt).
class LocalDb {
  LocalDb._(this.db, this.schema);

  final Database db;
  final Schema schema;

  static LocalDb open(Database db, Schema schema) {
    final local = LocalDb._(db, schema);
    // Another connection (the notification buttons in the background) may be writing: wait instead of failing.
    db.execute('PRAGMA busy_timeout = 5000');
    local._migrate();
    return local;
  }

  void _migrate() {
    db.execute('CREATE TABLE IF NOT EXISTS sync_state(key TEXT PRIMARY KEY, value TEXT NOT NULL)');
    final done = int.tryParse(state('server_schema') ?? '') ?? 0;
    for (var i = done; i < schema.migrations.length; i++) {
      db.execute('BEGIN');
      try {
        db.execute(schema.migrations[i]);
        db.execute('INSERT OR REPLACE INTO sync_state(key, value) VALUES (?, ?)', ['server_schema', '${i + 1}']);
        db.execute('COMMIT');
      } catch (_) {
        db.execute('ROLLBACK');
        rethrow;
      }
    }
    for (final table in schema.syncTables) {
      final columns = {for (final r in db.select('PRAGMA table_info($table)')) r['name'] as String};
      if (!columns.contains('dirty')) {
        db.execute('ALTER TABLE $table ADD COLUMN dirty INTEGER NOT NULL DEFAULT 0');
      }
      db.execute('CREATE INDEX IF NOT EXISTS ${table}_dirty ON $table(dirty) WHERE dirty != 0');
    }
    db.execute('CREATE INDEX IF NOT EXISTS ws_exercise ON workout_set(exercise_id, done_at)');
  }

  String? state(String key) {
    final r = db.select('SELECT value FROM sync_state WHERE key = ?', [key]);
    return r.isEmpty ? null : r.first['value'] as String;
  }

  void setState(String key, String value) =>
      db.execute('INSERT OR REPLACE INTO sync_state(key, value) VALUES (?, ?)', [key, value]);

  void clearState(String key) => db.execute('DELETE FROM sync_state WHERE key = ?', [key]);

  List<Map<String, Object?>> rows(String sql, [List<Object?> params = const []]) =>
      [for (final r in db.select(sql, params)) {for (final k in r.keys) k: r[k]}];

  Map<String, Object?>? row(String sql, [List<Object?> params = const []]) {
    final r = rows(sql, params);
    return r.isEmpty ? null : r.first;
  }

  /// Schreibt einen Datensatz; `dirty: true` merkt ihn zum Senden vor.
  void upsert(String table, Map<String, Object?> values, {required bool dirty}) {
    final data = {...values, 'dirty': dirty ? 1 : 0};
    final names = data.keys.toList();
    db.execute(
      'INSERT OR REPLACE INTO $table(${names.join(', ')}) VALUES (${List.filled(names.length, '?').join(', ')})',
      [for (final n in names) data[n]],
    );
  }

  void transaction(void Function() body) {
    db.execute('BEGIN');
    try {
      body();
      db.execute('COMMIT');
    } catch (_) {
      db.execute('ROLLBACK');
      rethrow;
    }
  }

  /// Setting kept on the device when another user signs in (not data of the previous user).
  static const _deviceKeys = {'server_schema', 'plate_bar', 'plate_set'};

  /// The HA user whose data this database holds (`null` = unknown, from before the app tracked it).
  String? get userId => state('user_id');

  /// Deletes everything that belongs to the previous user: all records, also those not sent yet, the sync cursors and
  /// the cached settings. Device settings (plate calculator) stay. Used when another HA user signs in on this device.
  void clearUserData() {
    transaction(() {
      for (final t in schema.syncTables) {
        db.execute('DELETE FROM $t');
      }
      final keep = _deviceKeys.map((k) => "'$k'").join(', ');
      db.execute('DELETE FROM sync_state WHERE key NOT IN ($keep)');
    });
  }

  /// Anzahl der Datensätze, die noch an den Server gehen.
  int pendingCount() {
    var n = 0;
    for (final t in schema.syncTables) {
      n += db.select('SELECT COUNT(*) c FROM $t WHERE dirty = 1').first['c'] as int;
    }
    return n;
  }

  void close() => db.close();
}
