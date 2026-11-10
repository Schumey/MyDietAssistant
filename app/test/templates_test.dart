import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/templates.dart';

Candidate c(String id, String muscles, {int uses = 0, String kind = 'strength'}) =>
    Candidate(id: id, name: id, primary: muscles.split(' '), uses: uses, kind: kind);

void main() {
  final pool = [
    c('bench', 'chest triceps', uses: 50),
    c('fly', 'chest', uses: 5),
    c('press', 'shoulders', uses: 20),
    c('row', 'lats biceps', uses: 40),
    c('pulldown', 'lats', uses: 30),
    c('squat', 'quads glutes', uses: 60),
    c('legpress', 'quads', uses: 10),
    c('curl', 'biceps', uses: 25),
    c('pushdown', 'triceps', uses: 25),
    c('crunch', 'abs', uses: 3),
    c('run', 'quads', kind: 'cardio', uses: 999),
    c('legcurl', 'hamstrings', uses: 12),
    c('calf', 'calves', uses: 8),
  ];
  TemplateDef t(String k) => templates.firstWhere((x) => x.key == k);

  test('ppl: push day has chest first, most used preferred, no duplicates in a day', () {
    final days = buildPlan(t('ppl'), pool);
    final push = days.firstWhere((d) => d.name == 'push');
    expect(push.exercises.first.exerciseId, 'bench');
    expect(push.exercises.map((e) => e.exerciseId).toSet().length, push.exercises.length);
    expect(push.exercises.first.sets, 4);
    expect(push.exercises.first.repsMax, 10);
  });

  test('cardio is never picked, even when heavily used', () {
    final all = buildPlan(t('fullbody'), pool).expand((d) => d.exercises).map((e) => e.exerciseId);
    expect(all, isNot(contains('run')));
  });

  test('an exercise is reused only when there is no alternative', () {
    final days = buildPlan(t('fullbody'), pool);
    final a = days.firstWhere((d) => d.name == 'A').exercises.map((e) => e.exerciseId).toList();
    final cDay = days.firstWhere((d) => d.name == 'C').exercises.map((e) => e.exerciseId).toList();
    expect(a, contains('squat'));
    expect(cDay, contains('legpress')); // squat is taken in A, the alternative is used
    expect(cDay, contains('bench')); // chest: bench (A) and fly (B) are both taken, so the most used one repeats
  });

  test('missing muscle groups are skipped, empty days are dropped', () {
    final days = buildPlan(t('ppl'), [c('bench', 'chest')]);
    expect(days.map((d) => d.name), ['push']);
    expect(days.single.exercises.length, 1); // the chest slot appears twice, but never the same exercise twice in a day
  });

  test('no candidates -> empty plan', () {
    expect(buildPlan(t('ppl'), []), isEmpty);
    expect(buildPlan(t('ppl'), [c('run', 'quads', kind: 'cardio')]), isEmpty);
  });

  test('isolation exercises get higher reps', () {
    final push = buildPlan(t('ppl'), pool).firstWhere((d) => d.name == 'push');
    final pushdown = push.exercises.firstWhere((e) => e.exerciseId == 'pushdown');
    expect((pushdown.repsMin, pushdown.repsMax), (10, 15));
  });
}
