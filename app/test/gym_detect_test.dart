import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/app_state.dart';
import 'package:hafs/credentials.dart';
import 'package:hafs/repo_gym.dart';

import 'support.dart';

class _Creds implements CredentialStore {
  @override
  Future<({String address, String token})?> load() async => (address: 'ha.local', token: 't');

  @override
  Future<void> save(String address, String token) async {}

  @override
  Future<void> clear() async {}
}

void main() {
  test('detectGym makes the gym of the current zone the default; failures are silent', () async {
    final local = openMemory();
    final server = FakeServer(local.schema.syncTables);
    final app = AppState(_Creds(), openDb: () async => local, connector: (a, t) async => server);
    await app.start();
    final repo = app.repo!;
    final a = repo.addGym('A');
    final b = repo.addGym('B');
    repo.setGymZone(b, 'zone.b');
    expect(repo.gyms().firstWhere((g) => g.id == b).zone, 'zone.b');
    repo.startWorkout(gymId: a); // remembers A as the last gym
    expect(repo.lastGymId(), a);

    server.currentGymId = b;
    expect(await app.detectGym(), b);
    expect(repo.lastGymId(), b);

    server.currentGymId = 'unknown-gym';
    expect(await app.detectGym(), isNull);
    expect(repo.lastGymId(), b);

    server.currentGymId = a;
    server.offline = true;
    expect(await app.detectGym(), isNull); // offline: no error, nothing changes
    expect(repo.lastGymId(), b);
  });
}
