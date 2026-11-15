# hafs_live

Android plugin of the HAFS app: one permanent workout notification with a custom layout (exercise, set, weight and
reps with minus/plus buttons, "set done", rest countdown).

It is a plugin (not app code) so that it is registered in the background engine that `flutter_local_notifications`
starts for the notification buttons: the buttons are sent to that plugin's `ActionBroadcastReceiver` and arrive in Dart
as `NotificationResponse.actionId`; the app then updates the notification again through this plugin.
