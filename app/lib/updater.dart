/// Self-update from the Home Assistant that the app is connected to.
///
/// The integration serves the newest `hafs-<version>.apk` from `/config/hafs/app` (`GET /api/hafs/app` for the
/// offer, `GET /api/hafs/app/<name>` for the file), protected by the same long-lived token the app already
/// uses. No GitHub access is needed, so the repository can stay private.
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
  const AppOffer({required this.version, required this.name, required this.size, required this.sha256});

  final String version;
  final String name;
  final int size;
  final String sha256;

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

class Updater {
  Updater({required this.address, required this.token, this.currentVersionOverride});

  final String address;
  final String token;
  final String? currentVersionOverride;

  static const _checkedKey = 'update_checked_at';

  /// Only Android installs packages; the Windows build is started from the build folder.
  static bool get supported => Platform.isAndroid;

  Future<String> currentVersion() async => currentVersionOverride ?? (await PackageInfo.fromPlatform()).version;

  Uri _url(String path) {
    final base = httpBase(address);
    return base.replace(path: '${base.path}$path');
  }

  Future<HttpClientResponse> _get(HttpClient client, Uri url) async {
    final request = await client.getUrl(url).timeout(const Duration(seconds: 15));
    request.headers.set(HttpHeaders.authorizationHeader, 'Bearer $token');
    return request.close().timeout(const Duration(seconds: 30));
  }

  /// Asks Home Assistant for the newest package; null when the installed version is the newest (or nothing is offered).
  Future<AppOffer?> check() async {
    final client = HttpClient();
    try {
      final response = await _get(client, _url('/api/hafs/app'));
      if (response.statusCode == 404) return null; // older server or no package uploaded
      if (response.statusCode == 401) throw const HttpException('Not signed in (token rejected)');
      if (response.statusCode != 200) throw HttpException('HTTP ${response.statusCode}');
      final offer = AppOffer.parse(jsonDecode(await utf8.decoder.bind(response).join()));
      if (offer == null) throw const FormatException('Unexpected answer from Home Assistant');
      return compareVersions(offer.version, await currentVersion()) > 0 ? offer : null;
    } finally {
      client.close(force: true);
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
  Future<File> download(AppOffer offer, void Function(double? progress) onProgress, {Directory? into}) async {
    final dir = Directory('${(into ?? await getTemporaryDirectory()).path}${Platform.pathSeparator}hafs-update');
    if (await dir.exists()) await dir.delete(recursive: true);
    await dir.create(recursive: true);
    final file = File('${dir.path}${Platform.pathSeparator}${offer.name}');
    final client = HttpClient();
    try {
      final response = await _get(client, _url('/api/hafs/app/${offer.name}'));
      if (response.statusCode != 200) throw HttpException('HTTP ${response.statusCode}');
      final total = response.contentLength > 0 ? response.contentLength : offer.size;
      final sink = file.openWrite();
      final out = AccumulatorSink<Digest>();
      final hasher = sha256.startChunkedConversion(out);
      var received = 0;
      try {
        await for (final chunk in response.timeout(const Duration(seconds: 30))) {
          sink.add(chunk);
          hasher.add(chunk);
          received += chunk.length;
          onProgress(total > 0 ? received / total : null);
        }
      } finally {
        await sink.close();
        hasher.close();
      }
      if (offer.size > 0 && received != offer.size) throw HttpException('Download incomplete ($received of ${offer.size} bytes)');
      if (out.events.single.toString() != offer.sha256) {
        await file.delete();
        throw const HttpException('Checksum does not match');
      }
      return file;
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
