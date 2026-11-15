import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/app_state.dart';
import 'package:hafs/credentials.dart';
import 'package:hafs/home_widget.dart';
import 'package:hafs/l10n.dart';
import 'package:hafs/repo_gym.dart';
import 'package:hafs/repo_program.dart';

import 'support.dart';

class _Creds implements CredentialStore {
  @override
  Future<({String address, String token})?> load() async => null;

  @override
  Future<void> save(String address, String token) async {}

  @override
  Future<void> clear() async {}
}

class _Widget implements HomeWidget {
  final shown = <WidgetContent>[];

  @override
  Future<void> show(WidgetContent content) async => shown.add(content);

  final nutrition = <WidgetContent>[];

  @override
  Future<void> showNutrition(WidgetContent content) async => nutrition.add(content);
}

void main() {
  late AppState app;
  late _Widget widget;

  setUp(() async {
    L10n.lang = 'de';
    widget = _Widget();
    app = AppState(_Creds(), openDb: () async => openMemory(), homeWidget: widget);
    await app.start();
    app.local!.upsert('exercise', {'id': 'e1', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'name': 'Bankdrücken', 'kind': 'strength'}, dirty: false);
    app.local!.upsert('exercise', {'id': 'e2', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'name': 'Rudern', 'kind': 'strength'}, dirty: false);
  });

  test('without a plan the widget says so', () {
    final c = buildWidgetContent(app.repo);
    expect(c.title, 'Kein Training geplant');
    expect(c.lines, isEmpty);
    expect(c.kicker, '');
  });

  test('the next training day with sets, reps and the suggested weight', () {
    final repo = app.repo!;
    app.local!.upsert('target', {
      'id': 't1', 'owner': 'u1', 'updated_at': '2026-01-01T00:00:00+00:00', 'exercise_id': 'e1', 'equipment_id': '', 'weight': 62.5, 'reps': 8,
    }, dirty: false);
    final push = repo.saveRoutine(name: 'Push', exercises: [
      RoutineExercise(exerciseId: 'e1', name: 'Bankdrücken', sets: 3, repsMin: 6, repsMax: 10),
      RoutineExercise(exerciseId: 'e2', name: 'Rudern', sets: 4, repsMin: 8, repsMax: 8),
    ]);
    repo.saveProgram(name: 'Plan', routineIds: [push]);
    final c = buildWidgetContent(repo);
    expect(c.kicker, 'Als Nächstes');
    expect(c.title, 'Push');
    expect(c.lines, ['Bankdrücken · 3×6–10 · 62,5 kg', 'Rudern · 4×8']);
  });

  test('changes reach the widget once, unchanged content is not sent again', () {
    final repo = app.repo!;
    app.changed();
    app.changed();
    expect(widget.shown.length, 1); // the "no plan" state, sent once
    final r = repo.saveRoutine(name: 'Pull', exercises: [RoutineExercise(exerciseId: 'e2', name: 'Rudern', sets: 3)]);
    repo.saveProgram(name: 'Plan', routineIds: [r]);
    app.changed();
    app.changed();
    expect(widget.shown.length, 2);
    expect(widget.shown.last.title, 'Pull');
  });
}
