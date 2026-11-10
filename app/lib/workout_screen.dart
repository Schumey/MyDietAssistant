import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'app_state.dart';
import 'exercise_picker.dart';
import 'history_screen.dart';
import 'l10n.dart';
import 'repo.dart';

/// Das laufende Workout: oben die erfassten Sätze, unten die Satzeingabe für die gewählte Übung.
class WorkoutScreen extends StatefulWidget {
  const WorkoutScreen({super.key, required this.app, required this.workoutId});

  final AppState app;
  final String workoutId;

  @override
  State<WorkoutScreen> createState() => _WorkoutScreenState();
}

class _WorkoutScreenState extends State<WorkoutScreen> {
  Repo get repo => widget.app.repo!;

  ExerciseInfo? _exercise;
  EntryDefaults? _defaults;
  double _weight = 0;
  int _reps = 8;
  int _minutes = 1;
  double _step = 2.5;
  bool _warmup = false;

  void _select(ExerciseInfo e) {
    final d = repo.defaults(e.id, workoutId: widget.workoutId);
    // Innerhalb dieses Workouts gilt der zuletzt erfasste Satz als Vorbelegung.
    final here = repo.workoutDetail(widget.workoutId).where((x) => x.exercise.id == e.id).toList();
    final lastHere = here.isEmpty ? null : here.first.sets.where((s) => s.kind == 'work').lastOrNull;
    setState(() {
      _exercise = e;
      _defaults = d;
      _weight = lastHere?.weight ?? d.weight;
      _reps = lastHere?.reps ?? d.reps;
      _minutes = 1;
      _step = d.step;
      _warmup = false;
    });
  }

  Future<void> _addExercise() async {
    final e = await Navigator.of(context).push<ExerciseInfo>(MaterialPageRoute(builder: (_) => ExercisePicker(repo: repo)));
    if (e != null) _select(e);
  }

  void _saveSet() {
    final e = _exercise;
    if (e == null) return;
    final timed = e.kind == 'time' || e.kind == 'cardio';
    repo.addSet(
      workoutId: widget.workoutId,
      exerciseId: e.id,
      weight: timed ? null : _weight,
      reps: timed ? null : _reps,
      durationSeconds: timed ? _minutes * 60 : null,
      kind: _warmup ? 'warmup' : 'work',
      targetWeight: _defaults?.target?.weight,
      targetReps: _defaults?.target?.reps,
    );
    HapticFeedback.lightImpact();
    widget.app.changed();
    setState(() => _warmup = false);
  }

