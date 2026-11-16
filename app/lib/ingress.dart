/// Connection to the HAFS app in Home Assistant (the HA app `mydiet`) through ingress.
///
/// With the long-lived token the app opens Home Assistant's WebSocket and asks for an ingress session
/// (`supervisor/ingress/session`, HA 2026.11+; non-admins may do it when the app's panel is not admin-only) and for the
/// app's ingress URL (`supervisor/ingress/info`). After that it speaks plain HTTP with the HA app:
/// `POST <ingress_url>api/training/call` with the cookie `ingress_session`, the same messages as the former WebSocket
/// commands `hafs/*`. The nutrition area (WebView) and the self-update use the same session.
///
/// While moving over from the former integration `hafs` the app falls back to it: when the HA app is missing (or
/// training is switched off there) and the integration still answers `hafs/info` over the WebSocket.
library;

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'ha_client.dart';
import 'l10n.dart';
import 'updater.dart' show httpBase;

/// Slugs the HA app may have: installed from the GitHub repository (first 8 hex digits of the SHA-1 of its lowercased
/// address: `eeb2daa3` for github.com/schumey/mydietassistant, which installs from before the rename keep, `b9221a9a`
/// for github.com/schumey/hafs) or as a local app.
const defaultSlugs = ['eeb2daa3_mydiet', 'b9221a9a_mydiet', 'local_mydiet'];

typedef WsConnector = Future<HaConnection> Function(String address, String token);

/// A usable ingress session: where the HA app is and the cookie that lets us in.
class IngressAccess {
  IngressAccess({required this.base, required this.path, required this.session, required this.slug, DateTime? at})
      : at = at ?? DateTime.now();

  /// Home Assistant's HTTP base (scheme, host, port, path prefix).
  final Uri base;

  /// The HA app's ingress path, e.g. `/api/hassio_ingress/abc…/` (always ends with a slash).
  final String path;
  final String session;
  final String slug;
  final DateTime at;

  /// [rel] below the HA app, e.g. `api/training/call`.
  Uri url([String rel = '']) => base.replace(path: '${base.path}$path$rel');

  /// Home Assistant's own page of the app (for a browser, which signs in there itself).
  Uri get panelUrl => base.replace(path: '${base.path}/hassio/ingress/$slug');

  String get cookie => 'ingress_session=$session';
}

/// Opens ingress sessions and keeps one per address and token for [maxAge] (sessions live longer on the Supervisor).
class IngressOpener {
  IngressOpener({WsConnector? ws, this.slugs = defaultSlugs, this.maxAge = const Duration(minutes: 10)})
      : _ws = ws ?? ((a, t) => HaClient.connect(a, t));

  final WsConnector _ws;
  final List<String> slugs;
  final Duration maxAge;
  final Map<String, IngressAccess> _cache = {};
  String? _slug; // the slug that worked last
  final Set<String> _skip = {}; // apps without training (an older MyDietAssistant 1.x under that slug)
  final Map<String, bool> _hafs = {}; // slugs known to be HAFS 2, with "training on"

  /// The app under [slug] answered as HAFS 2 (see [openHafsApp]); [training] is false while training is off there.
  void verified(String slug, {required bool training}) => _hafs[slug] = training;
  bool isHafs(String slug) => _hafs.containsKey(slug);
  bool trainingOn(String slug) => _hafs[slug] ?? false;

  /// The app under [slug] has no training endpoint: look further next time.
  void skip(String slug) {
    _skip.add(slug);
    _hafs.remove(slug);
    if (_slug == slug) _slug = null;
    _cache.removeWhere((_, a) => a.slug == slug);
  }

  Future<IngressAccess> open(String address, String token, {bool fresh = false}) async {
    final key = '$address\n$token';
    final cached = _cache[key];
    if (!fresh && cached != null && DateTime.now().difference(cached.at) < maxAge) return cached;
    final ws = await _ws(address, token);
    try {
      HaException? last;
      for (final slug in [?_slug, ...slugs.where((s) => s != _slug)].where((s) => !_skip.contains(s))) {
        final Map info;
        try {
          info = await ws.call('supervisor/ingress/info', {'slug': slug}) as Map;
        } on HaException catch (e) {
          if (e.code == 'unauthorized') throw HaException(tr('err_app_admin'), code: 'unauthorized');
          last = e;
          continue; // not installed under this slug, or Home Assistant older than 2026.11
        }
        var path = info['ingress_url'] as String? ?? '';
        if (path.isEmpty) continue;
        if (!path.endsWith('/')) path = '$path/';
        if (!path.startsWith('/')) path = '/$path';
        final answer = await ws.call('supervisor/ingress/session', {'slug': slug});
        final session = sessionOf(answer);
        if (session == null) throw HaException(tr('err_unknown'));
        _slug = slug;
        return _cache[key] = IngressAccess(base: httpBase(address), path: path, session: session, slug: slug);
      }
      throw HaException(tr('err_app_missing'), code: last?.code == 'unknown_command' ? 'ha_old' : 'app_missing');
    } finally {
      try {
        await ws.close();
      } catch (_) {}
    }
  }

