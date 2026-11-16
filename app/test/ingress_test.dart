import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/ha_client.dart';
import 'package:hafs/ingress.dart';

/// Home Assistant's WebSocket as far as ingress needs it, plus the former integration's `hafs/info`.
class FakeWs implements HaConnection {
  FakeWs({this.slugs = const {'eeb2daa3_mydiet'}, this.path = '/api/hassio_ingress/tok/', this.legacy = false, this.unauthorized = false});

  final Set<String> slugs;
  final String path;
  final bool legacy;
  final bool unauthorized;
  final calls = <String>[];
  int sessions = 0;
  bool closedCalled = false;

  @override
  Future<void> get closed => Future.value();

  @override
  Future<void> close() async => closedCalled = true;

  @override
  Future<dynamic> call(String type, [Map<String, dynamic> payload = const {}]) async {
    calls.add('$type ${payload['slug'] ?? ''}'.trim());
    switch (type) {
      case 'supervisor/ingress/info':
        if (unauthorized) throw HaException('Unauthorized', code: 'unauthorized');
        if (!slugs.contains(payload['slug'])) throw HaException('Addon does not exist', code: 'unknown_error');
        return {'name': 'MyDietAssistant', 'slug': payload['slug'], 'ingress_url': path, 'state': 'started'};
      case 'supervisor/ingress/session':
        sessions++;
        return {'session': 'sess$sessions'};
      case 'hafs/info':
        if (legacy) return {'api_version': 1, 'ready': true};
        throw HaException('Unknown command.', code: 'unknown_command');
    }
    throw HaException('Unknown command.', code: 'unknown_command');
  }
}

/// Two apps: the 1.x one answers 404 (its ingress path has no training endpoint), the 2.0 one is the app server.
class _TwoApps extends FakeWs {
  _TwoApps() : super(slugs: {'eeb2daa3_mydiet', 'local_mydiet'});

  @override
  Future<dynamic> call(String type, [Map<String, dynamic> payload = const {}]) async {
    final r = await super.call(type, payload);
    if (type == 'supervisor/ingress/info' && payload['slug'] == 'eeb2daa3_mydiet') {
      return {...(r as Map), 'ingress_url': '/api/hassio_ingress/old/'};
    }
    return r;
  }
}

/// The HA app behind ingress: `POST /api/hassio_ingress/tok/api/training/call`, valid sessions in [valid].
Future<(HttpServer, List<Map>)> appServer({Set<String> valid = const {'sess1'}, bool trainingOff = false}) async {
  final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
  final seen = <Map>[];
  server.listen((req) async {
    final body = await utf8.decoder.bind(req).join();
    final cookie = req.cookies.where((c) => c.name == 'ingress_session').map((c) => c.value).firstOrNull;
    if (req.uri.path != '/api/hassio_ingress/tok/api/training/call') {
      req.response.statusCode = 404;
    } else if (!valid.contains(cookie)) {
      req.response.statusCode = 401;
      req.response.write('401: Unauthorized');
    } else {
      final msg = jsonDecode(body) as Map;
      seen.add({...msg, 'cookie': cookie});
      req.response.headers.contentType = ContentType.json;
      if (trainingOff) {
        req.response.statusCode = 403;
        req.response.write(jsonEncode({'code': 'not_enabled', 'message': 'Training ist aus'}));
      } else if (msg['type'] == 'hafs/info') {
        req.response.write(jsonEncode({'api_version': 1, 'ready': true, 'user_id': 'u1'}));
      } else if (msg['type'] == 'hafs/nope') {
        req.response.statusCode = 404;
        req.response.write(jsonEncode({'code': 'unknown_command', 'message': 'hafs/nope'}));
      } else {
        req.response.write(jsonEncode({'echo': msg}));
      }
    }
    await req.response.close();
  });
  return (server, seen);
}

