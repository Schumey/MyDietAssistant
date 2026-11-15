import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/app_state.dart';
import 'package:hafs/credentials.dart';
import 'package:hafs/db.dart';
import 'package:hafs/l10n.dart';

import 'support.dart';

class _Creds implements CredentialStore {
  ({String address, String token})? saved;

  @override
  Future<({String address, String token})?> load() async => saved;

  @override
  Future<void> save(String address, String token) async => saved = (address: address, token: token);

  @override
  Future<void> clear() async => saved = null;
}

/// Two HA users sign in one after the other on the same device.
void main() {
  late LocalDb local;
  late FakeServer alice, bob;
  late AppState app;
  late _Creds creds;

  Map<String, Object?> exercise(String id, String name, String owner) =>
      {'id': id, 'owner': owner, 'updated_at': '2026-01-01T00:00:00+00:00', 'deleted': 0, 'name': name, 'kind': 'strength', 'catalog_key': ''};

  setUp(() async {
    L10n.lang = 'de';
    local = openMemory();
    creds = _Creds();
    alice = FakeServer(local.schema.syncTables)
      ..userId = 'alice'
      ..put('exercise', exercise('a1', 'Alices Übung', 'alice'));
    bob = FakeServer(local.schema.syncTables)
      ..userId = 'bob'
      ..put('exercise', exercise('b1', 'Bobs Übung', 'bob'));
    app = AppState(creds, openDb: () async => local, connector: (addr, token) async => token == 'tb' ? bob : alice);
    await app.start();
  });

  List<String> exerciseNames() => [for (final r in local.rows('SELECT name FROM exercise WHERE deleted = 0 ORDER BY name')) r['name'] as String];

  test('another user gets a clean device: nothing of the previous user is left or sent to the new account', () async {
    await app.login('ha.local', 'ta');
    expect(exerciseNames(), ['Alices Übung']);
    expect(local.userId, 'alice');
    // an unsent change of Alice
    final w = app.repo!.startWorkout();
    expect(local.pendingCount(), greaterThan(0));
    alice.offline = true; // logout cannot send it
    await app.logout();

    await app.login('ha.local', 'tb');
    expect(exerciseNames(), ['Bobs Übung']);
    expect(local.userId, 'bob');
    expect(local.rows('SELECT id FROM workout WHERE id = ?', [w]), isEmpty);
    expect(bob.data['workout'] ?? {}, isEmpty, reason: 'Alice\'s workout must not reach Bob\'s account');
    expect(local.state('cursors'), isNot(contains('a1')));
  });

  test('the same user signing in again keeps the data, including unsent changes', () async {
    await app.login('ha.local', 'ta');
    final w = app.repo!.startWorkout();
    alice.offline = true;
    await app.logout();
    alice.offline = false;
    await app.login('ha.local', 'ta');
    expect(local.rows('SELECT id FROM workout WHERE id = ?', [w]), hasLength(1));
    await app.syncNow();
    expect(alice.data['workout']!.keys, contains(w));
  });

  test('logout sends unsent changes first when the server is reachable', () async {
    await app.login('ha.local', 'ta');
    final w = app.repo!.startWorkout();
    await app.logout();
    expect(alice.data['workout']!.keys, contains(w));
  });

  test('device settings survive the change of user; cached settings do not', () async {
    await app.login('ha.local', 'ta');
    app.setPlates(15, [20, 10]);
    local.setState('pref_rest_default', '120');
    await app.logout();
    await app.login('ha.local', 'tb');
    expect(app.plateBar, 15);
    expect(local.state('pref_rest_default'), anyOf(isNull, ''));
  });

  test('an older server without user_id keeps working as before', () async {
    alice.userId = null;
    await app.login('ha.local', 'ta');
    expect(exerciseNames(), ['Alices Übung']);
    expect(local.userId, isNull);
  });

  test('a normal sync with a token of another user is refused instead of mixing data', () async {
    await app.login('ha.local', 'ta');
    creds.saved = (address: 'ha.local', token: 'tb'); // token swapped behind the app's back
    app = AppState(creds, openDb: () async => local, connector: (addr, token) async => token == 'tb' ? bob : alice);
    await app.start(); // starts a sync by itself
    await app.syncNow();
    while (app.syncing) {
      await Future<void>.delayed(const Duration(milliseconds: 5));
    }
    expect(app.syncError, contains('another user'));
    expect(exerciseNames(), ['Alices Übung']);
  });
}
