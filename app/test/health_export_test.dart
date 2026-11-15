import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/health_export.dart';
import 'package:hafs/repo.dart';

import 'support.dart';

class _Sink implements WorkoutSink {
  bool isAvailable = true;
  bool granted = true;
  bool store = true;
  final writes = <({DateTime start, DateTime end, int kcal, String title})>[];

  @override
  Future<bool> available() async => isAvailable;

  @override
  Future<bool> authorize() async => granted;

  @override
  Future<bool> write({required DateTime start, required DateTime end, required int kcal, required String title}) async {
    if (!store) return false;
    writes.add((start: start, end: end, kcal: kcal, title: title));
    return true;
  }
}

void main() {
  test('kcal estimate follows the server (4.5 per minute)', () {
    expect(estimateKcal(const Duration(minutes: 60)), 270);
    expect(estimateKcal(const Duration(minutes: 64)), 288);
    expect(estimateKcal(Duration.zero), 0);
  });

  group('export', () {
    late _Sink sink;
    late dynamic local;
    late Repo repo;
    late HealthExport export;
    var now = DateTime(2026, 11, 10, 22, 0);

    setUp(() {
      sink = _Sink();
      local = openMemory();
      local.upsert('exercise', {
        'id': 'e1', 'owner': '', 'updated_at': '2026-01-01T00:00:00+00:00', 'deleted': 0, 'name': 'Bank', 'kind': 'strength', 'catalog_key': '',
      }, dirty: false);
      var t = DateTime(2026, 11, 10, 18, 0);
      repo = Repo(local, clock: () => t);
      export = HealthExport(local, sink: sink);
      // finish a 60 minute workout
      final w = repo.startWorkout(routineName: 'Push');
      repo.addSet(workoutId: w, exerciseId: 'e1', weight: 50, reps: 5);
      t = DateTime(2026, 11, 10, 19, 0);
      repo.addSet(workoutId: w, exerciseId: 'e1', weight: 50, reps: 5);
      repo.finishWorkout(w);
      now = DateTime(2026, 11, 10, 22, 0);
    });

    test('is off by default and writes nothing', () async {
      expect(export.enabled, isFalse);
      expect(await export.exportPending(now: now), 0);
      expect(sink.writes, isEmpty);
    });

    test('writes a finished workout once', () async {
      expect(await export.setEnabled(true), isTrue);
      expect(await export.exportPending(now: now), 1);
      final w = sink.writes.single;
      expect(w.title, 'Push');
      expect(w.end.difference(w.start), const Duration(minutes: 60));
      expect(w.kcal, 270);
      expect(await export.exportPending(now: now), 0); // not again
      expect(sink.writes.length, 1);
    });

    test('a failed write is retried later', () async {
      await export.setEnabled(true);
      sink.store = false;
      expect(await export.exportPending(now: now), 0);
      sink.store = true;
      expect(await export.exportPending(now: now), 1);
    });

    test('imported and old workouts are not written', () async {
      await export.setEnabled(true);
      expect(await export.exportPending(now: DateTime(2026, 12, 1)), 0); // older than 7 days
      local.upsert('workout', {
        'id': 'g1', 'owner': '', 'updated_at': '2026-11-10T00:00:00+00:00', 'deleted': 0,
        'started_at': '2026-11-10T10:00:00', 'ended_at': '2026-11-10T11:00:00', 'routine_name': '', 'source': 'gymrun',
      }, dirty: false);
      expect(await export.exportPending(now: now), 1); // only the app's own workout
    });

    test('refused permission or missing Health Connect keeps it off', () async {
      sink.granted = false;
      expect(await export.setEnabled(true), isFalse);
      expect(export.enabled, isFalse);
      sink.granted = true;
      sink.isAvailable = false;
      expect(await export.setEnabled(true), isFalse);
      sink.isAvailable = true;
      expect(await export.setEnabled(true), isTrue);
      expect(await export.setEnabled(false), isTrue);
      expect(export.enabled, isFalse);
    });
  });
}