void main() {
  test('session and ingress URL come from the WebSocket; the second slug is tried', () async {
    final ws = FakeWs(slugs: {'local_mydiet'}, path: '/api/hassio_ingress/tok');
    final opener = IngressOpener(ws: (a, t) async => ws);
    final access = await opener.open('http://ha.local:8123', 't');
    expect(access.path, '/api/hassio_ingress/tok/');
    expect(access.session, 'sess1');
    expect(access.slug, 'local_mydiet');
    expect(access.url('api/training/call').toString(), 'http://ha.local:8123/api/hassio_ingress/tok/api/training/call');
    expect(access.panelUrl.toString(), 'http://ha.local:8123/hassio/ingress/local_mydiet');
    expect(ws.closedCalled, isTrue);
    // cached: no new session; the slug that worked is asked first next time
    expect((await opener.open('http://ha.local:8123', 't')).session, 'sess1');
    final fresh = await opener.open('http://ha.local:8123', 't', fresh: true);
    expect(fresh.session, 'sess2');
    expect(ws.calls.where((c) => c.startsWith('supervisor/ingress/info')).last, 'supervisor/ingress/info local_mydiet');
  });

  test('an install from the renamed repository is found by its own slug', () async {
    final access = await IngressOpener(ws: (a, t) async => FakeWs(slugs: {'b9221a9a_mydiet'})).open('http://ha.local:8123', 't');
    expect(access.slug, 'b9221a9a_mydiet');
  });

  test('a missing app and an admin-only panel give readable errors', () async {
    await expectLater(IngressOpener(ws: (a, t) async => FakeWs(slugs: {})).open('ha', 't'),
        throwsA(isA<HaException>().having((e) => e.code, 'code', 'app_missing')));
    await expectLater(IngressOpener(ws: (a, t) async => FakeWs(unauthorized: true)).open('ha', 't'),
        throwsA(isA<HaException>().having((e) => e.code, 'code', 'unauthorized')));
  });

  test('sessionOf reads the token also when nested', () {
    expect(sessionOf({'session': 'a'}), 'a');
    expect(sessionOf({'session': {'session': 'b'}}), 'b');
    expect(sessionOf('c'), 'c');
    expect(sessionOf({'session': ''}), isNull);
  });

  test('calls go over HTTP with the cookie; errors keep the server message and code', () async {
    final (server, seen) = await appServer();
    addTearDown(() => server.close(force: true));
    final ws = FakeWs();
    final opener = IngressOpener(ws: (a, t) async => ws);
    final c = await connectTraining('http://127.0.0.1:${server.port}', 't', opener: opener, ws: (a, t) async => FakeWs());
    expect(c, isA<IngressConnection>());
    final r = await c.call('hafs/sync/pull', {'limit': 5}) as Map;
    expect(r['echo'], {'type': 'hafs/sync/pull', 'limit': 5});
    expect(seen.last['cookie'], 'sess1');
    await expectLater(c.call('hafs/nope'), throwsA(isA<HaException>().having((e) => e.code, 'code', 'unknown_command')));
    await c.close();
  });

  test('an expired session is renewed once', () async {
    final (server, seen) = await appServer(valid: {'sess2'});
    addTearDown(() => server.close(force: true));
    final ws = FakeWs();
    final opener = IngressOpener(ws: (a, t) async => ws);
    final address = 'http://127.0.0.1:${server.port}';
    final c = IngressConnection(opener, address, 't', await opener.open(address, 't'));
    expect(await c.call('hafs/info'), containsPair('user_id', 'u1'));
    expect(seen.single['cookie'], 'sess2');
    expect(ws.sessions, 2);
    await c.close();
  });

  test('an older MyDietAssistant under the first slug is skipped for the next one', () async {
    final (server, seen) = await appServer(valid: {'sess1', 'sess2'});
    addTearDown(() => server.close(force: true));
    // both slugs installed: eeb2daa3_mydiet is 1.x (no training endpoint, 404), local_mydiet is HAFS 2.0
    final ws = _TwoApps();
    final opener = IngressOpener(ws: (a, t) async => ws);
    final c = await connectTraining('http://127.0.0.1:${server.port}', 't', opener: opener, ws: (a, t) async => FakeWs());
    expect(c, isA<IngressConnection>());
    expect((c as IngressConnection).access.slug, 'local_mydiet');
    expect(seen.single['type'], 'hafs/info');
    await c.close();
  });

  test('without the HA app, or with training off there, the former integration is used', () async {
    final legacy = FakeWs(legacy: true);
    final c1 = await connectTraining('http://ha', 't', opener: IngressOpener(ws: (a, t) async => FakeWs(slugs: {})), ws: (a, t) async => legacy);
    expect(c1, same(legacy));

    final (server, _) = await appServer(trainingOff: true);
    addTearDown(() => server.close(force: true));
    final address = 'http://127.0.0.1:${server.port}';
    final legacy2 = FakeWs(legacy: true);
    final c2 = await connectTraining(address, 't', opener: IngressOpener(ws: (a, t) async => FakeWs()), ws: (a, t) async => legacy2);
    expect(c2, same(legacy2));
    // no integration either: the HA app's own message
    await expectLater(connectTraining(address, 't', opener: IngressOpener(ws: (a, t) async => FakeWs()), ws: (a, t) async => FakeWs()),
        throwsA(isA<HaException>().having((e) => e.code, 'code', 'not_enabled')));
  });
}
