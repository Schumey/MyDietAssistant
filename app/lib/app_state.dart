import 'health_export.dart';
import 'plates.dart';
import 'updater.dart';
import 'l10n.dart';
import 'home_widget.dart';
import 'photo.dart';
import 'repo_gym.dart';
import 'templates.dart';
import 'dart:async';
import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:hafs_live/hafs_live.dart';

import 'credentials.dart';
import 'ingress.dart';
import 'db.dart';
import 'ha_client.dart';
import 'repo.dart';
import 'rest_timer.dart';
import 'sync.dart';
import 'workout_live.dart';

typedef Connector = Future<HaConnection> Function(String address, String token);

/// Zustand der App: Anmeldedaten, lokale Datenbank und der Abgleich mit Home Assistant.
///
/// Die Datenbank ist immer offen, auch ohne Verbindung: Training erfassen geht offline,
/// abgeglichen wird, wenn eine Verbindung da ist.
class AppState extends ChangeNotifier {
  AppState(this.credentials, {required this.openDb, Connector? connector, RestTimer? rest, WorkoutSink? workoutSink, LiveStore? liveStore, LiveNotifier? liveNotifier, PhotoSource? photoSource, HomeWidget? homeWidget, IngressOpener? ingress, Future<String> Function()? takeAction})
      : homeWidget = homeWidget ?? defaultHomeWidget(),
        photoSource = photoSource ?? ImagePickerSource(),
        ingress = ingress ?? IngressOpener(),
        _takeAction = takeAction ?? (() async => Platform.isAndroid ? await HafsLive.takeAction() : ''),
        // ignore: prefer_initializing_formals
        _connector = connector,
        // ignore: prefer_initializing_formals
        _workoutSink = workoutSink,
        _liveStore = liveStore ?? MemoryLiveStore(),
        _liveNotifier = liveNotifier ?? NoopLiveNotifier(),
        rest = rest ?? RestTimer();

  final WorkoutSink? _workoutSink;
  final LiveStore _liveStore;
  final LiveNotifier _liveNotifier;
  final PhotoSource photoSource;
  final HomeWidget homeWidget;
  WidgetContent? _widgetShown;

  /// The set entry of the running workout, shared with the permanent notification; null before the database is open.
  LiveController? live;

  final CredentialStore credentials;
  final Future<LocalDb> Function() openDb;
  final Connector? _connector;

  /// Ingress sessions for the HA app (training calls, nutrition WebView, self-update).
  final IngressOpener ingress;

  /// Training: the HA app over ingress, or the former integration while moving over (see ingress.dart).
  Future<HaConnection> _connect(String address, String token) =>
      _connector != null ? _connector(address, token) : connectTraining(address, token, opener: ingress);

  /// A session for the HA app (nutrition WebView, updates); [fresh] asks for a new one. Always HAFS 2, never an older
  /// MyDietAssistant installed next to it, so nutrition shows the same app as training.
  Future<IngressAccess> ingressAccess({bool fresh = false}) {
    if (!hasCredentials) throw HaException(tr('err_token'));
    return openHafsApp(ingress, address!, _token!, fresh: fresh);
  }

  /// Action a widget button of "Nutrition today" asked for (`scan`, `add`); the nutrition page runs and clears it.
  String pendingNutritionAction = '';

  /// Reads the action the app was opened with from a home screen widget (Android) and switches to nutrition for it.
  Future<void> takeWidgetAction() async {
    final String action;
    try {
      action = await _takeAction();
    } catch (_) {
      return;
    }
    if (action.isEmpty) return;
    pendingNutritionAction = action;
    setArea('nutrition');
  }

  final Future<String> Function() _takeAction;

  /// Area shown last: `training` or `nutrition` (device local).
  String get area => local?.state('area') == 'nutrition' ? 'nutrition' : 'training';

  void setArea(String value) {
    local?.setState('area', value);
    notifyListeners();
  }

  /// Totals of today handed over by the nutrition page (`MDAApp.summary`), shown by the widget "Nutrition today".
  Future<void> nutritionSummary(String day, double kcal, double goal) async {
    try {
      await homeWidget.showNutrition(buildNutritionWidget(day, kcal, goal));
    } catch (_) {
      // the widget is a convenience
    }
  }

  /// Pausen-Timer zwischen den Sätzen.
  final RestTimer rest;

  bool loaded = false;
  String? address;
  String? _token;
  LocalDb? local;
  Repo? repo;
  bool syncing = false;
  String? syncError;
  String phase = '';

  /// Progression settings kept on the server (`hafs/pref/*`), cached here: key -> value ('' = default).
  static const settingKeys = ['hit_fraction', 'cut_drop_set_first', 'rest_default'];
  final Map<String, String> settings = {};

