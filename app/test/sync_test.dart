import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/db.dart';
import 'package:hafs/ha_client.dart';
import 'package:hafs/repo.dart';
import 'package:hafs/sync.dart';
import 'package:sqlite3/sqlite3.dart';

import 'support.dart';

void main() {
  late LocalDb local;
  late FakeServer server;
  late SyncService sync;

  setUp(() {
    local = openMemory();
    server = FakeServer(local.schema.syncTables);
    sync = SyncService(local, server, batch: 2, pullLimit: 2);
  });

  tearDown(() => local.close());

  Map<String, Object?> exercise(String id, String name, String at) =>
      {'id': id, 'owner': 'u1', 'updated_at': at, 'deleted': 0, 'name': name, 'kind': 'strength'};

  test('schema asset: migrations run, dirty columns exist, second open is a no-op', () {
    for (final t in local.schema.syncTables) {
      final cols = [for (final r in local.db.select('PRAGMA table_info($t)')) r['name']];
      expect(cols, contains('dirty'), reason: t);
    }
    expect(local.state('server_schema'), '${local.schema.migrations.length}');
    final again = LocalDb.open(local.db, local.schema);
    expect(again.state('server_schema'), '${local.schema.migrations.length}');
  });

  test('first sync pulls everything, in several pages', () async {
    for (var i = 0; i < 5; i++) {
      server.put('exercise', exercise('e$i', 'Übung $i', '2026-11-01T10:00:0$i+00:00'));
    }
    final r = await sync.sync();
    expect(r.pulled, 5);
    expect(local.rows('SELECT id FROM exercise ORDER BY id'), hasLength(5));
    expect(server.calls.where((c) => c == 'hafs/sync/pull').length, greaterThan(1)); // paged with limit 2
    expect(local.pendingCount(), 0);
  });

  test('second sync only fetches what changed (cursor is kept)', () async {
    server.put('exercise', exercise('e1', 'A', '2026-11-01T10:00:00+00:00'));
    await sync.sync();
    server.put('exercise', exercise('e2', 'B', '2026-11-02T10:00:00+00:00'));
    server.calls.clear();
    final r = await sync.sync();
    expect(r.pulled, 1);
    expect(local.state('cursors'), contains('e2'));
  });

  test('local changes are pushed and no longer dirty afterwards', () async {
    server.put('exercise', exercise('e1', 'Bank', '2026-01-01T00:00:00+00:00'));
    await sync.sync();
    final repo = Repo(local);
    final w = repo.startWorkout();
    for (var i = 0; i < 3; i++) {
      repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 8);
    }
    expect(local.pendingCount(), 4);
    final r = await sync.sync();
    expect(r.pushed, 4);
    expect(local.pendingCount(), 0);
    expect(server.data['workout_set']!.length, 3);
    expect(server.data['workout']!.length, 1);
    expect(server.data['workout_set']!.values.first['owner'], 'u1'); // the server decides the owner
    expect(server.data.containsKey('dirty'), isFalse);
    expect(server.data['workout_set']!.values.first.containsKey('dirty'), isFalse);
  });

  test('offline: nothing is lost, the next sync sends it', () async {
    server.put('exercise', exercise('e1', 'Bank', '2026-01-01T00:00:00+00:00'));
    await sync.sync();
    final repo = Repo(local);
    final w = repo.startWorkout();
    repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 8);
    server.offline = true;
    await expectLater(sync.sync(), throwsA(isA<HaException>()));
    expect(local.pendingCount(), 2);
    server.offline = false;
    await sync.sync();
    expect(local.pendingCount(), 0);
    expect(server.data['workout_set'], hasLength(1));
  });

  test('a newer local edit that was not sent yet survives a pull', () async {
    server.put('exercise', exercise('e1', 'Server-Name', '2026-11-01T10:00:00+00:00'));
    await sync.sync();
    local.upsert('exercise', exercise('e1', 'Mein Name', '2026-11-05T10:00:00+00:00'), dirty: true);
    server.put('exercise', exercise('e1', 'Server alt', '2026-11-03T10:00:00+00:00'));
    server.offline = false;
    // pull would bring the older server version; the push happens first and wins
    await sync.sync();
    expect(local.row('SELECT name FROM exercise WHERE id = ?', ['e1'])!['name'], 'Mein Name');
    expect(server.data['exercise']!['e1']!['name'], 'Mein Name');
  });

  test('a newer server version replaces a clean local one', () async {
    server.put('exercise', exercise('e1', 'Alt', '2026-11-01T10:00:00+00:00'));
    await sync.sync();
    server.put('exercise', exercise('e1', 'Neu', '2026-11-02T10:00:00+00:00'));
    await sync.sync();
    expect(local.row('SELECT name FROM exercise WHERE id = ?', ['e1'])!['name'], 'Neu');
  });

  test('rejected records are parked (dirty = 2) and not sent again', () async {
    final repo = Repo(local);
    local.upsert('exercise', exercise('e1', 'Bank', '2026-01-01T00:00:00+00:00'), dirty: false);
    final w = repo.startWorkout();
    final bad = repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 8);
    server.rejectIds = {bad};
    final r = await sync.sync();
    expect(r.rejected, 1);
    expect(local.row('SELECT dirty FROM workout_set WHERE id = ?', [bad])!['dirty'], 2);
    expect(local.pendingCount(), 0);
    server.calls.clear();
    await sync.sync();
    expect(server.calls.where((c) => c == 'hafs/sync/push'), isEmpty);
  });

  test('tombstones travel both ways', () async {
    server.put('exercise', exercise('e1', 'Bank', '2026-01-01T00:00:00+00:00'));
    await sync.sync();
    final repo = Repo(local);
    final w = repo.startWorkout();
    final s = repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 8);
    await sync.sync();
    repo.deleteSet(s);
    await sync.sync();
    expect(server.data['workout_set']![s]!['deleted'], 1);
  });

  test('server targets arrive through the pull', () async {
    server.put('exercise', exercise('e1', 'Bank', '2026-01-01T00:00:00+00:00'));
    server.put('target', {
      'id': 't1', 'owner': 'u1', 'updated_at': '2026-11-09T10:00:00+00:00', 'deleted': 0, 'exercise_id': 'e1',
      'equipment_id': '', 'weight': 62.5, 'reps': 8, 'sets': null, 'reason': 'x', 'reason_code': 'hold', 'reason_params': '{}',
    });
    await sync.sync();
    expect(Repo(local).target('e1')!.weight, 62.5);
  });

  group('server checks', () {
    test('integration not set up', () async {
      final s = SyncService(local, FakeServer(local.schema.syncTables, ready: false));
      await expectLater(s.sync(), throwsA(isA<HaException>()));
    });
    test('server too old', () async {
      final s = SyncService(local, FakeServer(local.schema.syncTables, apiVersion: 0));
      await expectLater(s.sync(), throwsA(predicate((e) => e is HaException && e.message.contains('Server'))));
    });
    test('app too old', () async {
      final s = SyncService(local, FakeServer(local.schema.syncTables, apiVersion: 2));
      await expectLater(s.sync(), throwsA(predicate((e) => e is HaException && e.message.contains('App'))));
    });
  });

  test('websocketUri', () {
    expect(websocketUri('192.168.1.2:8123').toString(), 'ws://192.168.1.2:8123/api/websocket');
    expect(websocketUri('https://ha.example.org/').toString(), 'wss://ha.example.org/api/websocket');
    expect(() => websocketUri(' '), throwsA(isA<HaException>()));
  });

  test('local DB survives re-opening a file database', () {
    final dir = Directory.systemTemp.createTempSync('hafs_test');
    addTearDown(() => dir.deleteSync(recursive: true));
    final path = '${dir.path}/hafs.db';
    final a = LocalDb.open(sqlite3.open(path), local.schema);
    a.upsert('exercise', exercise('e1', 'Bank', '2026-01-01T00:00:00+00:00'), dirty: true);
    a.close();
    final b = LocalDb.open(sqlite3.open(path), local.schema);
    expect(b.pendingCount(), 1);
    b.close();
  });
}
