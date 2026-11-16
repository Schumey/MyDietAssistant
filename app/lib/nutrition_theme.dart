/// The app's Material colours for the nutrition page in the WebView, so that nutrition and training look the same.
///
/// app.js (`window.hafsAppTheme(vars, dark)`, only inside the app) sets these CSS custom properties on the page; the
/// names are the Home Assistant theme variables the web interface already uses, plus the three `--hafs-nav-*` of its
/// bottom navigation bar (style.css, `html[data-shell="app"]`). The mapping follows the Material 3 widgets of the
/// training part: page = surface, card = surfaceContainerLow, navigation bar = surfaceContainer with a
/// secondaryContainer pill.
library;

import 'package:flutter/material.dart';

import 'nutrition_bridge.dart';

String cssColor(Color c) => '#${(c.toARGB32() & 0xFFFFFF).toRadixString(16).padLeft(6, '0').toUpperCase()}';

Map<String, String> webThemeVars(ColorScheme s) => {
      '--primary-color': cssColor(s.primary),
      '--text-primary-color': cssColor(s.onPrimary),
      '--accent-color': cssColor(s.tertiary),
      '--primary-background-color': cssColor(s.surface),
      '--secondary-background-color': cssColor(s.surfaceContainerHighest),
      '--card-background-color': cssColor(s.surfaceContainerLow),
      '--primary-text-color': cssColor(s.onSurface),
      '--secondary-text-color': cssColor(s.onSurfaceVariant),
      '--disabled-text-color': cssColor(s.outline),
      '--divider-color': cssColor(s.outlineVariant),
      '--error-color': cssColor(s.error),
      '--input-fill-color': cssColor(s.surfaceContainerHighest),
      '--hafs-nav-bg': cssColor(s.surfaceContainer),
      '--hafs-nav-indicator': cssColor(s.secondaryContainer),
      '--hafs-nav-on-indicator': cssColor(s.onSecondaryContainer),
    };

/// JavaScript that hands the colours to the page (does nothing on a page without `hafsAppTheme`).
String jsTheme(ColorScheme s) => jsCall('hafsAppTheme', [webThemeVars(s), s.brightness == Brightness.dark]);
