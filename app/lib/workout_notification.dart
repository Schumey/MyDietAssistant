import 'dart:convert';
import 'dart:io';

import 'package:hafs_live/hafs_live.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'db_open.dart';
import 'l10n.dart';
import 'repo.dart';
import 'rest_timer.dart';
import 'rest_android.dart';
import 'workout_live.dart';

/// The live entry in the device settings (readable from the background isolate of the notification buttons).
class PrefsLiveStore implements LiveStore {
  PrefsLiveStore([SharedPreferencesAsync? prefs]) : _prefs = prefs ?? SharedPreferencesAsync();

  final SharedPreferencesAsync _prefs;

  @override
  Future<String?> read() => _prefs.getString('live_entry');

  @override
  Future<void> write(String? json) => json == null ? _prefs.remove('live_entry') : _prefs.setString('live_entry', json);
}

/// Id of the rest-timer action that adds 30 seconds (handled in `rest_android.dart`).
const restAddAction = 'rest_add';

/// The permanent workout notification on Android: ONE notification with its own layout (plugin `hafs_live`): exercise and set,
/// weight and reps with minus/plus, the main button („set done“, or „next exercise“ once the planned sets are done) and the
/// rest countdown while the pause runs. It cannot be swiped away and stays silent when it changes.
class AndroidLiveNotifier implements LiveNotifier {
  AndroidLiveNotifier({RestStore? restStore}) : _rest = restStore ?? PrefsRestStore();

  final RestStore _rest;

  @override
  Future<void> show(LiveEntry e) async {
    final set = e.plannedSets == null ? tr('set_n', [e.setNo]) : '${tr('set_n', [e.setNo])}/${e.plannedSets}';
    final restEnd = await _rest.endMs() ?? 0;
    final hasNext = e.planDone && e.nextName != null;
    final doneText = hasNext ? tr('next_exercise') : (e.planDone ? tr('extra_set') : tr('save_set'));
    final subtitle = [
      if (e.warmup) tr('kind_warmup'),
      if (hasNext) '${tr('next_exercise')}: ${e.nextName}',
      if (restEnd > DateTime.now().millisecondsSinceEpoch) tr('live_tap_rest'),
    ].join(' · ');
    await HafsLive.show({
      'title': '${e.exerciseName} · $set',
      'subtitle': subtitle,
      'weightText': liveWeightText(e, L10n.kg),
      'repsText': e.timed ? '' : '${e.reps} ${tr('live_reps_short')}',
      'doneText': doneText,
      'doneAction': hasNext ? LiveAction.next : LiveAction.done,
      'weightMinus': LiveAction.weightMinus,
      'weightPlus': LiveAction.weightPlus,
      'repsMinus': LiveAction.repsMinus,
      'repsPlus': LiveAction.repsPlus,
      'restEndMs': restEnd,
      'restFormat': tr('live_rest_format'),
      'restAddAction': restAddAction,
      'channelName': tr('live_channel'),
      'alertChannelName': tr('rest_channel_done'),
    });
  }

  @override
  Future<void> cancel() => HafsLive.cancel();
}

LiveStore createLiveStore() => PrefsLiveStore();

LiveNotifier createLiveNotifier() => Platform.isAndroid ? AndroidLiveNotifier() : NoopLiveNotifier();

/// Shows the notification again with the current rest (called by the rest timer when it starts, ends or is changed).
Future<void> refreshLiveNotification() async {
  if (!Platform.isAndroid) return;
  final entry = await PrefsLiveStore().read();
  if (entry == null) return;
  try {
    await AndroidLiveNotifier().show(LiveEntry.fromJson((jsonDecode(entry) as Map).cast<String, dynamic>()));
  } catch (_) {
    // a broken stored entry: nothing to refresh
  }
}

/// A button of the notification: does the work with its own connection to the database (the app may not even be
/// running), then updates the notification. The open screen sees the change through the revision of the live entry.
Future<void> handleLiveAction(String action) async {
  final local = await openAppDatabase();
  final rest = createRestTimer();
  try {
    final controller = LiveController(repo: Repo(local), rest: rest, store: PrefsLiveStore(), notifier: AndroidLiveNotifier());
    await controller.handle(action);
  } finally {
    rest.dispose();
    local.db.close();
  }
}
