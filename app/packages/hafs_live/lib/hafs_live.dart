import 'package:flutter/services.dart';

/// The permanent workout notification (Android). All texts come from the app (translated there).
class HafsLive {
  static const _channel = MethodChannel('de.schumey.hafs/live');

  /// Shows or updates the notification. Keys: `title`, `subtitle`, `weightText`, `repsText` (empty = hidden),
  /// `doneText`, `doneAction`, `restEndMs` (epoch ms, 0 = none), `channelName`, and the action ids `weightMinus`,
  /// `weightPlus`, `repsMinus`, `repsPlus`.
  static Future<void> show(Map<String, Object?> args) => _channel.invokeMethod<void>('show', args);

  static Future<void> cancel() => _channel.invokeMethod<void>('cancel');
}
