import 'dart:io';
import 'dart:ui';

import 'package:flutter/widgets.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/data/latest_all.dart' as tzdata;

import 'l10n.dart';
import 'rest_timer.dart';
import 'workout_live.dart';
import 'workout_notification.dart';

/// Zustand des Pausen-Timers in den Einstellungen des Geräts (auch aus dem Hintergrund lesbar).
class PrefsRestStore implements RestStore {
  PrefsRestStore([SharedPreferencesAsync? prefs]) : _prefs = prefs ?? SharedPreferencesAsync();

  final SharedPreferencesAsync _prefs;

  @override
  Future<int?> endMs() => _prefs.getInt('rest_end_ms');

  @override
  Future<void> setEndMs(int? value) => value == null ? _prefs.remove('rest_end_ms') : _prefs.setInt('rest_end_ms', value);

  @override
  Future<String> name() async => await _prefs.getString('rest_name') ?? '';

  @override
  Future<void> setName(String value) => _prefs.setString('rest_name', value);

  @override
  Future<int?> restFor(String exerciseId) => _prefs.getInt('rest_s_$exerciseId');

  @override
  Future<void> setRestFor(String exerciseId, int seconds) => _prefs.setInt('rest_s_$exerciseId', seconds);
}

const _runningId = 7001;
const _doneId = 7002;
const _actionAdd = restAddAction;
const _actionStop = 'rest_stop';

/// Pausen-Timer auf Android: Countdown und „Pause vorbei“ steckt in der Workout-Benachrichtigung (`hafs_live`, sie
/// meldet sich zur genauen Zeit selbst); hier wird sie nur zur Aktualisierung angestoßen.
class AndroidRestNotifier implements RestNotifier {
  AndroidRestNotifier({FlutterLocalNotificationsPlugin? plugin}) : _plugin = plugin ?? FlutterLocalNotificationsPlugin();

  final FlutterLocalNotificationsPlugin _plugin;
  bool _ready = false;

  Future<void> init({
    DidReceiveNotificationResponseCallback? onResponse,
    DidReceiveBackgroundNotificationResponseCallback? onBackground,
  }) async {
    if (_ready) return;
    tzdata.initializeTimeZones();
    await _plugin.initialize(
      settings: const InitializationSettings(android: AndroidInitializationSettings('@mipmap/ic_launcher')),
      onDidReceiveNotificationResponse: onResponse,
      onDidReceiveBackgroundNotificationResponse: onBackground,
    );
    _ready = true;
  }

  /// Initialises the plugin with the handlers for the notification buttons (once).
  Future<void> requestInit() => init(onResponse: _onResponse, onBackground: restNotificationBackground);

  @override
  Future<void> requestPermission() async {
    await init(onResponse: _onResponse, onBackground: restNotificationBackground);
    await _plugin.resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()?.requestNotificationsPermission();
  }

  /// The countdown and the „rest over“ alert are part of the workout notification (`hafs_live`); it is asked to refresh.
  @override
  Future<void> show(DateTime endsAt, String exerciseName) async {
    await init(onResponse: _onResponse, onBackground: restNotificationBackground);
    // no separate notification any more: the workout notification itself alerts when the rest is over
    await _plugin.cancel(id: _runningId);
    await _plugin.cancel(id: _doneId);
    await refreshLiveNotification();
  }

  @override
  Future<void> cancel() async {
    await init(onResponse: _onResponse, onBackground: restNotificationBackground);
    await _plugin.cancel(id: _runningId);
    await _plugin.cancel(id: _doneId);
    await refreshLiveNotification();
  }
}

/// Knöpfe der Benachrichtigung, wenn die App im Vordergrund ist.
void _onResponse(NotificationResponse response) => _handleAction(response.actionId);

/// Knöpfe der Benachrichtigung, wenn die App im Hintergrund oder beendet ist (eigener Isolate).
@pragma('vm:entry-point')
void restNotificationBackground(NotificationResponse response) {
  WidgetsFlutterBinding.ensureInitialized();
  L10n.lang = L10n.resolve(PlatformDispatcher.instance.locale.languageCode);
  _handleAction(response.actionId);
}

Future<void> _handleAction(String? action) async {
  if (LiveAction.isLive(action)) {
    await handleLiveAction(action!);
    return;
  }
  final store = PrefsRestStore();
  final notifier = AndroidRestNotifier();
  if (action == _actionStop) {
    await store.setEndMs(null);
    await notifier.cancel();
  } else if (action == _actionAdd) {
    final end = await store.endMs();
    final base = end == null ? DateTime.now() : DateTime.fromMillisecondsSinceEpoch(end);
    final next = (base.isAfter(DateTime.now()) ? base : DateTime.now()).add(const Duration(seconds: RestTimer.extendSeconds));
    await store.setEndMs(next.millisecondsSinceEpoch);
    await notifier.show(next, await store.name());
  }
}

/// Der Timer der App: mit Benachrichtigungen auf Android, sonst nur die Anzeige.
RestTimer createRestTimer() {
  if (!Platform.isAndroid) return RestTimer(store: PrefsRestStore());
  return RestTimer(store: PrefsRestStore(), notifier: AndroidRestNotifier());
}