  /// Pause zwischen den Sätzen für alle Übungen (Einstellung im Panel), `null` = nicht gesetzt (90 s).
  int? get restDefault => int.tryParse(settings['rest_default'] ?? '');

  bool get hasCredentials => address != null && _token != null;

  /// Writes finished workouts to Health Connect (opt-in), null before the local database is open.
  HealthExport? health;

  /// Self-update from this Home Assistant (Android only), null when not signed in or unsupported.
  Updater? get updater => hasCredentials && Updater.supported
      ? Updater(address: address!, token: _token!, ingress: () async {
          final a = await ingressAccess();
          return (url: a.url, cookie: a.cookie);
        })
      : null;

  DateTime? get lastSync {
    final s = local?.state('last_sync');
    return s == null ? null : DateTime.tryParse(s)?.toLocal();
  }

  int get pending => local?.pendingCount() ?? 0;

  Future<void> start() async {
    final saved = await credentials.load();
    address = saved?.address;
    _token = saved?.token;
    local = await openDb();
    repo = Repo(local!);
    live = LiveController(repo: repo!, rest: rest, store: _liveStore, notifier: _liveNotifier);
    health = HealthExport(local!, sink: _workoutSink);
    phase = local!.state('phase') ?? '';
    for (final k in settingKeys) {
      settings[k] = local!.state('pref_$k') ?? '';
    }
    loaded = true;
    notifyListeners();
    unawaited(takeWidgetAction()); // started from a widget button of "Nutrition today"
    unawaited(rest.restore());
    unawaited(health!.exportPending()); // workouts finished while the export could not run
    if (hasCredentials) unawaited(syncNow());
  }

  /// Meldet an, speichert die Daten nur bei Erfolg und holt die Daten zum ersten Mal.
  Future<void> login(String addr, String token) async {
    final trimmed = addr.trim();
    final connection = await _connect(trimmed, token.trim());
    try {
      // Another user than the one whose data is on the device: start clean instead of mixing the two
      // (and instead of sending the previous user's unsent changes to the new account).
      final userId = await _serverUser(connection);
      if (userId != null && local!.userId != null && local!.userId != userId) {
        local!.clearUserData();
        phase = '';
        settings.updateAll((_, _) => '');
      }
      final result = SyncService(local!, connection);
      await result.sync();
      if (userId != null) local!.setState('user_id', userId);
    } finally {
      await connection.close();
    }
    await credentials.save(trimmed, token.trim());
    address = trimmed;
    _token = token.trim();
    syncError = null;
    notifyListeners();
  }

  /// The id of the signed-in HA user from `hafs/info` (`null` for older servers).
  Future<String?> _serverUser(HaConnection connection) async {
    try {
      final info = await connection.call('hafs/info') as Map;
      return info['user_id'] as String?;
    } catch (_) {
      return null;
    }
  }

  /// Asks Home Assistant which gym the user is at (zone of the person entity matched with the gyms' zone) and makes it the
  /// default for the next workout. Never throws and gives up after a few seconds (offline in the gym is normal).
  Future<String?> detectGym() async {
    if (!hasCredentials || local == null) return null;
    HaConnection? connection;
    try {
      connection = await _connect(address!, _token!).timeout(const Duration(seconds: 4));
      final r = await connection.call('hafs/gym/current').timeout(const Duration(seconds: 4)) as Map;
      final id = r['gym_id'] as String?;
      if (id != null && repo!.gyms().any((g) => g.id == id)) {
        local!.setState('last_gym', id);
        return id;
      }
    } catch (_) {
      // no connection or an older server: keep the remembered gym
    } finally {
      try {
        await connection?.close();
      } catch (_) {}
    }
    return null;
  }

  /// Asks the AI set up in Home Assistant for a plan draft (`hafs/plan/suggest`). The server validates the answer
  /// against the user's own exercises. Throws [HaException] with a readable message on failure.
  Future<List<PlanDay>> suggestPlan({required int days, required int minutes, String goal = '', String notes = ''}) async {
    if (!hasCredentials) throw HaException('not signed in');
    final connection = await _connect(address!, _token!);
    try {
      final r = await connection.call('hafs/plan/suggest', {'days': days, 'minutes': minutes, 'goal': goal, 'notes': notes, 'language': L10n.lang}) as Map;
      return [
        for (final d in (r['days'] as List).cast<Map>())
          PlanDay(d['name'] as String, [
            for (final x in (d['exercises'] as List).cast<Map>())
              PlanExercise(x['id'] as String, x['name'] as String, x['sets'] as int, x['reps_min'] as int, x['reps_max'] as int),
          ]),
      ];
    } finally {
      await connection.close();
    }
  }

