import 'dart:convert';

import 'repo.dart';
import 'repo_gym.dart';
import 'rest_timer.dart';
import 'steps.dart';

/// Actions of the permanent workout notification (also the ids of its buttons).
class LiveAction {
  static const weightMinus = 'live_w_minus';
  static const weightPlus = 'live_w_plus';
  static const repsMinus = 'live_r_minus';
  static const repsPlus = 'live_r_plus';
  static const done = 'live_done';

  static bool isLive(String? id) => id != null && id.startsWith('live_');
}

/// The current set entry of the running workout: what the entry panel shows and what the notification
/// shows and changes. It is kept in the device settings so that the notification buttons (which run in the
/// background, possibly without the app) and the open screen see the same values.
class LiveEntry {
  LiveEntry({
    required this.workoutId,
    required this.exerciseId,
    required this.exerciseName,
    this.equipmentId,
    this.timed = false,
    this.cable = false,
    this.setNo = 1,
    this.plannedSets,
    this.warmup = false,
    this.weight = 0,
    this.reps = 8,
    this.minutes = 1,
    this.step = 2.5,
    this.steps,
    this.targetWeight,
    this.targetReps,
    this.note = '',
    this.attachment = '',
    this.restSeconds = RestTimer.defaultSeconds,
    this.rev = 0,
  });

  final String workoutId;
  final String exerciseId;
  final String exerciseName;
  final String? equipmentId;
  final bool timed;
  final bool cable;
  int setNo;
  final int? plannedSets;
  bool warmup;
  double weight;
  int reps;
  int minutes;
  double step;
  final List<double>? steps;
  final double? targetWeight;
  final int? targetReps;
  String note;
  String attachment;
  int restSeconds;

  /// Changes with every write; whoever wrote it remembers it, everybody else sees a change.
  int rev;

  LiveEntry copy() => LiveEntry.fromJson(toJson());

  Map<String, Object?> toJson() => {
        'workoutId': workoutId,
        'exerciseId': exerciseId,
        'exerciseName': exerciseName,
        'equipmentId': equipmentId,
        'timed': timed,
        'cable': cable,
        'setNo': setNo,
        'plannedSets': plannedSets,
        'warmup': warmup,
        'weight': weight,
        'reps': reps,
        'minutes': minutes,
        'step': step,
        'steps': steps,
        'targetWeight': targetWeight,
        'targetReps': targetReps,
        'note': note,
        'attachment': attachment,
        'restSeconds': restSeconds,
        'rev': rev,
      };

  factory LiveEntry.fromJson(Map<String, dynamic> j) => LiveEntry(
        workoutId: j['workoutId'] as String,
        exerciseId: j['exerciseId'] as String,
        exerciseName: j['exerciseName'] as String,
        equipmentId: j['equipmentId'] as String?,
        timed: j['timed'] as bool? ?? false,
        cable: j['cable'] as bool? ?? false,
        setNo: j['setNo'] as int? ?? 1,
        plannedSets: j['plannedSets'] as int?,
        warmup: j['warmup'] as bool? ?? false,
        weight: (j['weight'] as num?)?.toDouble() ?? 0,
        reps: j['reps'] as int? ?? 8,
        minutes: j['minutes'] as int? ?? 1,
        step: (j['step'] as num?)?.toDouble() ?? 2.5,
        steps: (j['steps'] as List?)?.map((e) => (e as num).toDouble()).toList(),
        targetWeight: (j['targetWeight'] as num?)?.toDouble(),
        targetReps: j['targetReps'] as int?,
        note: j['note'] as String? ?? '',
        attachment: j['attachment'] as String? ?? '',
        restSeconds: j['restSeconds'] as int? ?? RestTimer.defaultSeconds,
        rev: j['rev'] as int? ?? 0,
      );

  /// Weight one step up / down (in the steps of the equipment); the weight stays at the ends of the equipment.
  void changeWeight(int direction) {
    if (timed) {
      minutes = (minutes + direction).clamp(1, 600);
    } else if (direction > 0) {
      weight = stepUp(weight, steps, step) ?? weight;
    } else {
      weight = stepDown(weight, steps, step);
    }
  }

  void changeReps(int direction) => reps = (reps + direction).clamp(0, 200);

