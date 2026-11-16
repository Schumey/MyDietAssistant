import 'dart:async';
import 'dart:io';

import 'package:file_selector/file_selector.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:hafs_live/hafs_live.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import 'app_state.dart';
import 'health_read.dart';
import 'ingress.dart';
import 'l10n.dart';
import 'nutrition_bridge.dart';
import 'nutrition_theme.dart';
import 'update_dialog.dart';

/// The nutrition area: the HA app's web interface (diary, foods, …) full screen in a WebView, signed in through the
/// ingress session of the app (see ingress.dart). On Windows there is no WebView: a button opens it in the browser.
class NutritionView extends StatefulWidget {
  const NutritionView({super.key, required this.app});

  final AppState app;

  @override
  State<NutritionView> createState() => _NutritionViewState();
}

class _NutritionViewState extends State<NutritionView> {
  WebViewController? _web;
  NutritionBridge? _bridge;
  String? _error;
  bool _ready = false;
  Timer? _renew;
  IngressAccess? _access;
  String _themeJs = '';  // the app's colours for the page, sent after each load and when light/dark changes

  static const _renewEvery = Duration(minutes: 10);

  @override
  void initState() {
    super.initState();
    widget.app.addListener(_onApp);
    if (Platform.isAndroid) _load();
  }

  @override
  void dispose() {
    widget.app.removeListener(_onApp);
    _renew?.cancel();
    super.dispose();
  }

  /// A widget button asked for an action (scan, add): hand it to the page once it is ready.
  void _onApp() {
    if (_ready && widget.app.pendingNutritionAction.isNotEmpty) _runPending();
  }

  Future<void> _runPending() async {
    final action = widget.app.pendingNutritionAction;
    if (action.isEmpty || action == 'nutrition' || _web == null) {
      widget.app.pendingNutritionAction = '';
      return;
    }
    // app.js defines window.mdaAction after its settings arrived: try for a while
    for (var i = 0; i < 20; i++) {
      try {
        final r = await _web!.runJavaScriptReturningResult(jsAction(action));
        if ('$r' == '1') break;
      } catch (_) {}
      await Future<void>.delayed(const Duration(milliseconds: 500));
    }
    widget.app.pendingNutritionAction = '';
  }

  Future<void> _load() async {
    setState(() {
      _error = null;
      _ready = false;
    });
    try {
      final access = _access = await widget.app.ingressAccess();
      final version = (await PackageInfo.fromPlatform()).version;
      final web = _web ?? WebViewController();
      if (_web == null) {
        await web.setJavaScriptMode(JavaScriptMode.unrestricted);
        final agent = await web.getUserAgent() ?? '';
        await web.setUserAgent('$agent HAFSApp/$version');
        _bridge = NutritionBridge(
          run: web.runJavaScript,
          summary: widget.app.nutritionSummary,
          scan: HafsLive.scanBarcode,
          health: (days, ask) => HealthReader().read(days, ask),
          checkUpdate: _checkUpdate,
        );
        await web.addJavaScriptChannel('HAFSBridge', onMessageReceived: (m) => _bridge!.handle(m.message));
        await web.setNavigationDelegate(NavigationDelegate(
          onPageFinished: (_) {
            _ready = true;
            if (_themeJs.isNotEmpty) web.runJavaScript(_themeJs).catchError((_) {});
            _runPending();
          },
          onWebResourceError: (e) {
            if (e.isForMainFrame == true && mounted) setState(() => _error = e.description);
          },
          onHttpError: (e) {
            final code = e.response?.statusCode ?? 0;
            if (e.request?.uri.path == access.url().path && code >= 400 && mounted) setState(() => _error = tr('err_http', [code]));
          },
        ));
        final android = web.platform;
        if (android is AndroidWebViewController) await android.setOnShowFileSelector(_pickFiles);
        _web = web;
      }
      await _setCookie(access);
      await web.loadRequest(access.url());
      _renew?.cancel();
      _renew = Timer.periodic(_renewEvery, (_) => _renewSession());
      if (mounted) setState(() {});
    } catch (e) {
      if (mounted) setState(() => _error = '$e');
    }
  }

  Future<void> _setCookie(IngressAccess access) => WebViewCookieManager().setCookie(WebViewCookie(
        name: 'ingress_session',
        value: access.session,
        domain: access.base.host,
        path: '${access.base.path}/api/hassio_ingress/',
      ));

  /// Ingress sessions expire: a new one replaces the cookie without reloading the page.
  Future<void> _renewSession() async {
    try {
      final access = await widget.app.ingressAccess(fresh: true);
      await _setCookie(access);
      if (access.path != _access?.path) await _web?.loadRequest(access.url()); // the app was reinstalled
      _access = access;
    } catch (_) {
      // offline: the next try comes with the next timer tick
    }
  }

  /// `<input type=file>` in the page (backup import, photos, tables).
  Future<List<String>> _pickFiles(FileSelectorParams params) async {
    final types = [
      for (final t in params.acceptTypes.where((t) => t.trim().isNotEmpty))
        t.startsWith('.') ? XTypeGroup(extensions: [t.substring(1)]) : XTypeGroup(mimeTypes: [t]),
    ];
    final groups = types.isEmpty ? const <XTypeGroup>[] : types;
    if (params.mode == FileSelectorMode.openMultiple) {
      final files = await openFiles(acceptedTypeGroups: groups);
      return [for (final f in files) Uri.file(f.path).toString()];
    }
    final file = await openFile(acceptedTypeGroups: groups);
    return file == null ? const [] : [Uri.file(file.path).toString()];
  }

  Future<void> _checkUpdate() async {
    final updater = widget.app.updater;
    if (updater == null || !mounted) return;
    try {
      final offer = await updater.check();
      final version = await updater.currentVersion();
      if (!mounted) return;
      if (offer != null) {
        await showUpdateDialog(context, updater, offer: offer);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(tr('update_none', [version]))));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    }
  }

  Future<void> _openBrowser() async {
    final url = (await widget.app.ingressAccess()).panelUrl.toString();
    if (Platform.isWindows) {
      await Process.start('rundll32', ['url.dll,FileProtocolHandler', url]);
    } else if (Platform.isMacOS) {
      await Process.start('open', [url]);
    } else {
      await Process.start('xdg-open', [url]);
    }
  }

  /// Same look as training: the page takes the app's colour scheme (see nutrition_theme.dart).
  void _sendTheme(ColorScheme scheme) {
    final js = jsTheme(scheme);
    if (js == _themeJs) return;
    _themeJs = js;
    if (_ready) _web?.runJavaScript(js).catchError((_) {});
  }

  @override
  Widget build(BuildContext context) {
    _sendTheme(Theme.of(context).colorScheme);
    if (!Platform.isAndroid) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(tr('nutrition_browser'), textAlign: TextAlign.center),
            const SizedBox(height: 16),
            FilledButton.icon(onPressed: _openBrowser, icon: const Icon(Icons.open_in_browser), label: Text(tr('nutrition_open'))),
          ]),
        ),
      );
    }
    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(tr('nutrition_failed', [_error!]), textAlign: TextAlign.center),
            const SizedBox(height: 16),
            FilledButton(onPressed: _load, child: Text(tr('retry'))),
          ]),
        ),
      );
    }
    final web = _web;
    if (web == null) return const Center(child: CircularProgressIndicator());
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        if (await web.canGoBack()) {
          await web.goBack();
        } else {
          await SystemNavigator.pop(); // first page: back leaves the app as usual
        }
      },
      child: WebViewWidget(controller: web),
    );
  }
}
