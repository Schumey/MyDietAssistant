import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/repo.dart';
import 'package:hafs/repo_gym.dart';
import 'package:hafs/repo_program.dart';

import 'support.dart';

void main() {
  test('pickNext follows the weekday plan, else the rotation', () {
    const days = [1, 3, 5];
    expect(pickNext(3, -1, days, 1, false), 0);
    expect(pickNext(3, 0, days, 1, true), 1);
    expect(pickNext(3, 0, days, 2, false), 1);
    expect(pickNext(3, 2, days, 6, false), 0);
    expect(pickNext(3, 1, const [], 4, false), 2);
    expect(parseRhythm('1,3,5', 3), days);
    expect(parseRhythm('1,3', 3), isEmpty);
    expect(parseRhythm('', 3), isEmpty);
  });

  test('a program with weekdays suggests the routine of the day', () {
    final local = openMemory();
    local.upsert('exercise', {
      'id': 'e1', 'owner': '', 'updated_at': '2026-01-01T00:00:00+00:00', 'deleted': 0, 'name': 'Bank', 'kind': 'strength', 'catalog_key': '',
    }, dirty: false);
    final repo = Repo(local, clock: () => DateTime(2026, 11, 9, 18)); // a Monday
    final a = repo.saveRoutine(name: 'Push', exercises: [RoutineExercise(exerciseId: 'e1', name: 'Bank')]);
    final b = repo.saveRoutine(name: 'Pull', exercises: [RoutineExercise(exerciseId: 'e1', name: 'Bank')]);
    final p = repo.saveProgram(name: 'PP', routineIds: [a, b], weekdays: [3, 1]); // stored sorted: Mon, Wed
    expect(repo.programs().single.weekdays, [1, 3]);
    expect(repo.nextRoutineId(p, now: DateTime(2026, 11, 9, 8)), a); // Monday
    expect(repo.nextRoutineId(p, now: DateTime(2026, 11, 10, 8)), b); // Tuesday: next is Wednesday's
    final w = repo.startWorkout(routineId: a, routineName: 'Push');
    repo.addSet(workoutId: w, exerciseId: 'e1', weight: 50, reps: 5);
    repo.finishWorkout(w);
    expect(repo.nextRoutineId(p, now: DateTime(2026, 11, 9, 20)), b); // Monday done: Wednesday's
    // a wrong number of weekdays is dropped
    repo.saveProgram(id: p, name: 'PP', routineIds: [a, b], weekdays: [1]);
    expect(repo.programs().single.weekdays, isEmpty);
  });
}
