import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hafs/main.dart';
import 'package:hafs/nutrition_theme.dart';

void main() {
  test('the page gets the colours of the app theme, light and dark', () {
    for (final b in Brightness.values) {
      final s = hafsTheme(b).colorScheme;
      final vars = webThemeVars(s);
      expect(vars['--primary-color'], cssColor(s.primary));
      expect(vars['--card-background-color'], cssColor(s.surfaceContainerLow));
      expect(vars['--hafs-nav-bg'], cssColor(s.surfaceContainer));
      expect(vars.values.every((v) => RegExp(r'^#[0-9A-F]{6}$').hasMatch(v)), isTrue);
      final js = jsTheme(s);
      expect(js, startsWith('window.hafsAppTheme && window.hafsAppTheme('));
      expect(js, endsWith(', ${b == Brightness.dark})'));
      final args = js.substring(js.indexOf('hafsAppTheme(', 20) + 'hafsAppTheme('.length, js.lastIndexOf(','));
      expect(jsonDecode(args), vars);
    }
  });

  test('css colours drop the alpha channel', () {
    expect(cssColor(const Color(0x8003A9F4)), '#03A9F4');
  });
}