  /// Writes the set (what was done and what was suggested). Returns the id of the new set.
  String save(Repo repo) => repo.addSet(
        workoutId: workoutId,
        exerciseId: exerciseId,
        equipmentId: equipmentId,
        weight: timed ? null : weight,
        reps: timed ? null : reps,
        durationSeconds: timed ? minutes * 60 : null,
        kind: warmup ? 'warmup' : 'work',
        targetWeight: targetWeight,
        targetReps: targetReps,
        note: note,
        attachment: cable ? attachment : '',
      );
}

/// Where the live entry is kept (device settings on the phone, memory in tests).
abstract class LiveStore {
  Future<String?> read();
  Future<void> write(String? json);
}

class MemoryLiveStore implements LiveStore {
  String? value;

  @override
  Future<String?> read() async => value;

  @override
  Future<void> write(String? json) async => value = json;
}

/// Shows the permanent notification for the entry (Android); nothing elsewhere and in tests.
abstract class LiveNotifier {
  Future<void> show(LiveEntry entry);
  Future<void> cancel();
}

class NoopLiveNotifier implements LiveNotifier {
  @override
  Future<void> show(LiveEntry entry) async {}

  @override
  Future<void> cancel() async {}
}

/// Starting values of the entry for an exercise: the suggestion, the last time, the planned warm-up.
class EntryPreset {
  EntryPreset(this.defaults, this.weight, this.reps, this.warmup);

  final EntryDefaults defaults;
  final double weight;
  final int reps;
  final bool warmup;
}

EntryPreset entryPreset(Repo repo, String workoutId, ExerciseInfo e, String? equipmentId) {
  final d = repo.defaults(e.id, workoutId: workoutId, equipmentId: equipmentId);
  // Inside this workout the last set at this equipment is the starting point.
  final here = repo.workoutDetail(workoutId).where((x) => x.exercise.id == e.id).toList();
  final lastHere = here.isEmpty ? null : here.first.sets.where((s) => s.kind == 'work').lastOrNull;
  var weight = lastHere?.weight != null ? snapToSteps(lastHere!.weight!, d.steps) : d.weight;
  var reps = lastHere?.reps ?? d.reps;
  var warmup = false;
  // Planned warm-up sets still due: the next set is one, with a percentage of the working weight.
  final plan = repo.planned(workoutId).where((p) => p.exercise.id == e.id).firstOrNull;
  if (plan != null && plan.warmupDue && d.weight > 0) {
    warmup = true;
    weight = warmupWeight(d.weight, plan.warmupPct, d.steps, d.step);
    reps = plan.warmupReps;
  }
  return EntryPreset(d, weight, reps, warmup);
}

/// What happens after a work set: `go` = exercise to switch to (superset partner), `rest` = start the rest timer.
/// In a superset there is no rest until the last exercise of the round; then the round starts again with the first.
({ExerciseInfo? go, bool rest}) supersetRound(Repo repo, String workoutId, ExerciseInfo e, {Set<String> skipped = const {}}) {
  final plan = repo.planned(workoutId);
  final me = plan.where((p) => p.exercise.id == e.id).firstOrNull;
  if (me == null || me.group.isEmpty) return (go: null, rest: true);
  final group = [for (final p in plan) if (p.group == me.group && !skipped.contains(p.exercise.id)) p];
  final myIndex = group.indexWhere((p) => p.exercise.id == e.id);
  for (var i = myIndex + 1; i < group.length; i++) {
    if (!group[i].finished) return (go: group[i].exercise, rest: false);
  }
  final again = group.where((p) => !p.finished && p.exercise.id != e.id).firstOrNull;
  return (go: again?.exercise, rest: true);
}

