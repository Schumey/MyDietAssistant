import 'dart:io';

import 'package:flutter/services.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:sqlite3/sqlite3.dart';

import 'db.dart';

/// Opens the app database on the device. Also used by the notification buttons in the background, which open
/// their own connection (the other connection of the app may be writing at the same moment: see the busy timeout).
Future<LocalDb> openAppDatabase() async {
  final schema = Schema.parse(await rootBundle.loadString('assets/schema.json'));
  final dir = await getApplicationSupportDirectory();
  await Directory(dir.path).create(recursive: true);
  return LocalDb.open(sqlite3.open(p.join(dir.path, 'hafs.db')), schema);
}
