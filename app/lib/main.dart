import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:sqlite3/sqlite3.dart';

import 'app_state.dart';
import 'credentials.dart';
import 'db.dart';
import 'home_screen.dart';
import 'l10n.dart';
import 'login_screen.dart';
import 'rest_android.dart';

Future<LocalDb> _openDatabase() async {
  final schema = Schema.parse(await rootBundle.loadString('assets/schema.json'));
  final dir = await getApplicationSupportDirectory();
  await Directory(dir.path).create(recursive: true);
  return LocalDb.open(sqlite3.open(p.join(dir.path, 'hafs.db')), schema);
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  L10n.lang = L10n.resolve(WidgetsBinding.instance.platformDispatcher.locale.languageCode);
  runApp(HafsApp(app: AppState(SecureCredentialStore(), openDb: _openDatabase, rest: createRestTimer())));
}

/// Blau des Standard-Themes von Home Assistant, wie in der tHAsk-App.
const haBlue = Color(0xFF03A9F4);

ThemeData hafsTheme(Brightness brightness) => ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: haBlue,
        brightness: brightness,
        dynamicSchemeVariant: DynamicSchemeVariant.fidelity,
      ),
    );

class HafsApp extends StatefulWidget {
  const HafsApp({super.key, required this.app});

  final AppState app;

  @override
  State<HafsApp> createState() => _HafsAppState();
}

class _HafsAppState extends State<HafsApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    widget.app.start();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && widget.app.loaded) {
      widget.app.syncNow();
      widget.app.rest.restore();
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HAFS',
      locale: L10n.locale,
      supportedLocales: [for (final lang in L10n.languages) Locale(lang)],
      localizationsDelegates: GlobalMaterialLocalizations.delegates,
      theme: hafsTheme(Brightness.light),
      darkTheme: hafsTheme(Brightness.dark),
      home: ListenableBuilder(
        listenable: widget.app,
        builder: (context, _) {
          if (!widget.app.loaded) return const Scaffold(body: Center(child: CircularProgressIndicator()));
          if (!widget.app.hasCredentials) return LoginScreen(app: widget.app);
          return HomeScreen(app: widget.app);
        },
      ),
    );
  }
}
