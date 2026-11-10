import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/history_plan.dart';
import 'package:hafs/repo.dart';
import 'package:hafs/repo_gym.dart';
import 'package:hafs/repo_program.dart';

import 'support.dart';

void main() {
  test('deriveDay keeps usual exercises in usual order with sets and a rep range', () {
    ExerciseRun r(String id, int sets, int best, int order) => ExerciseRun(id, id.toUpperCase(), sets, best, order);
    final day = deriveDay([
      [r('a', 4, 6, 0), r('b', 3, 12, 1), r('x', 3, 10, 2)],
      [r('a', 4, 7, 0), r('b', 3, 12, 1)],
      [r('b', 3, 12, 0), r('a', 4, 6, 1)],
    ]);
    expect(day.map((x) => x.exerciseId), ['a', 'b']); // x only once in three: dropped
    expect((day[0].sets, day[0].repsMin, day[0].repsMax), (4, 3, 6));
    expect((day[1].sets, day[1].repsMin, day[1].repsMax), (3, 8, 12));
    expect(deriveDay([]), isEmpty);
    // an exercise with only empty sets still gets a sensible default
    final z = deriveDay([[r('z', 0, 0, 0)]]);
    expect((z.single.sets, z.single.repsMax), (3, 10));
  });

  test('routines and a program are created from the history', () {
    final local = openMemory();
    for (final e in [('e1', 'Bankdrücken'), ('e2', 'Rudern')]) {
      local.upsert('exercise', {
        'id': e.$1, 'owner': '', 'updated_at': '2026-01-01T00:00:00+00:00', 'deleted': 0, 'name': e.$2, 'kind': 'strength', 'catalog_key': '',
      }, dirty: false);
    }
    var day = DateTime(2026, 10, 1, 18);
    final repo = Repo(local, clock: () => day);
    void workout(String routine, String exercise) {
      final w = repo.startWorkout(routineName: routine);
      for (var i = 0; i < 3; i++) {
        repo.addSet(workoutId: w, exerciseId: exercise, weight: 50, reps: 10);
      }
      repo.finishWorkout(w);
      day = day.add(const Duration(days: 2));
    }

    for (var i = 0; i < 3; i++) {
      workout('Push', 'e1');
      workout('Pull', 'e2');
    }
    workout('Selten', 'e1'); // fewer than three workouts: not offered
    final found = repo.historyRoutines(now: DateTime(2026, 11, 10));
    expect(found.map((h) => h.name), ['Push', 'Pull']); // oldest last use first
    expect(found.first.workouts, 3);
    expect(found.first.exercises.single.sets, 3);

    final pid = repo.createFromHistory(found, 'PP');
    final program = repo.programs().single;
    expect((program.id, program.name), (pid, 'PP'));
    expect(program.routineIds.length, 2);
    final first = repo.routine(program.routineIds.first)!;
    expect(first.name, 'Push');
    expect(first.exercises.single.repsMax, 10);
    // a second run reuses the routines instead of duplicating them
    repo.createFromHistory(found, 'PP 2');
    expect(repo.routines().length, 2);
  });
}
