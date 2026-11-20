/// Self-update from the Home Assistant that the app is connected to.
///
/// The HA app serves the newest `hafs-<version>.apk` from `/share/hafs/app` (`GET <ingress>api/training/app` for the
/// offer, `…/api/training/app/<name>` for the file, with the ingress session). While moving over, the former
/// integration still answers at `GET /api/hafs/app` (from `/config/hafs/app`, with the long-lived token).
/// Besides that the app looks at the public GitHub releases (`app-v<version>` with `hafs-<version>.apk`), so updates also
/// arrive when Home Assistant cannot be reached (away from home). The newer of both wins; on a tie Home Assistant does.
library;

import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:crypto/crypto.dart';
import 'package:open_filex/open_filex.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppOffer {
  const AppOffer({
    required this.version,
    required this.name,
    required this.size,
    required this.sha256,
    this.fileUrl,
    this.cookie,
    this.external = false,
  });

  final String version;
  final String name;
  final int size;
  final String sha256;

  /// Where the file comes from when it is not the integration's `/api/hafs/app/<name>` (the HA app over ingress).
  final Uri? fileUrl;
  final String? cookie;

  /// The file is on GitHub: no Home Assistant credentials go with the request.
  final bool external;

  AppOffer at(Uri url, String cookie) => AppOffer(version: version, name: name, size: size, sha256: sha256, fileUrl: url, cookie: cookie);

  /// The newest `app-v…` release of GitHub's `releases` list (an apk asset with a `sha256:` digest); null if there is none.
  static AppOffer? fromGitHub(Object? json) {
    if (json is! List) return null;
    AppOffer? best;
    for (final release in json) {
      if (release is! Map || release['draft'] == true || release['prerelease'] == true) continue;
      final tag = release['tag_name'];
      if (tag is! String || !tag.startsWith('app-v')) continue;
      final version = tag.substring(5);
      final assets = release['assets'];
      if (!RegExp(r'^\d+(\.\d+)*$').hasMatch(version) || assets is! List) continue;
      for (final asset in assets) {
        if (asset is! Map) continue;
        final name = asset['name'], size = asset['size'], digest = asset['digest'], url = asset['browser_download_url'];
        if (name is! String || size is! num || digest is! String || url is! String) continue;
        if (name != 'hafs-$version.apk' || !digest.startsWith('sha256:')) continue;
        final uri = Uri.tryParse(url);
        if (uri == null || uri.scheme != 'https') continue;
        if (best == null || compareVersions(version, best.version) > 0) {
          best = AppOffer(
            version: version,
            name: name,
            size: size.toInt(),
            sha256: digest.substring(7).toLowerCase(),
            fileUrl: uri,
            external: true,
          );
        }
      }
    }
    return best;
  }

  /// Reads the answer of `GET /api/hafs/app`; null if it is not usable.
  static AppOffer? parse(Object? json) {
    if (json is! Map) return null;
    final version = json['version'], name = json['name'], size = json['size'], digest = json['sha256'];
    if (version is! String || name is! String || size is! num || digest is! String) return null;
    if (!RegExp(r'^\d+(\.\d+)*$').hasMatch(version) || !RegExp(r'^hafs-[\d.]+\.apk$').hasMatch(name)) return null;
    return AppOffer(version: version, name: name, size: size.toInt(), sha256: digest.toLowerCase());
  }
}

/// "0.9.14" -> [0, 9, 14]; anything unreadable counts as 0.
List<int> parseVersion(String version) => [for (final part in version.split('+').first.split('.')) int.tryParse(part) ?? 0];

int compareVersions(String a, String b) {
  final x = parseVersion(a), y = parseVersion(b);
  for (var i = 0; i < x.length || i < y.length; i++) {
    final d = (i < x.length ? x[i] : 0) - (i < y.length ? y[i] : 0);
    if (d != 0) return d.sign;
  }
  return 0;
}

/// Base URL (http or https, with a path prefix if Home Assistant sits below one) for the HTTP API.
Uri httpBase(String address) {
  var text = address.trim();
  if (!text.contains('://')) text = 'http://$text';
  final uri = Uri.parse(text);
  final secure = uri.scheme == 'https' || uri.scheme == 'wss';
  final base = uri.path.endsWith('/') ? uri.path.substring(0, uri.path.length - 1) : uri.path;
  return Uri(scheme: secure ? 'https' : 'http', host: uri.host, port: uri.hasPort ? uri.port : null, path: base);
}

