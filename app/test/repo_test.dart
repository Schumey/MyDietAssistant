import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/db.dart';
import 'package:hafs/l10n.dart';
import 'package:hafs/repo.dart';

import 'support.dart';

void main() {
  late LocalDb local;
  late Repo repo;
  var now = DateTime(2026, 11, 10, 18, 0, 0);

  setUp(() {
    L10n.lang = 'de';
    now = DateTime(2026, 11, 10, 18, 0, 0);
    local = openMemory();
    repo = Repo(local, clock: () => now);
    for (final e in [('e1', 'Bankdrücken', 'strength'), ('e2', 'Kniebeuge', 'strength'), ('e3', 'Planks', 'time'), ('e4', '100% Test_x', 'strength')]) {
      local.upsert('exercise', {'id': e.$1, 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'name': e.$2, 'kind': e.$3}, dirty: false);
    }
  });

  tearDown(() => local.close());

  void tick([int minutes = 1]) => now = now.add(Duration(minutes: minutes));

  test('workout lifecycle: start, add sets, finish', () {
    expect(repo.activeWorkout(), isNull);
    final w = repo.startWorkout();
    expect(repo.activeWorkout()!['id'], w);
    repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 8);
    tick();
    repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 7);
    tick();
    repo.addSet(workoutId: w, exerciseId: 'e2', weight: 80, reps: 10);
    tick(2);
    expect(repo.finishWorkout(w), isTrue);
    expect(repo.activeWorkout(), isNull);
    final detail = repo.workoutDetail(w);
    expect([for (final d in detail) d.exercise.name], ['Bankdrücken', 'Kniebeuge']);
    expect([for (final s in detail.first.sets) s.setNo], [1, 2]);
    final summary = repo.history().single;
    expect(summary.sets, 3);
    expect(summary.volume, 60 * 8 + 60 * 7 + 80 * 10);
    expect(summary.minutes, 4);
    expect(summary.startedAt, DateTime(2026, 11, 10, 18, 0, 0));
  });

  test('a workout without sets is discarded', () {
    final w = repo.startWorkout();
    expect(repo.finishWorkout(w), isFalse);
    expect(repo.activeWorkout(), isNull);
    expect(repo.history(), isEmpty);
  });

  test('every change is marked for sync with the server timestamp format', () {
    final w = repo.startWorkout();
    final s = repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 8);
    expect(local.pendingCount(), 2);
    final row = local.row('SELECT updated_at, done_at FROM workout_set WHERE id = ?', [s])!;
    expect(row['updated_at'], '2026-11-10T17:00:00+00:00'.replaceFirst('17', '${now.toUtc().hour}'));
    expect(row['done_at'], '2026-11-10T18:00:00');
  });

  test('deleting a set renumbers the others and leaves a tombstone', () {
    final w = repo.startWorkout();
    final ids = <String>[];
    for (var i = 0; i < 3; i++) {
      ids.add(repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 8 + i));
      tick();
    }
    repo.deleteSet(ids[1]);
    final sets = repo.workoutDetail(w).single.sets;
    expect([for (final s in sets) s.setNo], [1, 2]);
    expect([for (final s in sets) s.reps], [8, 10]);
    expect(local.row('SELECT deleted, dirty FROM workout_set WHERE id = ?', [ids[1]]), {'deleted': 1, 'dirty': 1});
  });

  test('updateSet changes weight and reps', () {
    final w = repo.startWorkout();
    final s = repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 8);
    repo.updateSet(s, weight: 62.5, reps: 6);
    final set = repo.workoutDetail(w).single.sets.single;
    expect((set.weight, set.reps), (62.5, 6));
  });

  test('exercises: recent first, then by name; search is case-insensitive and escaped', () {
    expect([for (final e in repo.exercises()) e.name], ['100% Test_x', 'Bankdrücken', 'Kniebeuge', 'Planks']);
    final w = repo.startWorkout();
    repo.addSet(workoutId: w, exerciseId: 'e2', weight: 80, reps: 8);
    expect(repo.exercises().first.name, 'Kniebeuge');
    expect([for (final e in repo.exercises(query: 'bANK')) e.name], ['Bankdrücken']);
    expect([for (final e in repo.exercises(query: '100%')) e.name], ['100% Test_x']);
    expect(repo.exercises(query: '%'), hasLength(1)); // a literal percent sign, not a wildcard
    expect(repo.exercises(query: 'xyz'), isEmpty);
  });

  test('defaults without any history', () {
    final d = repo.defaults('e1');
    expect((d.weight, d.reps, d.step), (0.0, 8, 2.5));
    expect(d.target, isNull);
    expect(d.lastTime, isEmpty);
  });

  test('defaults from last time (last work set), not from warm-ups', () {
    final old = repo.startWorkout();
    repo.addSet(workoutId: old, exerciseId: 'e1', weight: 40, reps: 12, kind: 'warmup');
    tick();
    repo.addSet(workoutId: old, exerciseId: 'e1', weight: 60, reps: 8);
    tick();
    repo.addSet(workoutId: old, exerciseId: 'e1', weight: 62.5, reps: 6);
    tick();
    repo.finishWorkout(old);
    tick(60 * 24);
    final w = repo.startWorkout();
    final d = repo.defaults('e1', workoutId: w);
    expect((d.weight, d.reps), (62.5, 6));
    expect(d.lastTime, hasLength(3));
    expect(d.step, 2.5); // differences 20 and 2.5 -> 2.5 and 20 once each, smaller wins
  });

  test('last time ignores the running workout', () {
    final old = repo.startWorkout();
    repo.addSet(workoutId: old, exerciseId: 'e1', weight: 60, reps: 8);
    repo.finishWorkout(old);
    tick(60 * 24);
    final w = repo.startWorkout();
    repo.addSet(workoutId: w, exerciseId: 'e1', weight: 70, reps: 5);
    expect(repo.lastTime('e1', excludeWorkoutId: w).single.weight, 60);
  });

  test('server target wins over last time and is rendered in both languages', () {
    local.upsert('target', {
      'id': 't1', 'owner': 'u1', 'updated_at': '2026-11-09T10:00:00+00:00', 'exercise_id': 'e1', 'equipment_id': '',
      'weight': 32.5, 'reps': 8, 'reason': 'Obere Grenze erreicht', 'reason_code': 'up',
      'reason_params': '{"from":30.0,"weight":32.5,"reps_max":12,"streak":1}',
    }, dirty: false);
    final d = repo.defaults('e1');
    expect((d.weight, d.reps), (32.5, 8));
    final t = d.target!;
    expect(reasonText(t.reasonCode, t.params), 'Obere Grenze (12 Wdh.) erreicht → eine Stufe mehr: 32,5 kg');
    L10n.lang = 'en';
    expect(reasonText(t.reasonCode, t.params), 'Top of the range (12 reps) reached → one step up: 32.5 kg');
    expect(reasonText('unbekannt', {}, fallback: 'Text vom Server'), 'Text vom Server');
    expect(reasonText('hold', {'weight': 350, 'reps': 4, 'reps_min': 3, 'reps_max': 3, 'top_set': true}), contains('pyramid'));
  });

  test('suggestStep', () {
    expect(suggestStep([]), 2.5);
    expect(suggestStep([30, 30]), 2.5);
    expect(suggestStep([300, 325, 350]), 25);
    expect(suggestStep([0, 5, 10]), 5);
    expect(suggestStep([30, 32.5, 35, 40]), 2.5);
  });

  test('number formatting follows the language', () {
    expect(L10n.kg(32.5), '32,5');
    expect(L10n.kg(60), '60');
    L10n.lang = 'en';
    expect(L10n.kg(32.5), '32.5');
  });

  test('timestamps use the server format', () {
    expect(utcStamp(DateTime.utc(2026, 11, 10, 7, 5, 9, 123)), '2026-11-10T07:05:09+00:00');
    expect(localStamp(DateTime(2026, 1, 2, 3, 4, 5)), '2026-01-02T03:04:05');
  });
}
