import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/db.dart';
import 'package:hafs/l10n.dart';
import 'package:hafs/repo.dart';
import 'package:hafs/repo_gym.dart';
import 'package:hafs/rest_timer.dart';
import 'package:hafs/steps.dart';
import 'package:hafs/workout_live.dart';

import 'support.dart';

class _Notifier implements LiveNotifier {
  final List<LiveEntry> shown = [];
  int cancels = 0;

  @override
  Future<void> show(LiveEntry entry) async => shown.add(entry.copy());

  @override
  Future<void> cancel() async => cancels++;
}

void main() {
  late LocalDb local;
  late Repo repo;
  late RestTimer rest;
  late MemoryLiveStore store;
  late _Notifier notifier;
  late LiveController live;
  var now = DateTime(2026, 11, 10, 18, 0, 0);

  setUp(() {
    L10n.lang = 'de';
    now = DateTime(2026, 11, 10, 18, 0, 0);
    local = openMemory();
    repo = Repo(local, clock: () => now);
    for (final e in [('e1', 'Bankdrücken'), ('e2', 'Rudern'), ('e3', 'Plank')]) {
      local.upsert('exercise', {'id': e.$1, 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'name': e.$2, 'kind': e.$1 == 'e3' ? 'time' : 'strength'}, dirty: false);
    }
    rest = RestTimer(clock: () => now);
    store = MemoryLiveStore();
    notifier = _Notifier();
    live = LiveController(repo: repo, rest: rest, store: store, notifier: notifier);
  });

  tearDown(() {
    rest.dispose();
    local.close();
  });

  Future<String> start() async {
    final w = repo.startWorkout();
    await live.publish(await liveEntryFor(repo, rest, w, repo.exercise('e1')!));
    return w;
  }

  test('publish stores the entry and shows it; a new revision every time', () async {
    await start();
    final a = (await live.current())!;
    expect(a.exerciseName, 'Bankdrücken');
    expect(notifier.shown.single.exerciseName, 'Bankdrücken');
    final before = a.rev;
    await live.publish(a);
    expect((await live.current())!.rev, greaterThan(before));
  });

  test('weight and reps buttons change the entry in the steps of the equipment and update the notification', () async {
    final g = repo.addGym('A');
    final m = repo.saveEquipment(gymId: g, name: 'Maschine', type: 'machine', steps: '[20,25,30,40]');
    repo.setExercisesOf(m, {'e1'});
    final w = repo.startWorkout(gymId: g);
    await live.publish(await liveEntryFor(repo, rest, w, repo.exercise('e1')!));
    expect((await live.current())!.weight, 20);

    await live.handle(LiveAction.weightPlus);
    await live.handle(LiveAction.weightPlus);
    expect((await live.current())!.weight, 30);
    await live.handle(LiveAction.weightMinus);
    expect((await live.current())!.weight, 25);
    final r = (await live.current())!.reps;
    await live.handle(LiveAction.repsPlus);
    await live.handle(LiveAction.repsMinus);
    await live.handle(LiveAction.repsMinus);
    expect((await live.current())!.reps, r - 1);
    expect(notifier.shown.last.weight, 25);
    // changing values saves nothing
    expect(repo.workoutDetail(w), isEmpty);
  });

  test('weight without steps uses the step of the entry and never goes below 0', () async {
    final w = repo.startWorkout();
    final e = await liveEntryFor(repo, rest, w, repo.exercise('e1')!);
    e.weight = 2.5;
    e.step = 2.5;
    await live.publish(e);
    await live.handle(LiveAction.weightMinus);
    await live.handle(LiveAction.weightMinus);
    expect((await live.current())!.weight, 0);
  });

  test('set done saves the set with the shown values, starts the rest, and moves on to the next set number', () async {
    final w = await start();
    final e = (await live.current())!
      ..weight = 60
      ..reps = 8
      ..restSeconds = 120;
    await live.publish(e);
    await live.handle(LiveAction.repsPlus);
    await live.handle(LiveAction.done);

    final sets = repo.workoutDetail(w).single.sets;
    expect(sets.single.weight, 60);
    expect(sets.single.reps, 9);
    expect(sets.single.kind, 'work');
    expect(rest.endsAt, now.add(const Duration(seconds: 120)));
    final next = (await live.current())!;
    expect(next.setNo, 2);
    expect(next.weight, 60);
    expect(next.reps, 9);
    expect(local.pendingCount(), greaterThan(0)); // marked for the sync like any other set
  });

  test('a rest of 0 seconds starts no timer', () async {
    await start();
    final e = (await live.current())!..restSeconds = 0;
    await live.publish(e);
    await live.handle(LiveAction.done);
    expect(rest.endsAt, isNull);
  });

  test('timed exercise: the weight buttons change the minutes and the set is saved as a duration', () async {
    final w = repo.startWorkout();
    await live.publish(await liveEntryFor(repo, rest, w, repo.exercise('e3')!));
    await live.handle(LiveAction.weightPlus);
    await live.handle(LiveAction.weightPlus);
    await live.handle(LiveAction.done);
    final s = repo.workoutDetail(w).single.sets.single;
    expect(s.durationSeconds, 180);
    expect(s.reps, isNull);
  });

  test('planned warm-up sets: the first set done saves a warm-up (no rest), then the working weight follows', () async {
    repo.saveRoutine(name: 'Push', exercises: [
      RoutineExercise(exerciseId: 'e1', name: 'Bankdrücken', sets: 2, warmupSets: 1, warmupReps: 5, warmupPct: 50),
    ]);
    local.upsert('target', {
      'id': 't1', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'exercise_id': 'e1', 'equipment_id': '',
      'weight': 60.0, 'reps': 8, 'reason': '', 'reason_code': 'manual', 'reason_params': '{}',
    }, dirty: false);
    final w = repo.startWorkout(routineId: repo.routines().single.id);
    await live.publish(await liveEntryFor(repo, rest, w, repo.exercise('e1')!));
    final first = (await live.current())!;
    expect(first.warmup, isTrue);
    expect(first.weight, 30);
    expect(first.reps, 5);

    await live.handle(LiveAction.done);
    expect(rest.endsAt, isNull);
    expect(repo.workoutDetail(w).single.sets.single.kind, 'warmup');
    final next = (await live.current())!;
    expect(next.warmup, isFalse);
    expect(next.weight, 60);
    expect(next.reps, 8);
    expect(next.setNo, 2);
    expect(next.plannedSets, 2);
  });

  test('superset: after a set the notification switches to the partner without a rest; the rest comes after the round', () async {
    repo.saveRoutine(name: 'S', exercises: [
      RoutineExercise(exerciseId: 'e1', name: 'Bankdrücken', sets: 2, group: 'A'),
      RoutineExercise(exerciseId: 'e2', name: 'Rudern', sets: 2, group: 'A'),
    ]);
    final w = repo.startWorkout(routineId: repo.routines().single.id);
    await live.publish(await liveEntryFor(repo, rest, w, repo.exercise('e1')!));
    await live.handle(LiveAction.done);
    expect((await live.current())!.exerciseId, 'e2');
    expect(rest.endsAt, isNull);
    await live.handle(LiveAction.done);
    expect(rest.endsAt, isNotNull);
    expect((await live.current())!.exerciseId, 'e1');
  });

  test('a finished workout clears the notification and saves nothing more', () async {
    final w = await start();
    await live.handle(LiveAction.done);
    repo.finishWorkout(w);
    notifier.cancels = 0;
    final r = await live.handle(LiveAction.done);
    expect(r, isNull);
    expect(await live.current(), isNull);
    expect(notifier.cancels, 1);
    expect(repo.workoutDetail(w).single.sets, hasLength(1));
  });

  test('no entry: buttons do nothing but remove a stale notification', () async {
    expect(await live.handle(LiveAction.done), isNull);
    expect(notifier.cancels, 1);
  });

  test('after the planned sets the main button goes to the next open exercise (and back to extra sets when none is left)', () async {
    repo.saveRoutine(name: 'Mix', exercises: [
      RoutineExercise(exerciseId: 'e1', name: 'Bankdrücken', sets: 1),
      RoutineExercise(exerciseId: 'e2', name: 'Rudern', sets: 1),
    ]);
    final w = repo.startWorkout(routineId: repo.routines().single.id);
    await live.publish(await liveEntryFor(repo, rest, w, repo.exercise('e1')!));
    expect((await live.current())!.planDone, isFalse);

    await live.handle(LiveAction.done); // the only planned set of the first exercise
    var cur = (await live.current())!;
    expect(cur.exerciseId, 'e1');
    expect(cur.planDone, isTrue);
    expect(cur.nextName, 'Rudern');

    await live.handle(LiveAction.next);
    cur = (await live.current())!;
    expect(cur.exerciseId, 'e2');
    expect(cur.planDone, isFalse);
    expect(cur.nextName, isNull);

    await live.handle(LiveAction.done);
    cur = (await live.current())!;
    expect(cur.exerciseId, 'e2');
    expect(cur.planDone, isTrue);
    expect(cur.nextName, isNull); // nothing open: the button offers an extra set instead
    await live.handle(LiveAction.next); // no target: nothing changes
    expect((await live.current())!.exerciseId, 'e2');
    await live.handle(LiveAction.done);
    expect(repo.workoutDetail(w).last.sets, hasLength(2));
  });

  test('entry survives the round trip through JSON', () {
    final e = LiveEntry(workoutId: 'w', exerciseId: 'e', exerciseName: 'X', equipmentId: 'q', steps: [5, 7.5], plannedSets: 3, weight: 7.5, note: 'links', attachment: 'rope');
    final back = LiveEntry.fromJson(e.toJson());
    expect(back.steps, [5, 7.5]);
    expect(back.note, 'links');
    expect(back.plannedSets, 3);
    expect(back.equipmentId, 'q');
  });

  test('changeWeight follows the equipment steps', () {
    final e = LiveEntry(workoutId: 'w', exerciseId: 'e', exerciseName: 'X', steps: [10, 20], weight: 20);
    e.changeWeight(1);
    expect(e.weight, 20);
    e.changeWeight(-1);
    expect(e.weight, 10);
    expect(snapToSteps(e.weight, e.steps), 10);
  });
}
