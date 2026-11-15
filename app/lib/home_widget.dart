import 'dart:io' show Platform;

import 'package:hafs_live/hafs_live.dart';

import 'l10n.dart';
import 'repo.dart';
import 'repo_gym.dart';
import 'repo_program.dart';

/// What the home screen widget shows: the next training day with its exercises.
class WidgetContent {
  const WidgetContent({required this.kicker, required this.title, required this.lines});

  final String kicker;
  final String title;
  final List<String> lines;

  @override
  bool operator ==(Object other) => other is WidgetContent && other.kicker == kicker && other.title == title && other.lines.join('\n') == lines.join('\n');

  @override
  int get hashCode => Object.hash(kicker, title, lines.join('\n'));
}

/// The widget texts from the local data (works offline). Without a plan the widget says so.
WidgetContent buildWidgetContent(Repo? repo, {DateTime? now}) {
  final id = repo?.suggestedRoutineId(now: now);
  final routine = id == null ? null : repo!.routine(id);
  if (routine == null) return WidgetContent(kicker: '', title: tr('widget_none'), lines: const []);
  final lines = <String>[];
  for (final e in routine.exercises.take(6)) {
    final reps = e.repsMin == e.repsMax ? '${e.repsMin}' : '${e.repsMin}–${e.repsMax}';
    final weight = repo!.target(e.exerciseId)?.weight;
    lines.add([e.name, '${e.sets}×$reps', if (weight != null) '${L10n.kg(weight)} kg'].join(' · '));
  }
  return WidgetContent(kicker: tr('widget_next'), title: routine.name, lines: lines);
}

/// The widget "Nutrition today": calories left (big) and eaten of the goal, from the diary page of the HA app.
WidgetContent buildNutritionWidget(String day, double kcal, double goal, {DateTime? now}) {
  final today = (now ?? DateTime.now()).toIso8601String().substring(0, 10);
  if (day != today) return WidgetContent(kicker: tr('widget_food'), title: '–', lines: [tr('widget_food_open')]);
  final left = (goal - kcal).round();
  return WidgetContent(
    kicker: tr('widget_food'),
    title: goal > 0 ? (left >= 0 ? tr('widget_food_left', [left]) : tr('widget_food_over', [-left])) : tr('widget_food_eaten', [kcal.round()]),
    lines: [if (goal > 0) tr('widget_food_of', [kcal.round(), goal.round()])],
  );
}

abstract class HomeWidget {
  Future<void> show(WidgetContent content);

  /// The second widget, "Nutrition today".
  Future<void> showNutrition(WidgetContent content);
}

class NoopHomeWidget implements HomeWidget {
  @override
  Future<void> show(WidgetContent content) async {}

  @override
  Future<void> showNutrition(WidgetContent content) async {}
}

/// Android home screen widgets (plugin `hafs_live`).
class AndroidHomeWidget implements HomeWidget {
  @override
  Future<void> show(WidgetContent content) =>
      HafsLive.widget({'kicker': content.kicker, 'title': content.title, 'lines': content.lines.join('\n')});

  @override
  Future<void> showNutrition(WidgetContent content) =>
      HafsLive.nutritionWidget({'kicker': content.kicker, 'title': content.title, 'lines': content.lines.join('\n')});
}

HomeWidget defaultHomeWidget() => Platform.isAndroid ? AndroidHomeWidget() : NoopHomeWidget();