/// What the updater needs from an ingress session: the URL below the HA app and the cookie.
typedef IngressLink = Future<({Uri Function(String rel) url, String cookie})> Function();

class Updater {
  Updater({required this.address, required this.token, this.currentVersionOverride, this.ingress, this.githubReleases});

  final String address;
  final String token;
  final String? currentVersionOverride;

  /// The HA app over ingress; null or failing: the former integration.
  final IngressLink? ingress;

  /// GitHub's release list of the project (null: do not look there).
  final Uri? githubReleases;

  static final githubReleasesUrl = Uri.parse('https://api.github.com/repos/Schumey/HAFS/releases?per_page=10');

  static const _checkedKey = 'update_checked_at';

  /// Only Android installs packages; the Windows build is started from the build folder.
  static bool get supported => Platform.isAndroid;

  Future<String> currentVersion() async => currentVersionOverride ?? (await PackageInfo.fromPlatform()).version;

  Uri _url(String path) {
    final base = httpBase(address);
    return base.replace(path: '${base.path}$path');
  }

  Future<HttpClientResponse> _get(HttpClient client, Uri url, {String? cookie, int from = 0, bool anonymous = false}) async {
    final request = await client.getUrl(url).timeout(const Duration(seconds: 15));
    if (anonymous) {
      // GitHub: never send the Home Assistant token there
    } else if (cookie != null) {
      request.headers.set(HttpHeaders.cookieHeader, cookie);
    } else {
      request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $token');
    }
    if (from > 0) request.headers.set(HttpHeaders.rangeHeader, 'bytes=$from-');
    return request.close().timeout(const Duration(seconds: 30));
  }

  /// The offer of the HA app (ingress); null when it has none or cannot be reached.
  Future<AppOffer?> _checkIngress(HttpClient client) async {
    final link = ingress;
    if (link == null) return null;
    try {
      final l = await link();
      final response = await _get(client, l.url('api/training/app'), cookie: l.cookie);
      if (response.statusCode != 200) {
        await response.drain<void>();
        return null;
      }
      final offer = AppOffer.parse(jsonDecode(await utf8.decoder.bind(response).join()));
      return offer?.at(l.url('api/training/app/${offer.name}'), l.cookie);
    } catch (_) {
      return null;
    }
  }

  /// The newest app release on GitHub; null when there is none or GitHub cannot be reached.
  Future<AppOffer?> _checkGitHub(HttpClient client) async {
    final url = githubReleases;
    if (url == null) return null;
    try {
      final response = await _get(client, url, anonymous: true);
      if (response.statusCode != 200) {
        await response.drain<void>();
        return null;
      }
      return AppOffer.fromGitHub(jsonDecode(await utf8.decoder.bind(response).join()));
    } catch (_) {
      return null;
    }
  }

  /// Asks Home Assistant and GitHub for the newest package; null when the installed version is the newest (or nothing is
  /// offered). The newer offer wins, Home Assistant on a tie. Without GitHub's answer an error of Home Assistant is thrown.
  Future<AppOffer?> check() async {
    final client = HttpClient();
    try {
      final current = await currentVersion();
      final github = await _checkGitHub(client);
      AppOffer? home;
      Object? failure;
      try {
        home = await _checkHome(client);
      } catch (e) {
        failure = e;
      }
      if (failure != null && github == null) throw failure;
      final best = home != null && (github == null || compareVersions(github.version, home.version) <= 0) ? home : github;
      return best != null && compareVersions(best.version, current) > 0 ? best : null;
    } finally {
      client.close(force: true);
    }
  }

  /// The newest package of Home Assistant (the app over ingress, else the former integration); null when none.
  Future<AppOffer?> _checkHome(HttpClient client) async {
    {
      final viaApp = await _checkIngress(client);
      if (viaApp != null) return viaApp;
      final response = await _get(client, _url('/api/hafs/app'));
      if (response.statusCode == 404) {
        await response.drain<void>();
        return null;
      } // older server or no package uploaded
      if (response.statusCode == 401) throw const HttpException('Not signed in (token rejected)');
      if (response.statusCode != 200) throw HttpException('HTTP ${response.statusCode}');
      final offer = AppOffer.parse(jsonDecode(await utf8.decoder.bind(response).join()));
      if (offer == null) throw const FormatException('Unexpected answer from Home Assistant');
      return offer;
    }
  }

