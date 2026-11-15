/// The native side of `window.MDAApp` for the nutrition page in the WebView.
///
/// webview_flutter can only pass messages (no synchronous calls like the former Kotlin `@JavascriptInterface`), so
/// app.js builds `window.MDAApp` itself when it finds the channel `HAFSBridge`: the version comes from the user agent
/// (`HAFSApp/<version>`), widget actions arrive through `window.mdaAction`, everything else is a message
/// `{"m": method, "a": [args]}` handled here. Answers go back through the page's callbacks `mdaScanResult(code, error)`
/// and `mdaHealthResult(json, error)`, exactly as with the Kotlin app.
library;

import 'dart:convert';

/// JavaScript that calls `window.<fn>(args…)` if the page defines it.
String jsCall(String fn, List<Object?> args) => 'window.$fn && window.$fn(${args.map(jsonEncode).join(', ')})';

/// JavaScript that runs a widget action; evaluates to 1 when the page was ready for it.
String jsAction(String action) => 'window.mdaAction ? (window.mdaAction(${jsonEncode(action)}), 1) : 0';

class NutritionBridge {
  NutritionBridge({
    required this.run,
    required this.summary,
    required this.scan,
    required this.health,
    required this.checkUpdate,
  });

  /// Runs JavaScript in the page.
  final Future<void> Function(String js) run;
  final Future<void> Function(String day, double kcal, double goal) summary;
  final Future<Map<String, String>> Function() scan;
  final Future<(String, String)> Function(int days, bool ask) health;
  final Future<void> Function() checkUpdate;

  Future<void> handle(String message) async {
    final Map msg;
    final List args;
    try {
      msg = jsonDecode(message) as Map;
      args = (msg['a'] as List?) ?? const [];
    } catch (_) {
      return; // not ours
    }
    switch (msg['m']) {
      case 'summary':
        try {
          final s = jsonDecode(args.first as String) as Map;
          await summary(s['day'] as String? ?? '', (s['kcal'] as num? ?? 0).toDouble(), (s['goal'] as num? ?? 0).toDouble());
        } catch (_) {}
      case 'scanBarcode':
        Map<String, String> r;
        try {
          r = await scan();
        } catch (_) {
          r = {'code': '', 'error': 'unavailable'};
        }
        await run(jsCall('mdaScanResult', [r['code'] ?? '', r['error'] ?? '']));
      case 'healthRead':
        final days = args.isNotEmpty && args[0] is num ? (args[0] as num).toInt() : 7;
        final ask = args.length > 1 && args[1] == true;
        final (json, error) = await health(days, ask);
        await run(jsCall('mdaHealthResult', [json, error]));
      case 'checkUpdate':
        await checkUpdate();
      default:
        break; // print and unknown methods: nothing to do
    }
  }
}
