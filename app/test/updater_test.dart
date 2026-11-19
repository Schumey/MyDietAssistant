import 'dart:convert';
import 'dart:io';

import 'package:crypto/crypto.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/updater.dart';

void main() {
  test('versions compare numerically', () {
    expect(compareVersions('0.10.0', '0.9.0'), 1);
    expect(compareVersions('1.0', '1.0.0'), 0);
    expect(compareVersions('0.1.0+5', '0.1.1'), -1);
    expect(compareVersions('x', '0'), 0);
  });

  test('httpBase keeps scheme, port and path prefix', () {
    expect(httpBase('192.0.2.10').toString(), 'http://192.0.2.10');
    expect(httpBase('https://ha.example.org/').toString(), 'https://ha.example.org');
    expect(httpBase('http://ha.local:8123/sub').toString(), 'http://ha.local:8123/sub');
  });

  test('offers are validated', () {
    final ok = {'version': '0.2.0', 'name': 'hafs-0.2.0.apk', 'size': 10, 'sha256': 'ABC'};
    expect(AppOffer.parse(ok)!.sha256, 'abc');
    expect(AppOffer.parse({...ok, 'name': '../evil.apk'}), isNull);
    expect(AppOffer.parse({...ok, 'version': '1.x'}), isNull);
    expect(AppOffer.parse({'version': '1.0.0'}), isNull);
    expect(AppOffer.parse('nope'), isNull);
  });

  group('against a Home Assistant double', () {
    late HttpServer server;
    late Directory tmp;
    final bytes = utf8.encode('pretend this is an apk');
    var offerJson = <String, Object?>{};
    var served = bytes;
    final seenAuth = <String?>[];
    final ranges = <String?>[];
    int? breakAfter;

    setUp(() async {
      tmp = await Directory.systemTemp.createTemp('hafs_upd');
      seenAuth.clear();
      ranges.clear();
      breakAfter = null;
      served = bytes;
      offerJson = {'version': '0.2.0', 'name': 'hafs-0.2.0.apk', 'size': bytes.length, 'sha256': sha256.convert(bytes).toString()};
      server = await HttpServer.bind('127.0.0.1', 0);
      server.listen((request) async {
        seenAuth.add(request.headers.value('authorization'));
        if (request.headers.value('authorization') != 'Bearer tok') {
          request.response.statusCode = 401;
        } else if (request.uri.path == '/api/hafs/app') {
          request.response.write(jsonEncode(offerJson));
        } else if (request.uri.path == '/api/hafs/app/hafs-0.2.0.apk') {
          final range = request.headers.value('range');
          ranges.add(range);
          final from = range == null ? 0 : int.parse(RegExp(r'bytes=(\d+)-').firstMatch(range)!.group(1)!);
          if (from > 0) request.response.statusCode = 206;
          final rest = served.sublist(from);
          if (breakAfter != null && from == 0) {
            // the connection dies in the middle of the file (phone locked)
            final socket = await request.response.detachSocket(writeHeaders: false);
            socket.add(utf8.encode('HTTP/1.1 200 OK\r\ncontent-length: ${rest.length}\r\n\r\n'));
            socket.add(rest.sublist(0, breakAfter));
            await socket.flush();
            socket.destroy();
            return;
          }
          request.response.add(rest);
        } else {
          request.response.statusCode = 404;
        }
        await request.response.close();
      });
    });

    tearDown(() async {
      await server.close(force: true);
      await tmp.delete(recursive: true);
    });

    Updater updater({String token = 'tok', String version = '0.1.0'}) =>
        Updater(address: 'http://127.0.0.1:${server.port}', token: token, currentVersionOverride: version);

    test('check finds a newer package and sends the token', () async {
      final offer = await updater().check();
      expect(offer!.version, '0.2.0');
      expect(seenAuth.single, 'Bearer tok');
    });

    test('check says nothing when up to date', () async {
      expect(await updater(version: '0.2.0').check(), isNull);
      expect(await updater(version: '0.3.0').check(), isNull);
    });

    test('a rejected token is an error', () async {
      expect(updater(token: 'bad').check(), throwsA(isA<HttpException>()));
    });

    test('download verifies the checksum and reports progress', () async {
      final progress = <double?>[];
      final offer = AppOffer.parse(offerJson)!;
      final file = await updater().download(offer, progress.add, into: tmp);
      expect(await file.readAsBytes(), bytes);
      expect(progress.last, 1.0);
    });

    test('a broken connection is resumed with a Range request', () async {
      breakAfter = 7;
      final offer = AppOffer.parse(offerJson)!;
      final file = await updater().download(offer, (_) {}, into: tmp, retryDelay: Duration.zero);
      expect(await file.readAsBytes(), bytes);
      expect(ranges, [null, 'bytes=7-']);
      expect(File('${file.path}.part').existsSync(), isFalse);
    });

    test('a partial file of an earlier run is continued', () async {
      final offer = AppOffer.parse(offerJson)!;
      final dir = Directory('${tmp.path}/hafs-update')..createSync();
      File('${dir.path}/hafs-0.2.0.apk.part').writeAsBytesSync(bytes.sublist(0, 5));
      final file = await updater().download(offer, (_) {}, into: tmp);
      expect(await file.readAsBytes(), bytes);
      expect(ranges, ['bytes=5-']);
    });

    test('gives up after the allowed attempts but keeps the partial file', () async {
      breakAfter = 7;
      final offer = AppOffer.parse(offerJson)!;
      // every attempt after the first one asks for a range and the double answers it, so force failures with 1 attempt
      await expectLater(updater().download(offer, (_) {}, into: tmp, maxAttempts: 1), throwsA(isA<IOException>()));
      expect(File('${tmp.path}/hafs-update/hafs-0.2.0.apk.part').lengthSync(), 7);
    });

    test('a corrupted download is rejected and removed', () async {
      served = utf8.encode('pretend this is an apk!'); // other content, other length
      final offer = AppOffer.parse(offerJson)!;
      await expectLater(updater().download(offer, (_) {}, into: tmp), throwsA(isA<HttpException>()));
      served = utf8.encode('pretend this is an APK'); // same length, wrong checksum
      await expectLater(updater().download(offer, (_) {}, into: tmp), throwsA(isA<HttpException>()));
      expect(File('${tmp.path}/hafs-update/hafs-0.2.0.apk').existsSync(), isFalse);
    });
  });
}