  Future<void> syncNow() async {
    if (!hasCredentials || syncing) return;
    syncing = true;
    syncError = null;
    notifyListeners();
    HaConnection? connection;
    try {
      connection = await _connect(address!, _token!);
      final userId = await _serverUser(connection);
      if (userId != null && local!.userId != null && local!.userId != userId) {
        // the token now belongs to another user than the data on the device (should not happen: login() cleans up)
        throw HaException('The data on this device belongs to another user. Please sign out and in again.');
      }
      await SyncService(local!, connection).sync();
      if (userId != null && local!.userId == null) local!.setState('user_id', userId);
      final p = (await connection.call('hafs/pref/get', {'key': 'phase'}) as Map)['value'] as String? ?? '';
      phase = p;
      local!.setState('phase', p);
      for (final k in settingKeys) {
        try {
          final v = (await connection.call('hafs/pref/get', {'key': k}) as Map)['value'] as String? ?? '';
          settings[k] = v;
          local!.setState('pref_$k', v);
        } on HaException {
          // older server without this setting: keep the cached value
        }
      }
    } on HaException catch (e) {
      syncError = e.message;
    } catch (e) {
      syncError = '$e';
    } finally {
      await connection?.close();
      syncing = false;
      notifyListeners();
    }
  }

  /// Setzt die Ernährungsphase auf dem Server; die Zielwerte werden dort neu berechnet und beim Abgleich geholt.
  Future<void> setPhase(String value) async {
    if (!hasCredentials) return;
    final connection = await _connect(address!, _token!);
    try {
      await connection.call('hafs/pref/set', {'key': 'phase', 'value': value});
      phase = value;
      local!.setState('phase', value);
    } finally {
      await connection.close();
    }
    notifyListeners();
    await syncNow();
  }

  /// Rückblick vom Server: stagnierende Übungen und vernachlässigte Muskelgruppen (`stagnating`, `neglected`), mit
  /// [ai] zusätzlich `text` der in Home Assistant eingerichteten KI. Braucht eine Verbindung.
  Future<Map<String, dynamic>> review({bool ai = false}) async {
    if (!hasCredentials) throw HaException('Not signed in');
    final connection = await _connect(address!, _token!);
    try {
      final r = await connection.call('hafs/review', {'ai': ai, 'language': L10n.lang});
      return Map<String, dynamic>.from(r as Map);
    } finally {
      await connection.close();
    }
  }

  /// Setzt das nächste Gewicht einer Übung von Hand (einmalige Vorgabe auf dem Server; die Progression rechnet nach
  /// dem nächsten Workout mit der Übung wieder selbst) und holt das neue Ziel. Braucht eine Verbindung.
  Future<void> setNextWeight(String exerciseId, double weight) async {
    if (!hasCredentials) throw HaException('Not signed in');
    final connection = await _connect(address!, _token!);
    try {
      await connection.call('hafs/target/set', {'exercise_id': exerciseId, 'weight': weight});
    } finally {
      await connection.close();
    }
    await syncNow();
  }

  /// Barbell for the plate calculator (device local, not synced).
  double get plateBar => double.tryParse(local?.state('plate_bar') ?? '') ?? defaultBar;
  List<double> get plateSet => parsePlates(local?.state('plate_set') ?? '') ?? defaultPlates;

  void setPlates(double bar, List<double> plates) {
    local?.setState('plate_bar', '$bar');
    local?.setState('plate_set', plates.join(' '));
    notifyListeners();
  }

  /// Ändert eine Progressions-Einstellung auf dem Server (rechnet dort alle Zielwerte neu) und holt sie.
  Future<void> setSetting(String key, String value) async {
    if (!hasCredentials) return;
    final connection = await _connect(address!, _token!);
    try {
      await connection.call('hafs/pref/set', {'key': key, 'value': value});
      settings[key] = value;
      local!.setState('pref_$key', value);
    } finally {
      await connection.close();
    }
    notifyListeners();
    await syncNow();
  }

  /// Ein Schreibzugriff auf die Daten ist erfolgt: Oberfläche aktualisieren.
  void changed() => notifyListeners();

  @override
  void notifyListeners() {
    super.notifyListeners();
    _refreshWidget();
  }

  /// Keeps the home screen widget in step with the plan; only sends when the texts changed.
  void _refreshWidget() {
    try {
      final content = buildWidgetContent(repo);
      if (content == _widgetShown) return;
      _widgetShown = content;
      homeWidget.show(content).catchError((_) {});
    } catch (_) {
      // the widget is a convenience, never a reason to fail
    }
  }

  /// Meldet ab. Die lokalen Daten (auch noch nicht gesendete) bleiben auf dem Gerät.
  Future<void> logout() async {
    if (pending > 0) await syncNow(); // best effort: whatever is not sent now is lost if another user signs in next
    if (hasCredentials) ingress.forget(address!, _token!);
    await credentials.clear();
    address = null;
    _token = null;
    notifyListeners();
  }
}