  /// At most once a day, for the check at start; errors stay silent.
  Future<AppOffer?> checkDaily() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final last = DateTime.fromMillisecondsSinceEpoch(prefs.getInt(_checkedKey) ?? 0);
      if (DateTime.now().difference(last) < const Duration(hours: 20)) return null;
      final offer = await check();
      await prefs.setInt(_checkedKey, DateTime.now().millisecondsSinceEpoch);
      return offer;
    } catch (_) {
      return null;
    }
  }

  /// Downloads the package into the cache folder and checks size and SHA-256; [onProgress] gets 0..1.
  ///
  /// The download survives a locked phone or a dropped connection: the data goes to `<name>.part`, and after a broken
  /// connection (Android throttles the app while the screen is off) the request is repeated with a `Range` header
  /// from where it stopped, up to [maxAttempts] times. A server that ignores `Range` just sends everything again.
  /// A partial file of a failed run stays, so the next try resumes there.
  Future<File> download(
    AppOffer offer,
    void Function(double? progress) onProgress, {
    Directory? into,
    int maxAttempts = 40,
    Duration retryDelay = const Duration(seconds: 3),
  }) async {
    final dir = Directory('${(into ?? await getTemporaryDirectory()).path}${Platform.pathSeparator}hafs-update');
    await dir.create(recursive: true);
    final file = File('${dir.path}${Platform.pathSeparator}${offer.name}');
    final part = File('${file.path}.part');
    await for (final entry in dir.list()) {
      if (entry.path != part.path) await entry.delete(recursive: true); // older versions, finished files
    }
    for (var attempt = 1; ; attempt++) {
      try {
        await _fetch(part, offer, onProgress);
        break;
      } catch (e) {
        final retry = e is TimeoutException || (e is IOException && e is! _Fatal);
        if (!retry || attempt >= maxAttempts) rethrow;
        await Future<void>.delayed(retryDelay);
      }
    }
    final digest = (await sha256.bind(part.openRead()).first).toString();
    if (digest != offer.sha256) {
      await part.delete();
      throw _Fatal('Checksum does not match');
    }
    return part.rename(file.path);
  }

  /// One request; continues [part] when it already holds the beginning of the file.
  Future<void> _fetch(File part, AppOffer offer, void Function(double? progress) onProgress) async {
    var have = await part.exists() ? await part.length() : 0;
    if (offer.size > 0 && have > offer.size) {
      await part.delete();
      have = 0;
    }
    if (offer.size > 0 && have == offer.size) {
      onProgress(1);
      return;
    }
    final client = HttpClient();
    try {
      final response = offer.fileUrl != null
          ? await _get(client, offer.fileUrl!, cookie: offer.cookie, from: have, anonymous: offer.external)
          : await _get(client, _url('/api/hafs/app/${offer.name}'), from: have);
      if (response.statusCode == 416) {
        await response.drain<void>();
        await part.delete(); // the partial file does not fit; start over on the next attempt
        throw const HttpException('Resume refused');
      }
      if (response.statusCode != 200 && response.statusCode != 206) {
        await response.drain<void>();
        throw _Fatal('HTTP ${response.statusCode}');
      }
      if (response.statusCode == 200) have = 0; // everything again
      final total = offer.size > 0 ? offer.size : (response.contentLength > 0 ? have + response.contentLength : 0);
      final sink = part.openWrite(mode: have > 0 ? FileMode.append : FileMode.write);
      var received = have;
      try {
        await for (final chunk in response.timeout(const Duration(seconds: 30))) {
          sink.add(chunk);
          received += chunk.length;
          onProgress(total > 0 ? received / total : null);
        }
      } finally {
        await sink.close();
      }
      if (offer.size > 0 && received > offer.size) {
        await part.delete();
        throw _Fatal('Download too large ($received of ${offer.size} bytes)');
      }
      if (offer.size > 0 && received != offer.size) throw HttpException('Download incomplete ($received of ${offer.size} bytes)');
    } finally {
      client.close(force: true);
    }
  }

  /// Opens the Android package installer for the downloaded file.
  Future<void> install(File file) async {
    final result = await OpenFilex.open(file.path, type: 'application/vnd.android.package-archive');
    if (result.type != ResultType.done) throw Exception(result.message);
  }
}

/// Collects the result of the checksum (like `AccumulatorSink` from package:convert, without the dependency).
class AccumulatorSink<T> implements Sink<T> {
  final events = <T>[];

  @override
  void add(T event) => events.add(event);

  @override
  void close() {}
}

/// A failure that repeating the request cannot fix (rejected, wrong content).
class _Fatal implements HttpException {
  _Fatal(this.message);

  @override
  final String message;

  @override
  Uri? get uri => null;

  @override
  String toString() => 'HttpException: $message';
}
