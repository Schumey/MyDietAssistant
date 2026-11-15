import 'package:flutter/material.dart';

import 'app_state.dart';
import 'l10n.dart';
import 'muscles.dart';

/// Rückblick aus dem Server: stagnierende Übungen und vernachlässigte Muskelgruppen. Erscheint nur mit Verbindung und
/// wenn es etwas zu berichten gibt; die KI-Zusammenfassung wird nur auf Knopfdruck geholt.
class ReviewCard extends StatefulWidget {
  const ReviewCard({super.key, required this.app});

  final AppState app;

  @override
  State<ReviewCard> createState() => _ReviewCardState();
}

class _ReviewCardState extends State<ReviewCard> {
  Map<String, dynamic>? _data;
  String? _text;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!widget.app.hasCredentials) return;
    try {
      final r = await widget.app.review();
      if (mounted) setState(() => _data = r);
    } catch (_) {
      // offline or an older server: no card
    }
  }

  Future<void> _ai() async {
    setState(() => _busy = true);
    try {
      final r = await widget.app.review(ai: true);
      if (mounted) setState(() => _text = r['text'] as String?);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final d = _data;
    if (d == null) return const SizedBox.shrink();
    final theme = Theme.of(context);
    final lines = <String>[
      for (final x in (d['stagnating'] as List? ?? const []))
        tr('review_stag', [x['name'], x['sessions'], x['weeks'], L10n.kg((x['best'] as num).toDouble())]),
      for (final x in (d['neglected'] as List? ?? const []))
        tr('review_muscle', [muscleLabel(x['muscle'] as String), L10n.kg((x['recent'] as num).toDouble()), L10n.kg((x['earlier'] as num).toDouble())]),
    ];
    if (lines.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(tr('review_title'), style: theme.textTheme.titleMedium),
            const SizedBox(height: 4),
            for (final l in lines) Padding(padding: const EdgeInsets.symmetric(vertical: 2), child: Text(l, style: theme.textTheme.bodyMedium)),
            const SizedBox(height: 8),
            OutlinedButton(key: const Key('review-ai'), onPressed: _busy ? null : _ai, child: Text(tr('review_ai'))),
            Text(tr('review_ai_hint'), style: theme.textTheme.bodySmall),
            if (_text != null && _text!.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 8), child: Text(_text!, style: theme.textTheme.bodyMedium)),
          ]),
        ),
      ),
    );
  }
}