  Future<void> _finish() async {
    final empty = repo.workoutDetail(widget.workoutId).isEmpty;
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(tr('finish_confirm')),
        content: empty ? Text(tr('discard_empty')) : null,
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: Text(tr('cancel'))),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: Text(tr('finish'))),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    repo.finishWorkout(widget.workoutId);
    widget.app.changed();
    Navigator.of(context).pop();
    widget.app.syncNow();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final detail = repo.workoutDetail(widget.workoutId);
    return Scaffold(
      appBar: AppBar(
        title: Text(tr('tab_training')),
        actions: [TextButton(onPressed: _finish, child: Text(tr('finish_workout')))],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                OutlinedButton.icon(onPressed: _addExercise, icon: const Icon(Icons.add), label: Text(tr('add_exercise'))),
                const SizedBox(height: 8),
                if (detail.isEmpty) Padding(padding: const EdgeInsets.all(24), child: Center(child: Text(tr('no_sets_yet')))),
                for (final d in detail)
                  Card(
                    margin: const EdgeInsets.only(top: 8),
                    color: d.exercise.id == _exercise?.id ? theme.colorScheme.secondaryContainer : null,
                    child: InkWell(
                      onTap: () => _select(d.exercise),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(d.exercise.name, style: theme.textTheme.titleMedium),
                          const SizedBox(height: 6),
                          for (final s in d.sets)
                            Row(children: [
                              Expanded(child: Text('${tr('set_n', [s.setNo ?? ''])}: ${setLine(s)}')),
                              IconButton(
                                visualDensity: VisualDensity.compact,
                                tooltip: tr('delete_set'),
                                icon: const Icon(Icons.close, size: 18),
                                onPressed: () {
                                  repo.deleteSet(s.id);
                                  widget.app.changed();
                                  setState(() {});
                                },
                              ),
                            ]),
                        ]),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          if (_exercise != null) _entryPanel(theme),
        ],
      ),
    );
  }

  Widget _entryPanel(ThemeData theme) {
    final e = _exercise!;
    final d = _defaults!;
    final timed = e.kind == 'time' || e.kind == 'cardio';
    final target = d.target;
    final hint = target == null ? null : reasonText(target.reasonCode, target.params, fallback: target.reasonDe);
    final done = repo.workoutDetail(widget.workoutId).where((x) => x.exercise.id == e.id).firstOrNull?.sets.length ?? 0;
    return Material(
      elevation: 8,
      color: theme.colorScheme.surfaceContainerHigh,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('${e.name} · ${tr('set_n', [done + 1])}', style: theme.textTheme.titleMedium),
            if (hint != null) ...[
              const SizedBox(height: 2),
              Text('${tr('target')}: ${target!.weight == null ? '' : '${L10n.kg(target.weight!)} kg × '}${target.reps ?? ''}  –  $hint',
                  style: theme.textTheme.bodySmall),
            ],
            if (d.lastTime.isNotEmpty) ...[
              const SizedBox(height: 2),
              Text('${tr('last_time')}: ${d.lastTime.map((s) => setLine(s)).join(' · ')}',
                  style: theme.textTheme.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),
            ],
            const SizedBox(height: 12),
            if (timed)
              Stepper2(
                label: tr('duration_min', ['']).trim(),
                value: '$_minutes',
                onMinus: () => setState(() => _minutes = (_minutes - 1).clamp(1, 600)),
                onPlus: () => setState(() => _minutes += 1),
                onTap: () => _edit(tr('duration_min', ['']).trim(), '$_minutes', (v) => setState(() => _minutes = v.round().clamp(1, 600))),
              )
            else ...[
              Stepper2(
                label: tr('weight_kg'),
                value: L10n.kg(_weight),
                onMinus: () => setState(() => _weight = ((_weight - _step).clamp(0, 1000) * 100).round() / 100),
                onPlus: () => setState(() => _weight = ((_weight + _step) * 100).round() / 100),
                onTap: () => _edit(tr('weight_kg'), L10n.kg(_weight), (v) => setState(() => _weight = v.clamp(0, 1000).toDouble())),
                trailing: ActionChip(
                  label: Text(tr('step', [L10n.kg(_step)])),
                  onPressed: () => setState(() => _step = _nextStep(_step)),
                ),
              ),
              const SizedBox(height: 8),
              Stepper2(
                label: tr('reps'),
                value: '$_reps',
                onMinus: () => setState(() => _reps = (_reps - 1).clamp(0, 200)),
                onPlus: () => setState(() => _reps += 1),
                onTap: () => _edit(tr('reps'), '$_reps', (v) => setState(() => _reps = v.round().clamp(0, 200))),
              ),
            ],
            const SizedBox(height: 12),
            Row(children: [
              FilterChip(label: Text(tr('kind_warmup')), selected: _warmup, onSelected: (v) => setState(() => _warmup = v)),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: 56,
                  child: FilledButton(onPressed: _saveSet, child: Text(tr('save_set'), style: theme.textTheme.titleMedium?.copyWith(color: theme.colorScheme.onPrimary))),
                ),
              ),
            ]),
          ]),
        ),
      ),
    );
  }

  static const _steps = [1.0, 2.5, 5.0, 10.0, 25.0];

  double _nextStep(double current) {
    final i = _steps.indexWhere((s) => s > current + 1e-9);
    return i == -1 ? _steps.first : _steps[i];
  }

  Future<void> _edit(String label, String current, void Function(double) apply) async {
    final c = TextEditingController(text: current);
    final v = await showDialog<double>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(label),
        content: TextField(
          controller: c,
          autofocus: true,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          onSubmitted: (t) => Navigator.pop(context, double.tryParse(t.replaceAll(',', '.'))),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: Text(tr('cancel'))),
          FilledButton(onPressed: () => Navigator.pop(context, double.tryParse(c.text.replaceAll(',', '.'))), child: const Text('OK')),
        ],
      ),
    );
    if (v != null) apply(v);
  }
}

/// Wert mit großen Minus-/Plus-Flächen; Antippen des Werts öffnet die Zifferneingabe.
class Stepper2 extends StatelessWidget {
  const Stepper2({super.key, required this.label, required this.value, required this.onMinus, required this.onPlus, this.onTap, this.trailing});

  final String label;
  final String value;
  final VoidCallback onMinus;
  final VoidCallback onPlus;
  final VoidCallback? onTap;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Row(children: [
        Text(label, style: theme.textTheme.labelMedium),
        const Spacer(),
        ?trailing,
      ]),
      Row(children: [
        SizedBox(width: 72, height: 56, child: FilledButton.tonal(onPressed: onMinus, child: const Icon(Icons.remove, size: 28))),
        Expanded(
          child: InkWell(
            onTap: onTap,
            child: Container(
              height: 56,
              alignment: Alignment.center,
              child: Text(value, style: theme.textTheme.headlineMedium),
            ),
          ),
        ),
        SizedBox(width: 72, height: 56, child: FilledButton.tonal(onPressed: onPlus, child: const Icon(Icons.add, size: 28))),
      ]),
    ]);
  }
}
