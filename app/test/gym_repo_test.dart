import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/db.dart';
import 'package:hafs/repo.dart';
import 'package:hafs/repo_gym.dart';
import 'package:hafs/steps.dart';

import 'support.dart';

void main() {
  late LocalDb local;
  late Repo repo;
  var now = DateTime(2026, 11, 10, 18, 0, 0);

  setUp(() {
    now = DateTime(2026, 11, 10, 18, 0, 0);
    local = openMemory();
    repo = Repo(local, clock: () => now);
    for (final e in [('e1', 'Bankdrücken'), ('e2', 'Kniebeuge'), ('e3', 'Rudern')]) {
      local.upsert('exercise', {'id': e.$1, 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'name': e.$2, 'kind': 'strength'}, dirty: false);
    }
  });

  tearDown(() => local.close());

  void tick([int minutes = 1]) => now = now.add(Duration(minutes: minutes));

  group('gyms and equipment', () {
    test('create, list with counts, rename, delete (with equipment and links)', () {
      final g = repo.addGym('  Studio A ');
      expect(repo.gyms().single.name, 'Studio A');
      final m = repo.saveEquipment(gymId: g, name: 'Brustpresse', type: 'machine', steps: parseStepsInput('5-100/5')!);
      repo.setExercisesOf(m, {'e1'});
      expect(repo.gyms().single.equipmentCount, 1);
      repo.renameGym(g, 'Studio B');
      expect(repo.gyms().single.name, 'Studio B');
      repo.deleteGym(g);
      expect(repo.gyms(), isEmpty);
      expect(repo.equipment(g), isEmpty);
      expect(repo.exercisesOf(m), isEmpty);
      expect(local.row('SELECT deleted FROM equipment WHERE id = ?', [m])!['deleted'], 1);
    });

    test('equipment: save, update keeps id, out of order is hidden for exercises', () {
      final g = repo.addGym('A');
      final m = repo.saveEquipment(gymId: g, name: 'Maschine', type: 'machine', steps: '[10,20]');
      repo.setExercisesOf(m, {'e1', 'e2'});
      expect(repo.equipmentFor('e1', g).single.id, m);
      repo.saveEquipment(id: m, gymId: g, name: 'Maschine 2', type: 'machine', steps: '[10,20]', outOfOrder: true);
      expect(repo.equipment(g).single.name, 'Maschine 2');
      expect(repo.equipmentFor('e1', g), isEmpty);
      expect(repo.equipmentById(m)!.outOfOrder, isTrue);
    });

    test('exercise links: replace, no duplicates, re-adding revives the same record', () {
      final g = repo.addGym('A');
      final m = repo.saveEquipment(gymId: g, name: 'M', type: 'machine');
      repo.setExercisesOf(m, {'e1', 'e2'});
      final id1 = local.row('SELECT id FROM exercise_equipment WHERE exercise_id = ?', ['e1'])!['id'];
      repo.setExercisesOf(m, {'e2', 'e3'});
      expect(repo.exercisesOf(m), {'e2', 'e3'});
      repo.setExercisesOf(m, {'e1'});
      expect(repo.exercisesOf(m), {'e1'});
      expect(local.row('SELECT id FROM exercise_equipment WHERE exercise_id = ? AND deleted = 0', ['e1'])!['id'], id1);
      expect(local.rows('SELECT id FROM exercise_equipment WHERE exercise_id = ?', ['e1']), hasLength(1));
    });

    test('equipmentFor only returns equipment of that gym', () {
      final a = repo.addGym('A'), b = repo.addGym('B');
      final ma = repo.saveEquipment(gymId: a, name: 'MA', type: 'machine');
      final mb = repo.saveEquipment(gymId: b, name: 'MB', type: 'machine');
      repo.setExercisesOf(ma, {'e1'});
      repo.setExercisesOf(mb, {'e1'});
      expect(repo.equipmentFor('e1', a).single.name, 'MA');
      expect(repo.equipmentFor('e1', b).single.name, 'MB');
    });

    test('stations (rack, bench) are linked but give no steps: equipmentFor lists only the equipment with weights', () {
      final g = repo.addGym('A');
      final bar = repo.saveEquipment(gymId: g, name: 'Langhantel', type: 'barbell', steps: '[20, 22.5]');
      final bench = repo.saveEquipment(gymId: g, name: 'Flachbank', type: 'bench');
      final rack = repo.saveEquipment(gymId: g, name: 'Rack', type: 'rack');
      repo.setExercisesOf(bar, {'e1'});
      repo.setExercisesOf(bench, {'e1'});
      repo.setExercisesOf(rack, {'e2'});
      expect(repo.equipmentFor('e1', g).single.id, bar);
      expect(repo.stationsFor('e1', g).single.name, 'Flachbank');
      expect(repo.equipmentFor('e2', g), isEmpty); // only a station: no weights equipment
      expect(repo.stationsFor('e2', g).single.name, 'Rack');
      repo.saveEquipment(id: bench, gymId: g, name: 'Flachbank', type: 'bench', outOfOrder: true);
      expect(repo.stationsFor('e1', g), isEmpty);
    });

    test('last gym is remembered and forgotten when deleted', () {
      final g = repo.addGym('A');
      expect(repo.lastGymId(), isNull);
      repo.startWorkout(gymId: g);
      expect(repo.lastGymId(), g);
      repo.deleteGym(g);
      expect(repo.lastGymId(), isNull);
    });

    test('everything is marked for sync', () {
      final g = repo.addGym('A');
      final m = repo.saveEquipment(gymId: g, name: 'M', type: 'machine');
      repo.setExercisesOf(m, {'e1'});
      expect(local.pendingCount(), 3);
    });
  });

  group('equipment in the workout', () {
    late String gym, machine;

    setUp(() {
      gym = repo.addGym('A');
      machine = repo.saveEquipment(gymId: gym, name: 'Presse', type: 'machine', steps: '{"min":20,"max":100,"step":10}');
      repo.setExercisesOf(machine, {'e1'});
    });

    test('sets carry the equipment and the workout the gym', () {
      final w = repo.startWorkout(gymId: gym);
      final s = repo.addSet(workoutId: w, exerciseId: 'e1', equipmentId: machine, weight: 40, reps: 8);
      expect(local.row('SELECT equipment_id FROM workout_set WHERE id = ?', [s])!['equipment_id'], machine);
      expect(local.row('SELECT gym_id FROM workout WHERE id = ?', [w])!['gym_id'], gym);
    });

    test('defaults use the equipment steps; weight is snapped onto them', () {
      final old = repo.startWorkout(gymId: gym);
      repo.addSet(workoutId: old, exerciseId: 'e1', equipmentId: machine, weight: 47, reps: 8); // off the grid
      repo.finishWorkout(old);
      tick(60 * 24);
      final w = repo.startWorkout(gymId: gym);
      final d = repo.defaults('e1', workoutId: w, equipmentId: machine);
      expect(d.steps, [for (var i = 20; i <= 100; i += 10) i.toDouble()]);
      expect(d.weight, 50);
    });

    test('a new equipment without history starts at its lightest step', () {
      final d = repo.defaults('e1', equipmentId: machine);
      expect(d.weight, 20);
    });

    test('last time prefers the same equipment, falls back to any', () {
      final other = repo.saveEquipment(gymId: gym, name: 'Andere', type: 'machine');
      final w1 = repo.startWorkout();
      repo.addSet(workoutId: w1, exerciseId: 'e1', equipmentId: machine, weight: 60, reps: 8);
      repo.finishWorkout(w1);
      tick(60 * 24);
      final w2 = repo.startWorkout();
      repo.addSet(workoutId: w2, exerciseId: 'e1', equipmentId: other, weight: 30, reps: 12);
      repo.finishWorkout(w2);
      tick(60 * 24);
      final w3 = repo.startWorkout();
      expect(repo.lastTime('e1', excludeWorkoutId: w3, equipmentId: machine).single.weight, 60); // older, but same machine
      expect(repo.lastTime('e1', excludeWorkoutId: w3, equipmentId: other).single.weight, 30);
      expect(repo.lastTime('e1', excludeWorkoutId: w3).single.weight, 30); // no equipment: the latest
      final third = repo.saveEquipment(gymId: gym, name: 'Dritte', type: 'machine');
      expect(repo.lastTime('e1', excludeWorkoutId: w3, equipmentId: third).single.weight, 30); // falls back
    });

    test('target: equipment specific first, then the general one', () {
      void target(String equipment, double weight) => local.upsert('target', {
            'id': 't$equipment', 'owner': 'u1', 'updated_at': '2026-11-09T10:00:00+00:00', 'deleted': 0, 'exercise_id': 'e1',
            'equipment_id': equipment, 'weight': weight, 'reps': 8, 'reason': '', 'reason_code': 'hold', 'reason_params': '{}',
          }, dirty: false);
      target('', 40);
      expect(repo.target('e1', equipmentId: machine)!.weight, 40);
      target(machine, 60);
      expect(repo.target('e1', equipmentId: machine)!.weight, 60);
      expect(repo.target('e1')!.weight, 40);
    });
  });

  group('routines', () {
    test('save, read in order, replace exercises, delete', () {
      final id = repo.saveRoutine(name: ' Push ', exercises: [
        RoutineExercise(exerciseId: 'e1', name: 'Bankdrücken', sets: 4, repsMin: 6, repsMax: 8, restSeconds: 120),
        RoutineExercise(exerciseId: 'e3', name: 'Rudern'),
      ]);
      final r = repo.routine(id)!;
      expect(r.name, 'Push');
      expect([for (final x in r.exercises) x.exerciseId], ['e1', 'e3']);
      expect((r.exercises.first.sets, r.exercises.first.repsMin, r.exercises.first.repsMax, r.exercises.first.restSeconds), (4, 6, 8, 120));
      expect((r.exercises.last.sets, r.exercises.last.repsMin, r.exercises.last.repsMax), (3, 8, 12)); // defaults
      repo.saveRoutine(id: id, name: 'Push A', exercises: [RoutineExercise(exerciseId: 'e2', name: 'Kniebeuge')]);
      expect(repo.routine(id)!.name, 'Push A');
      expect([for (final x in repo.routine(id)!.exercises) x.exerciseId], ['e2']);
      expect(repo.routines(), hasLength(1));
      repo.deleteRoutine(id);
      expect(repo.routines(), isEmpty);
      expect(local.rows('SELECT id FROM routine_exercise WHERE deleted = 0'), isEmpty);
    });

    test('routines keep their order', () {
      repo.saveRoutine(name: 'B', exercises: []);
      repo.saveRoutine(name: 'A', exercises: []);
      expect([for (final r in repo.routines()) r.name], ['B', 'A']); // creation order, not alphabetical
    });

    test('planned exercises show the progress of the running workout', () {
      final id = repo.saveRoutine(name: 'Push', exercises: [
        RoutineExercise(exerciseId: 'e1', name: 'Bankdrücken', sets: 2),
        RoutineExercise(exerciseId: 'e3', name: 'Rudern', sets: 3),
      ]);
      final w = repo.startWorkout(routineId: id, routineName: 'Push');
      repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 8, kind: 'warmup');
      repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 8);
      tick();
      repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 8);
      final p = repo.planned(w);
      expect([for (final x in p) (x.exercise.name, x.doneSets, x.targetSets, x.finished)], [('Bankdrücken', 2, 2, true), ('Rudern', 0, 3, false)]);
      expect(repo.planned(repo.startWorkout()), isEmpty); // free workout
      expect(local.row('SELECT routine_name FROM workout WHERE id = ?', [w])!['routine_name'], 'Push');
    });

    test('routine from a finished workout', () {
      final w = repo.startWorkout();
      repo.addSet(workoutId: w, exerciseId: 'e1', weight: 40, reps: 12, kind: 'warmup');
      repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 8);
      repo.addSet(workoutId: w, exerciseId: 'e1', weight: 60, reps: 7);
      repo.addSet(workoutId: w, exerciseId: 'e2', weight: 80, reps: 10);
      repo.finishWorkout(w);
      final r = repo.routine(repo.saveRoutineFromWorkout(w, 'Mein Tag'))!;
      expect([for (final x in r.exercises) (x.name, x.sets, x.repsMax)], [('Bankdrücken', 2, 8), ('Kniebeuge', 1, 10)]);
    });

    test('warm-up sets and rest of a planned exercise are saved, read back and followed by the workout', () {
      final id = repo.saveRoutine(name: 'Push', exercises: [
        RoutineExercise(exerciseId: 'e1', name: 'Bankdrücken', sets: 3, restSeconds: 180, warmupSets: 2, warmupReps: 5, warmupPct: 50),
        RoutineExercise(exerciseId: 'e3', name: 'Rudern', warmupSets: 0, warmupReps: 9, warmupPct: 40), // no sets: nothing is stored
      ]);
      final r = repo.routine(id)!;
      expect((r.exercises[0].warmupSets, r.exercises[0].warmupReps, r.exercises[0].warmupPct, r.exercises[0].restSeconds), (2, 5, 50.0, 180));
      expect((r.exercises[1].warmupSets, r.exercises[1].warmupReps, r.exercises[1].warmupPct), (0, 0, 0.0));
      final w = repo.startWorkout(routineId: id, routineName: 'Push');
      var p = repo.planned(w).first;
      expect((p.warmupDue, p.warmupDone, p.restSeconds), (true, 0, 180));
      repo.addSet(workoutId: w, exerciseId: 'e1', weight: 30, reps: 5, kind: 'warmup');
      tick();
      repo.addSet(workoutId: w, exerciseId: 'e1', weight: 30, reps: 5, kind: 'warmup');
      p = repo.planned(w).first;
      expect((p.warmupDue, p.warmupDone, p.doneSets), (false, 2, 0)); // warm-ups do not count as work sets
      expect(repo.planned(w).last.warmupDue, isFalse);
    });

    test('a changed routine keeps the warm-up of exercises it still contains', () {
      final id = repo.saveRoutine(name: 'Push', exercises: [RoutineExercise(exerciseId: 'e1', name: 'Bankdrücken', warmupSets: 1, warmupReps: 8, warmupPct: 40)]);
      final again = repo.routine(id)!.exercises; // what the routine editor loads and saves again
      repo.saveRoutine(id: id, name: 'Push', exercises: again);
      expect(repo.routine(id)!.exercises.single.warmupSets, 1);
      expect(repo.routine(id)!.exercises.single.warmupPct, 40);
    });

    test('routine rows use the columns the server reads for its targets', () {
      repo.saveRoutine(name: 'R', exercises: [RoutineExercise(exerciseId: 'e1', name: 'Bankdrücken', sets: 3, repsMin: 6, repsMax: 8)]);
      final row = local.row('SELECT target_sets, reps_min, reps_max FROM routine_exercise WHERE deleted = 0')!;
      expect(row, {'target_sets': 3, 'reps_min': 6, 'reps_max': 8});
    });
  });
}
