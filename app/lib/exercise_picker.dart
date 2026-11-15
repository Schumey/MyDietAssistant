import 'package:flutter/material.dart';

import 'exercise_form.dart';
import 'l10n.dart';
import 'repo.dart';

/// Übung wählen: Suchfeld, zuletzt benutzte zuerst. Liefert die gewählte [ExerciseInfo].
class ExercisePicker extends StatefulWidget {
  const ExercisePicker({super.key, required this.repo});

  final Repo repo;

  @override
  State<ExercisePicker> createState() => _ExercisePickerState();
}

class _ExercisePickerState extends State<ExercisePicker> {
  String _query = '';

  Future<void> _create() async {
    final e = await Navigator.of(context).push<ExerciseInfo>(
        MaterialPageRoute(builder: (_) => ExerciseForm(repo: widget.repo, initialName: _query.trim())));
    if (e != null && mounted) Navigator.of(context).pop(e);
  }

  @override
  Widget build(BuildContext context) {
    final items = widget.repo.exercises(query: _query.trim());
    final recent = items.where((e) => e.lastUsed != null).length;
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          autofocus: true,
          decoration: InputDecoration(hintText: tr('search_exercise'), border: InputBorder.none),
          onChanged: (v) => setState(() => _query = v),
        ),
        actions: [IconButton(tooltip: tr('exercise_new'), icon: const Icon(Icons.add), onPressed: _create)],
      ),
      body: items.isEmpty
          ? Center(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Text(tr('no_exercises')),
                const SizedBox(height: 12),
                FilledButton.icon(onPressed: _create, icon: const Icon(Icons.add), label: Text(tr('exercise_new'))),
              ]),
            )
          : ListView.builder(
              itemCount: items.length,
              itemBuilder: (context, i) {
                final e = items[i];
                // Überschriften nur ohne Suchbegriff: „Zuletzt benutzt“, dann „Alle Übungen“.
                final browsing = _query.trim().isEmpty;
                final title = (i == 0 && recent > 0) ? tr('recent') : tr('all_exercises');
                final header = browsing && (i == 0 || (recent > 0 && i == recent));
                return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  if (header)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                      child: Text(title, style: Theme.of(context).textTheme.labelLarge),
                    ),
                  ListTile(title: Text(e.name), onTap: () => Navigator.of(context).pop(e)),
                ]);
              },
            ),
    );
  }
}
