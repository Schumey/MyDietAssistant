import 'dart:io';

import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'db_open.dart';
import 'l10n.dart';
import 'repo.dart';
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

const _mainId = 7003;
const _repsId = 7004;

/// The permanent workout notification on Android. Two notifications, because Android shows at most three buttons:
/// the main one (exercise, set, weight, reps) with „weight −“, „weight +“ and „set done“, and a small one for the reps.
/// Both cannot be swiped away and stay silent when they change.
class AndroidLiveNotifier implements LiveNotifier {
  AndroidLiveNotifier({FlutterLocalNotificationsPlugin? plugin}) : _plugin = plugin ?? FlutterLocalNotificationsPlugin();

  final FlutterLocalNotificationsPlugin _plugin;
  late final AndroidRestNotifier _initializer = AndroidRestNotifier(plugin: _plugin);

  AndroidNotificationDetails _details(List<AndroidNotificationAction> actions) => AndroidNotificationDetails(
        'workout_live',
        tr('live_channel'),
        importance: Importance.low,
        priority: Priority.low,
        ongoing: true,
        autoCancel: false,
        onlyAlertOnce: true,
        showWhen: false,
        category: AndroidNotificationCategory.status,
        actions: actions,
      );

  AndroidNotificationAction _button(String id, String title) => AndroidNotificationAction(id, title, cancelNotification: false);

  @override
  Future<void> show(LiveEntry e) async {
    await _init();
    final unit = e.timed ? tr('live_minutes_short') : tr('live_weight_short');
    final set = e.plannedSets == null ? tr('set_n', [e.setNo]) : '${tr('set_n', [e.setNo])}/${e.plannedSets}';
    final line = e.timed ? liveWeightText(e, L10n.kg) : '${liveWeightText(e, L10n.kg)} × ${e.reps}';
    await _plugin.show(
      id: _mainId,
      title: '${e.exerciseName} · $set',
      body: e.warmup ? '${tr('kind_warmup')}: $line' : line,
      notificationDetails: NotificationDetails(
        android: _details([
          _button(LiveAction.weightMinus, '$unit −'),
          _button(LiveAction.weightPlus, '$unit +'),
          _button(LiveAction.done, tr('save_set')),
        ]),
      ),
    );
    if (e.timed) {
      await _plugin.cancel(id: _repsId);
      return;
    }
    await _plugin.show(
      id: _repsId,
      title: '${tr('live_reps_short')}: ${e.reps}',
      notificationDetails: NotificationDetails(
        android: _details([
          _button(LiveAction.repsMinus, '${tr('live_reps_short')} −'),
          _button(LiveAction.repsPlus, '${tr('live_reps_short')} +'),
        ]),
      ),
    );
  }

  @override
  Future<void> cancel() async {
    await _init();
    await _plugin.cancel(id: _mainId);
    await _plugin.cancel(id: _repsId);
  }

  /// The plugin is initialised by the rest timer's notifier with the click handlers; this only makes sure it is.
  Future<void> _init() => _initializer.requestInit();
}

LiveStore createLiveStore() => PrefsLiveStore();

LiveNotifier createLiveNotifier() => Platform.isAndroid ? AndroidLiveNotifier() : NoopLiveNotifier();

/// A button of the notification while the app is not in front: does the work with its own connection to the
/// database (the app may not even be running), then updates the notification. The open screen sees the change
/// through the revision of the live entry.
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