  void forget(String address, String token) => _cache.remove('$address\n$token');
}

/// The session token from the answer of `supervisor/ingress/session` (`{"session": "…"}`, tolerant of nesting).
String? sessionOf(Object? answer) {
  Object? v = answer;
  for (var i = 0; i < 3 && v is Map; i++) {
    v = v['session'];
  }
  return v is String && v.isNotEmpty ? v : null;
}

/// [HaConnection] over HTTP to `api/training/call`. A rejected session (401/403 from ingress) is renewed once.
class IngressConnection implements HaConnection {
  IngressConnection(this._opener, this._address, this._token, this.access, {HttpClient? client}) : _client = client ?? HttpClient();

  final IngressOpener _opener;
  final String _address;
  final String _token;
  final HttpClient _client;
  IngressAccess access;
  final _closed = Completer<void>();

  @override
  Future<void> get closed => _closed.future;

  @override
  Future<dynamic> call(String type, [Map<String, dynamic> payload = const {}]) async {
    var (status, body) = await _post(type, payload);
    if (status == 401 || (status == 403 && !_isJsonError(body))) {
      access = await _opener.open(_address, _token, fresh: true);
      (status, body) = await _post(type, payload);
    }
    Object? json;
    try {
      json = jsonDecode(body);
    } catch (_) {
      json = null;
    }
    if (status == 200) return json;
    if (json is Map && json['message'] is String) throw HaException(json['message'] as String, code: json['code'] as String?);
    throw HaException(tr('err_http', [status]), code: 'http_$status');
  }

  static bool _isJsonError(String body) {
    try {
      final j = jsonDecode(body);
      return j is Map && j['code'] is String;
    } catch (_) {
      return false;
    }
  }

  Future<(int, String)> _post(String type, Map<String, dynamic> payload) async {
    try {
      final request = await _client.postUrl(access.url('api/training/call')).timeout(const Duration(seconds: 15));
      request.headers.set(HttpHeaders.cookieHeader, access.cookie);
      request.headers.contentType = ContentType.json;
      request.add(utf8.encode(jsonEncode({'type': type, ...payload})));
      final response = await request.close().timeout(const Duration(seconds: 60));
      return (response.statusCode, await utf8.decoder.bind(response).join());
    } on TimeoutException {
      throw HaException(tr('err_no_answer'));
    } on SocketException catch (e) {
      throw HaException(tr('err_no_connection', [e.message]));
    } on HttpException catch (e) {
      throw HaException(tr('err_no_connection', [e.message]));
    }
  }

  @override
  Future<void> close() async {
    _client.close(force: true);
    if (!_closed.isCompleted) _closed.complete();
  }
}

/// Connects to training: the HA app over ingress, or (while moving over) the former integration over the WebSocket.
Future<HaConnection> connectTraining(String address, String token, {required IngressOpener opener, WsConnector? ws, HttpClient? client}) async {
  final legacy = ws ?? ((a, t) => HaClient.connect(a, t));
  final IngressAccess access;
  try {
    access = await openHafsApp(opener, address, token);
  } on HaException catch (e) {
    if (e is HaAuthException || (e.code != 'app_missing' && e.code != 'ha_old')) rethrow;
    return _legacyOr(legacy, address, token, e);
  }
  if (!opener.trainingOn(access.slug)) {
    // training still off in the HA app: the integration may still have it
    return _legacyOr(legacy, address, token, HaException(tr('err_unknown'), code: 'not_enabled'));
  }
  return IngressConnection(opener, address, token, access, client: client);
}

/// A session for HAFS 2 among the installed apps, for training and the nutrition page alike. A slug answering
/// `hafs/info` with 404 is MyDietAssistant 1.x (no training endpoint): it is skipped and the next one tried, so both areas
/// always show the same HA app, whichever opens first. `not_enabled` (training off there) is still HAFS 2.
Future<IngressAccess> openHafsApp(IngressOpener opener, String address, String token, {bool fresh = false}) async {
  while (true) {
    final access = await opener.open(address, token, fresh: fresh);
    if (opener.isHafs(access.slug)) return access;
    final connection = IngressConnection(opener, address, token, access); // own client: close() ends it
    try {
      await connection.call('hafs/info');
      opener.verified(access.slug, training: true);
      return connection.access;
    } on HaException catch (e) {
      if (e.code == 'http_404') {
        opener.skip(access.slug); // MyDietAssistant 1.x under this slug: try the next one
        continue;
      }
      if (e.code != 'not_enabled') rethrow;
      opener.verified(access.slug, training: false);
      return connection.access;
    } finally {
      await connection.close();
    }
  }
}

Future<HaConnection> _legacyOr(WsConnector legacy, String address, String token, HaException reason) async {
  HaConnection? ws;
  try {
    ws = await legacy(address, token);
    await ws.call('hafs/info');
    return ws;
  } on HaAuthException {
    await ws?.close();
    rethrow;
  } catch (_) {
    await ws?.close();
    throw reason;
  }
}
