import 'package:flutter/services.dart';

/// The permanent workout notification (Android). All texts come from the app (translated there).
class HafsLive {
  static const _channel = MethodChannel('de.schumey.hafs/live');

  /// Shows or updates the notification. Keys: `title`, `subtitle`, `weightText`, `repsText` (empty = hidden),
  /// `doneText`, `doneAction`, `restEndMs` (epoch ms, 0 = none), `channelName`, and the action ids `weightMinus`,
  /// `weightPlus`, `repsMinus`, `repsPlus`.
  static Future<void> show(Map<String, Object?> args) => _channel.invokeMethod<void>('show', args);

  /// Texts of the home screen widget: `kicker`, `title`, `lines` (lines separated by a line break).
  static Future<void> widget(Map<String, Object?> args) => _channel.invokeMethod<void>('widget', args);

  static Future<void> cancel() => _channel.invokeMethod<void>('cancel');

  /// Texts of the widget "Nutrition today": `kicker`, `title`, `lines`.
  static Future<void> nutritionWidget(Map<String, Object?> args) => _channel.invokeMethod<void>('nutritionWidget', args);

  /// Google's code scanner (Play services, no camera permission): `{code, error}`, error `cancel` or `unavailable`.
  static Future<Map<String, String>> scanBarcode() async {
    final r = await _channel.invokeMethod<Map>('scanBarcode');
    return {'code': r?['code'] as String? ?? '', 'error': r?['error'] as String? ?? 'unavailable'};
  }

  /// The action a widget button opened the app with (`nutrition`, `scan`, `add`), once; '' when there is none.
  static Future<String> takeAction() async => await _channel.invokeMethod<String>('takeAction') ?? '';
}
