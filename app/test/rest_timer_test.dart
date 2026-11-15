import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/rest_timer.dart';

class FakeNotifier implements RestNotifier {
  final List<String> log = [];

  @override
  Future<void> show(DateTime endsAt, String exerciseName) async => log.add('show ${endsAt.millisecondsSinceEpoch} $exerciseName');

  @override
  Future<void> cancel() async => log.add('cancel');

  @override
  Future<void> requestPermission() async => log.add('permission');
}

void main() {
  late DateTime now;
  late MemoryRestStore store;
  late FakeNotifier notifier;
  late RestTimer timer;

  setUp(() {
    now = DateTime(2026, 11, 10, 18, 0, 0);
    store = MemoryRestStore();
    notifier = FakeNotifier();
    timer = RestTimer(store: store, notifier: notifier, clock: () => now);
  });

  tearDown(() => timer.dispose());

  test('start: remaining time, store and notification', () async {
    expect(timer.running, isFalse);
    await timer.start(90, exercise: 'Bankdrücken');
    expect(timer.running, isTrue);
    expect(timer.remaining, const Duration(seconds: 90));
    expect(await store.endMs(), now.add(const Duration(seconds: 90)).millisecondsSinceEpoch);
    expect(await store.name(), 'Bankdrücken');
    expect(notifier.log.single, 'show ${now.add(const Duration(seconds: 90)).millisecondsSinceEpoch} Bankdrücken');
  });

  test('remaining counts down with the clock and ends at zero', () async {
    await timer.start(60);
    now = now.add(const Duration(seconds: 45));
    expect(timer.remaining, const Duration(seconds: 15));
    now = now.add(const Duration(seconds: 20));
    expect(timer.remaining, Duration.zero);
    expect(timer.running, isFalse);
  });

  test('start with 0 seconds does nothing (rest switched off)', () async {
    await timer.start(0);
    expect(timer.running, isFalse);
    expect(notifier.log, isEmpty);
    expect(await store.endMs(), isNull);
  });

  test('extend adds 30 s to a running timer and starts one when idle', () async {
    await timer.start(60);
    now = now.add(const Duration(seconds: 10));
    await timer.extend();
    expect(timer.remaining, const Duration(seconds: 80));
    await timer.stop();
    await timer.extend();
    expect(timer.remaining, const Duration(seconds: 30));
  });

  test('extend after the timer ran out starts from now, not from the old end', () async {
    await timer.start(30);
    now = now.add(const Duration(minutes: 5));
    await timer.extend();
    expect(timer.remaining, const Duration(seconds: 30));
  });

  test('stop clears state and cancels the notification', () async {
    await timer.start(60);
    await timer.stop();
    expect(timer.running, isFalse);
    expect(await store.endMs(), isNull);
    expect(notifier.log.last, 'cancel');
  });

  test('restore picks up a timer that is still running (app restart)', () async {
    await store.setEndMs(now.add(const Duration(seconds: 40)).millisecondsSinceEpoch);
    await store.setName('Kniebeuge');
    await timer.restore();
    expect(timer.running, isTrue);
    expect(timer.remaining, const Duration(seconds: 40));
    expect(timer.exercise, 'Kniebeuge');
  });

  test('restore drops a timer that ended while the app was closed', () async {
    await store.setEndMs(now.subtract(const Duration(seconds: 5)).millisecondsSinceEpoch);
    await timer.restore();
    expect(timer.running, isFalse);
  });

  test('restore follows a change made by the notification button', () async {
    await timer.start(60);
    await store.setEndMs(now.add(const Duration(seconds: 90)).millisecondsSinceEpoch); // "+30 s" in the background
    await timer.restore();
    expect(timer.remaining, const Duration(seconds: 90));
    await store.setEndMs(null); // "Stop" in the background
    await timer.restore();
    expect(timer.running, isFalse);
  });

  test('format', () {
    expect(RestTimer.format(const Duration(seconds: 90)), '1:30');
    expect(RestTimer.format(const Duration(seconds: 5)), '0:05');
    expect(RestTimer.format(const Duration(milliseconds: 89200)), '1:30'); // rounds up, never shows 0:00 early
    expect(RestTimer.format(Duration.zero), '0:00');
    expect(RestTimer.format(const Duration(minutes: 12, seconds: 3)), '12:03');
  });

  test('rest length order: device choice for the exercise, then the training day, then the global setting, then 90 s', () async {
    expect(await timer.restSeconds('e1'), 90);
    expect(await timer.restSeconds('e1', global: 120), 120);
    expect(await timer.restSeconds('e1', planned: 180, global: 120), 180);
    expect(await timer.restSeconds('e1', planned: 0, global: 120), 0); // 0 = no timer, not "unset"
    expect(await timer.cycleRest('e1', planned: 180, global: 120), 240); // cycling starts from what applies
    expect(await timer.restSeconds('e1', planned: 180, global: 120), 240); // and the device choice wins from then on
  });

  test('rest length per exercise: default, cycling through the presets, wraps around', () async {
    expect(await timer.restSeconds('e1'), 90);
    expect(await timer.cycleRest('e1'), 120);
    expect(await timer.cycleRest('e1'), 150);
    expect(await timer.cycleRest('e1'), 180);
    expect(await timer.cycleRest('e1'), 240);
    expect(await timer.cycleRest('e1'), 0); // off
    expect(await timer.cycleRest('e1'), 45);
    expect(await timer.restSeconds('e1'), 45);
    expect(await timer.restSeconds('e2'), 90); // other exercises keep the default
  });
}
