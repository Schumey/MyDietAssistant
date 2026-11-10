import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'app_state.dart';
import 'exercise_picker.dart';
import 'gyms_screen.dart';
import 'history_screen.dart';
import 'l10n.dart';
import 'plates.dart';
import 'repo.dart';
import 'repo_gym.dart';
import 'repo_program.dart';
import 'rest_timer.dart';
import 'steps.dart';
import 'wakelock.dart';

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
  String _note = ''; // note for the next set (e.g. "links", tempo)
  int _restSeconds = RestTimer.defaultSeconds;
  String? _gymId;
  List<EquipmentInfo> _equipmentOptions = [];
  String? _equipmentId;
  List<double>? _steps;

  @override
  void initState() {
    super.initState();
    _gymId = repo.workoutGym(widget.workoutId);
    keepScreenOn(true);
    widget.app.rest.notifier.requestPermission();
  }

  @override
  void dispose() {
    keepScreenOn(false);
    super.dispose();
  }

  void _select(ExerciseInfo e) {
    final gym = _gymId;
    final options = gym == null ? <EquipmentInfo>[] : repo.equipmentFor(e.id, gym);
    final remembered = repo.lastEquipmentFor(e.id);
    final equipment = options.where((o) => o.id == remembered).firstOrNull ?? options.firstOrNull;
    _equipmentOptions = options;
    _applyEquipment(e, equipment?.id);
    widget.app.rest.restSeconds(e.id).then((s) {
      if (mounted && _exercise?.id == e.id) setState(() => _restSeconds = s);
    });
  }

  /// Übernimmt Gerät und Vorbelegung für die Übung (Gewicht auf die Stufen des Geräts gerundet).
  void _applyEquipment(ExerciseInfo e, String? equipmentId) {
    final d = repo.defaults(e.id, workoutId: widget.workoutId, equipmentId: equipmentId);
    // Innerhalb dieses Workouts gilt der zuletzt erfasste Satz an diesem Gerät als Vorbelegung.
    final here = repo.workoutDetail(widget.workoutId).where((x) => x.exercise.id == e.id).toList();
    final lastHere = here.isEmpty ? null : here.first.sets.where((s) => s.kind == 'work').lastOrNull;
    setState(() {
      _exercise = e;
      _equipmentId = equipmentId;
      _defaults = d;
      _steps = d.steps;
      _weight = lastHere?.weight != null ? snapToSteps(lastHere!.weight!, d.steps) : d.weight;
      _reps = lastHere?.reps ?? d.reps;
      _minutes = 1;
      _step = d.step;
      _warmup = false;
    });
  }

  /// Sheet to assign the current exercise to equipment of this gym (or to a new one).
  Future<void> _assignEquipment() async {
    final e = _exercise, gym = _gymId;
    if (e == null || gym == null) return;
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) => StatefulBuilder(
        builder: (context, setSheet) {
          final all = repo.equipment(gym);
          final linked = {for (final q in all) if (repo.exercisesOf(q.id).contains(e.id)) q.id};
          return SafeArea(
            child: ListView(shrinkWrap: true, children: [
              Padding(padding: const EdgeInsets.all(16), child: Text(tr('assign_equipment', [e.name]), style: Theme.of(context).textTheme.titleMedium)),
              for (final q in all)
                CheckboxListTile(
                  title: Text(q.name),
                  value: linked.contains(q.id),
                  onChanged: (v) {
                    repo.linkExercise(e.id, q.id, v ?? false);
                    setSheet(() {});
                  },
                ),
              ListTile(
                leading: const Icon(Icons.add),
                title: Text(tr('equipment_add')),
                onTap: () async {
                  final name = await askText(context, tr('equipment_name'));
                  if (name == null || name.trim().isEmpty) return;
                  final id = repo.saveEquipment(gymId: gym, name: name);
                  repo.linkExercise(e.id, id, true);
                  setSheet(() {});
                },
              ),
            ]),
          );
        },
      ),
    );
    if (mounted) _select(e);
  }

  Future<void> _cycleRest() async {
    final e = _exercise;
    if (e == null) return;
    final s = await widget.app.rest.cycleRest(e.id);
    if (mounted) setState(() => _restSeconds = s);
  }

  Future<void> _addExercise() async {
    final e = await Navigator.of(context).push<ExerciseInfo>(MaterialPageRoute(builder: (_) => ExercisePicker(repo: repo)));
    if (e != null) _select(e);
  }

  /// Planned exercises left out of this workout (only kept while the screen is open).
  final Set<String> _skipped = {};

  /// Order of the planned exercises chosen by moving cards (only kept while the screen is open).
  List<String> _order = [];

  /// Planned exercises in the shown order: moved cards first as arranged, the rest in plan order.
  List<PlannedExercise> _sorted(List<PlannedExercise> plan) {
    final rank = {for (var i = 0; i < _order.length; i++) _order[i]: i};
    final indexed = [for (var i = 0; i < plan.length; i++) (i, plan[i])];
    if (rank.isEmpty) return plan;
    indexed.sort((a, b) {
      final ra = rank[a.$2.exercise.id], rb = rank[b.$2.exercise.id];
      if (ra != null && rb != null) return ra.compareTo(rb);
      return a.$1.compareTo(b.$1);
    });
    return [for (final x in indexed) x.$2];
  }

  /// Moves a planned exercise one place up (-1) or down (+1) among the shown ones.
  void _move(String id, int by) {
    final shown = [for (final p in _sorted(repo.planned(widget.workoutId))) if (!_skipped.contains(p.exercise.id)) p.exercise.id];
    final i = shown.indexOf(id), j = i + by;
    if (i < 0 || j < 0 || j >= shown.length) return;
    shown.insert(j, shown.removeAt(i));
    setState(() => _order = shown);
  }

  void _skip(ExerciseInfo e) {
    setState(() {
      _skipped.add(e.id);
      if (_exercise?.id == e.id) _exercise = null;
    });
  }

  /// Replaces a planned exercise that has no sets yet by another one (e.g. machine is taken).
  Future<void> _swap(ExerciseInfo old) async {
    final e = await Navigator.of(context).push<ExerciseInfo>(MaterialPageRoute(builder: (_) => ExercisePicker(repo: repo)));
    if (e == null || !mounted) return;
    if (e.id != old.id) _skipped.add(old.id);
    _skipped.remove(e.id);
    _select(e);
  }

  /// „Gerät besetzt“: schlägt gleichwertige Übungen vor (gleiche Hauptmuskelgruppe) und tauscht die gewählte ein.
  Future<void> _busy(ExerciseInfo old) async {
    final alts = repo.alternatives(old.id, gymId: _gymId);
    if (alts.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(tr('no_alternatives'))));
      return;
    }
    final pick = await showModalBottomSheet<String>(
      context: context,
      builder: (context) => SafeArea(
        child: ListView(shrinkWrap: true, children: [
          Padding(padding: const EdgeInsets.all(16), child: Text(tr('alternatives_for', [old.name]), style: Theme.of(context).textTheme.titleMedium)),
          for (final a in alts)
            ListTile(title: Text(a.name), subtitle: a.uses > 0 ? Text(tr('sets_count', [a.uses])) : null, onTap: () => Navigator.pop(context, a.id)),
        ]),
      ),
    );
    final e = pick == null ? null : repo.exercise(pick);
    if (e == null || !mounted) return;
    _skipped.add(old.id);
    _skipped.remove(e.id);
    _select(e);
  }

  void _saveSet() {
    final e = _exercise;
    if (e == null) return;
    final timed = e.kind == 'time' || e.kind == 'cardio';
    repo.addSet(
      workoutId: widget.workoutId,
      exerciseId: e.id,
      equipmentId: _equipmentId,
      weight: timed ? null : _weight,
      reps: timed ? null : _reps,
      durationSeconds: timed ? _minutes * 60 : null,
      kind: _warmup ? 'warmup' : 'work',
      targetWeight: _defaults?.target?.weight,
      targetReps: _defaults?.target?.reps,
      note: _note,
    );
    HapticFeedback.lightImpact();
    widget.app.changed();
    // Nach einem Aufwärmsatz läuft keine Pause.
    if (!_warmup) widget.app.rest.start(_restSeconds, exercise: e.name);
    setState(() {
      _warmup = false;
      _note = '';
    });
  }

  Future<void> _finish() async {
    final detail = repo.workoutDetail(widget.workoutId);
    final hasRoutine = repo.planned(widget.workoutId).isNotEmpty;
    // 0 = abbrechen, 1 = beenden, 2 = beenden und als Routine speichern
    final choice = await showDialog<int>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(tr('finish_confirm')),
        content: detail.isEmpty ? Text(tr('discard_empty')) : null,
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, 0), child: Text(tr('cancel'))),
          if (detail.isNotEmpty && !hasRoutine) TextButton(onPressed: () => Navigator.pop(context, 2), child: Text(tr('save_as_routine'))),
          FilledButton(onPressed: () => Navigator.pop(context, 1), child: Text(tr('finish'))),
        ],
      ),
    );
    if (choice == null || choice == 0 || !mounted) return;
    String? routineName;
    if (choice == 2) {
      routineName = await askText(context, tr('routine_name'), initial: L10n.dayLabel(DateTime.now()));
      if (!mounted) return;
    }
    repo.finishWorkout(widget.workoutId);
    if (routineName != null && routineName.trim().isNotEmpty) repo.saveRoutineFromWorkout(widget.workoutId, routineName);
    widget.app.rest.stop();
    widget.app.changed();
    Navigator.of(context).pop();
    widget.app.syncNow();
  }

  Widget _exerciseCard(ThemeData theme, ExerciseInfo e, List<SetRow> sets, {PlannedExercise? plan}) {
    return Card(
      margin: const EdgeInsets.only(top: 8),
      color: e.id == _exercise?.id ? theme.colorScheme.secondaryContainer : null,
      child: InkWell(
        onTap: () => _select(e),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(child: Text(e.name, style: theme.textTheme.titleMedium)),
              if (plan != null)
                PopupMenuButton<String>(
                  tooltip: tr('plan_options'),
                  padding: EdgeInsets.zero,
                  icon: const Icon(Icons.more_vert, size: 20),
                  onSelected: (v) => switch (v) {
                    'up' => _move(e.id, -1),
                    'down' => _move(e.id, 1),
                    'swap' => _swap(e),
                    'busy' => _busy(e),
                    _ => _skip(e),
                  },
                  itemBuilder: (context) => [
                    PopupMenuItem(value: 'up', child: Text(tr('move_up'))),
                    PopupMenuItem(value: 'down', child: Text(tr('move_down'))),
                    if (sets.isEmpty) PopupMenuItem(value: 'busy', child: Text(tr('equipment_busy'))),
                    if (sets.isEmpty) PopupMenuItem(value: 'swap', child: Text(tr('swap_exercise'))),
                    if (sets.isEmpty) PopupMenuItem(value: 'skip', child: Text(tr('skip_exercise'))),
                  ],
                ),
              if (plan != null)
                Text(
                  plan.finished ? '✓ ${tr('planned_progress', [plan.doneSets, plan.targetSets])}' : tr('planned_progress', [plan.doneSets, plan.targetSets]),
                  style: theme.textTheme.labelMedium,
                ),
            ]),
            if (plan != null && sets.isEmpty) Text(tr('planned_range', [plan.repsMin, plan.repsMax]), style: theme.textTheme.bodySmall),
            if (sets.isNotEmpty) const SizedBox(height: 6),
            for (final s in sets)
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
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final detail = repo.workoutDetail(widget.workoutId);
    final plan = repo.planned(widget.workoutId);
    final byId = {for (final d in detail) d.exercise.id: d};
    final gyms = repo.gyms();
    final gymName = gyms.where((g) => g.id == _gymId).firstOrNull?.name;
    return Scaffold(
      appBar: AppBar(
        title: Text(gymName == null ? tr('tab_training') : '${tr('tab_training')} · $gymName'),
        actions: [
          if (gyms.length > 1)
            PopupMenuButton<String>(
              tooltip: tr('gym_label'),
              icon: const Icon(Icons.store),
              onSelected: (id) {
                repo.setWorkoutGym(widget.workoutId, id.isEmpty ? null : id);
                setState(() => _gymId = id.isEmpty ? null : id);
                final e = _exercise;
                if (e != null) _select(e);
              },
              itemBuilder: (context) => [
                for (final g in gyms) CheckedPopupMenuItem(value: g.id, checked: g.id == _gymId, child: Text(g.name)),
                PopupMenuItem(value: '', child: Text(tr('no_gym'))),
              ],
            ),
          TextButton(onPressed: _finish, child: Text(tr('finish_workout'))),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                OutlinedButton.icon(onPressed: _addExercise, icon: const Icon(Icons.add), label: Text(tr('add_exercise'))),
                const SizedBox(height: 8),
                if (detail.isEmpty && plan.isEmpty) Padding(padding: const EdgeInsets.all(24), child: Center(child: Text(tr('no_sets_yet')))),
                // geplante Übungen der Routine zuerst, dann alles, was zusätzlich gemacht wurde
                for (final p in _sorted(plan))
                  if (!_skipped.contains(p.exercise.id)) _exerciseCard(theme, p.exercise, byId[p.exercise.id]?.sets ?? const [], plan: p),
                for (final d in detail)
                  if (!plan.any((p) => p.exercise.id == d.exercise.id)) _exerciseCard(theme, d.exercise, d.sets),
                // an exercise swapped in that has no sets yet still needs a card to come back to
                if (_exercise != null && !byId.containsKey(_exercise!.id) && !plan.any((p) => p.exercise.id == _exercise!.id))
                  _exerciseCard(theme, _exercise!, const []),
              ],
            ),
          ),
          _RestBar(timer: widget.app.rest),
          if (_exercise != null) _entryPanel(theme),
        ],
      ),
    );
  }

  bool get _isBarbell => _equipmentId != null && repo.equipmentById(_equipmentId!)?.type == 'barbell';

  /// Plate calculator for barbells: plates per side for the current weight.
  Widget _platesHint(ThemeData theme) {
    final bar = widget.app.plateBar;
    final r = platesFor(_weight, bar: bar, plates: widget.app.plateSet);
    final text = r == null
        ? tr('plates_below_bar', [L10n.kg(bar)])
        : '${tr('plates_per_side')}: ${platesLine(r, L10n.kg)}${r.remainder > 0 ? '  (${tr('plates_rest', [L10n.kg(r.remainder)])})' : ''}';
    return Padding(padding: const EdgeInsets.only(top: 4), child: Text(text, style: theme.textTheme.bodySmall));
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
            if (_gymId != null && _equipmentOptions.isEmpty)
              Align(
                alignment: Alignment.centerLeft,
                child: ActionChip(
                  visualDensity: VisualDensity.compact,
                  avatar: const Icon(Icons.fitness_center, size: 16),
                  label: Text(tr('assign_equipment_short')),
                  onPressed: _assignEquipment,
                ),
              )
            else if (_equipmentOptions.length == 1)
              Row(children: [
                Text('${tr('equipment_label')}: ${_equipmentOptions.first.name}', style: theme.textTheme.bodySmall),
                IconButton(visualDensity: VisualDensity.compact, iconSize: 18, icon: const Icon(Icons.edit_outlined), onPressed: _assignEquipment),
              ])
            else if (_equipmentOptions.length > 1)
              Wrap(spacing: 8, children: [
                ActionChip(visualDensity: VisualDensity.compact, avatar: const Icon(Icons.edit_outlined, size: 16), label: Text(tr('assign_equipment_short')), onPressed: _assignEquipment),
                for (final o in _equipmentOptions)
                  ChoiceChip(
                    visualDensity: VisualDensity.compact,
                    label: Text(o.name),
                    selected: _equipmentId == o.id,
                    onSelected: (_) => _applyEquipment(e, o.id),
                  ),
              ]),
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
                onMinus: () => setState(() => _weight = stepDown(_weight, _steps, _step)),
                onPlus: () => setState(() => _weight = stepUp(_weight, _steps, _step) ?? _weight),
                onTap: () => _edit(tr('weight_kg'), L10n.kg(_weight), (v) => setState(() => _weight = v.clamp(0, 1000).toDouble())),
                trailing: _steps != null
                    ? null
                    : ActionChip(
                        label: Text(tr('step', [L10n.kg(_step)])),
                        onPressed: () => setState(() => _step = _nextStep(_step)),
                      ),
              ),
              if (_isBarbell) _platesHint(theme),
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
            Wrap(spacing: 8, runSpacing: 0, children: [
              FilterChip(label: Text(tr('kind_warmup')), selected: _warmup, onSelected: (v) => setState(() => _warmup = v)),
              ActionChip(
                avatar: const Icon(Icons.edit_note, size: 18),
                label: Text(_note.isEmpty ? tr('set_note') : _note, overflow: TextOverflow.ellipsis),
                onPressed: () async {
                  final n = await askText(context, tr('set_note'), initial: _note);
                  if (n != null && mounted) setState(() => _note = n.trim());
                },
              ),
              ActionChip(
                avatar: const Icon(Icons.timer_outlined, size: 18),
                label: Text(_restSeconds == 0 ? tr('rest_off') : tr('rest_seconds', [_restSeconds])),
                onPressed: _cycleRest,
              ),
            ]),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: FilledButton(onPressed: _saveSet, child: Text(tr('save_set'), style: theme.textTheme.titleMedium?.copyWith(color: theme.colorScheme.onPrimary))),
            ),
          ]),
        ),
      ),
    );
  }

  static const _stepPresets = [1.0, 2.0, 2.5, 5.0, 10.0, 25.0];

  double _nextStep(double current) {
    final i = _stepPresets.indexWhere((s) => s > current + 1e-9);
    return i == -1 ? _stepPresets.first : _stepPresets[i];
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

/// Die laufende Pause: Restzeit, „+30 s“ und Stop. Nur sichtbar, solange der Timer läuft.
class _RestBar extends StatelessWidget {
  const _RestBar({required this.timer});

  final RestTimer timer;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ListenableBuilder(
      listenable: timer,
      builder: (context, _) {
        if (!timer.running) return const SizedBox.shrink();
        return Material(
          color: theme.colorScheme.tertiaryContainer,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(children: [
              const Icon(Icons.timer),
              const SizedBox(width: 8),
              Text(RestTimer.format(timer.remaining), style: theme.textTheme.headlineSmall),
              const Spacer(),
              TextButton(onPressed: timer.extend, child: Text(tr('rest_add'))),
              TextButton(onPressed: timer.stop, child: Text(tr('rest_stop'))),
            ]),
          ),
        );
      },
    );
  }
}