/// The entry for an exercise at the start of its sets (equipment as remembered unless [equipmentId] is given).
Future<LiveEntry> liveEntryFor(Repo repo, RestTimer rest, String workoutId, ExerciseInfo e, {String? equipmentId, int? globalRest}) async {
  final gym = repo.workoutGym(workoutId);
  final options = gym == null ? <EquipmentInfo>[] : repo.equipmentFor(e.id, gym);
  final remembered = repo.lastEquipmentFor(e.id);
  final equipment = equipmentId ??
      (options.where((o) => o.id == remembered).firstOrNull ?? options.firstOrNull)?.id;
  final p = entryPreset(repo, workoutId, e, equipment);
  final plan = repo.planned(workoutId).where((x) => x.exercise.id == e.id).firstOrNull;
  final done = repo.workoutDetail(workoutId).where((x) => x.exercise.id == e.id).firstOrNull?.sets.length ?? 0;
  final timed = e.kind == 'time' || e.kind == 'cardio';
  return LiveEntry(
    workoutId: workoutId,
    exerciseId: e.id,
    exerciseName: e.name,
    equipmentId: equipment,
    timed: timed,
    cable: repo.isCableExercise(e.id),
    setNo: done + 1,
    plannedSets: plan?.targetSets,
    warmup: p.warmup,
    weight: p.weight,
    reps: p.reps,
    step: p.defaults.step,
    steps: p.defaults.steps,
    targetWeight: p.defaults.target?.weight,
    targetReps: p.defaults.target?.reps,
    attachment: repo.isCableExercise(e.id) ? repo.lastAttachment(e.id) : '',
    restSeconds: await rest.restSeconds(e.id, planned: plan?.restSeconds, global: globalRest),
  );
}

/// The live entry and its notification. Used by the open screen and by the notification buttons.
class LiveController {
  LiveController({required this.repo, required this.rest, required this.store, required this.notifier});

  final Repo repo;
  final RestTimer rest;
  final LiveStore store;
  final LiveNotifier notifier;

  int _lastRev = 0;

  int get _globalRest => int.tryParse(repo.local.state('pref_rest_default') ?? '') ?? RestTimer.defaultSeconds;

  Future<LiveEntry?> current() async {
    final text = await store.read();
    if (text == null || text.isEmpty) return null;
    try {
      return LiveEntry.fromJson((jsonDecode(text) as Map).cast<String, dynamic>());
    } catch (_) {
      return null;
    }
  }

  /// A new revision number, unique per write.
  int nextRev() {
    final now = DateTime.now().microsecondsSinceEpoch;
    _lastRev = now > _lastRev ? now : _lastRev + 1;
    return _lastRev;
  }

  /// Stores the entry and shows it in the notification. Returns the revision written.
  Future<int> publish(LiveEntry entry) async {
    entry.rev = nextRev();
    await store.write(jsonEncode(entry.toJson()));
    await notifier.show(entry);
    return entry.rev;
  }

  Future<void> clear() async {
    await store.write(null);
    await notifier.cancel();
  }

  /// A button of the notification: change weight or reps, or finish the set. Does nothing when the workout is over.
  Future<LiveEntry?> handle(String action) async {
    final entry = await current();
    if (entry == null) {
      await notifier.cancel();
      return null;
    }
    final w = repo.local.row('SELECT deleted, ended_at FROM workout WHERE id = ?', [entry.workoutId]);
    if (w == null || w['deleted'] == 1 || w['ended_at'] != null) {
      await clear();
      return null;
    }
    switch (action) {
      case LiveAction.weightMinus:
        entry.changeWeight(-1);
      case LiveAction.weightPlus:
        entry.changeWeight(1);
      case LiveAction.repsMinus:
        entry.changeReps(-1);
      case LiveAction.repsPlus:
        entry.changeReps(1);
      case LiveAction.done:
        return _complete(entry);
      default:
        return entry;
    }
    await publish(entry);
    return entry;
  }

  /// Saves the set like the button in the app: rest timer (not after a warm-up, in a superset after the round),
  /// then the next warm-up or working set, or the superset partner.
  Future<LiveEntry> _complete(LiveEntry entry) async {
    final e = repo.exercise(entry.exerciseId);
    entry.save(repo);
    final round = entry.warmup || e == null ? (go: null, rest: false) : supersetRound(repo, entry.workoutId, e);
    if (!entry.warmup && round.rest && entry.restSeconds > 0) {
      await rest.start(entry.restSeconds, exercise: entry.exerciseName);
    }
    LiveEntry next;
    if (e != null && round.go != null) {
      next = await liveEntryFor(repo, rest, entry.workoutId, round.go!, globalRest: _globalRest);
    } else if (e != null && entry.warmup) {
      next = await liveEntryFor(repo, rest, entry.workoutId, e, equipmentId: entry.equipmentId, globalRest: _globalRest);
    } else {
      next = entry.copy()
        ..setNo = entry.setNo + 1
        ..note = '';
    }
    await publish(next);
    return next;
  }
}

/// Texts of the notification lines for [entry] (without translations of the labels).
String liveWeightText(LiveEntry e, String Function(num) kg) => e.timed ? '${e.minutes} min' : '${kg(e.weight)} kg';
