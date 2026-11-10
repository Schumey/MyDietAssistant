import 'package:flutter/material.dart';

import 'l10n.dart';
import 'muscles.dart';
import 'repo.dart';
import 'repo_edit.dart';

/// Eigene Übung anlegen. Liefert die neue [ExerciseInfo] (oder nichts beim Abbrechen).
class ExerciseForm extends StatefulWidget {
  const ExerciseForm({super.key, required this.repo, this.initialName = ''});

  final Repo repo;
  final String initialName;

  @override
  State<ExerciseForm> createState() => _ExerciseFormState();
}

class _ExerciseFormState extends State<ExerciseForm> {
  late final _name = TextEditingController(text: widget.initialName);
  String _kind = 'strength';
  final Set<String> _muscles = {};
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  void _save() {
    final name = _name.text.trim();
    if (name.isEmpty) return;
    if (widget.repo.exerciseNameTaken(name)) {
      setState(() => _error = tr('exercise_name_taken'));
      return;
    }
    Navigator.of(context).pop(widget.repo.createExercise(name: name, kind: _kind, primary: _muscles.toList()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(tr('exercise_new')), actions: [TextButton(onPressed: _save, child: Text(tr('save')))]),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _name,
            autofocus: true,
            textCapitalization: TextCapitalization.sentences,
            decoration: InputDecoration(labelText: tr('exercise_name'), errorText: _error, border: const OutlineInputBorder()),
            onChanged: (_) => setState(() => _error = null),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            initialValue: _kind,
            decoration: InputDecoration(labelText: tr('exercise_kind'), border: const OutlineInputBorder()),
            items: [for (final k in exerciseKinds) DropdownMenuItem(value: k, child: Text(tr('kind_$k')))],
            onChanged: (v) => setState(() => _kind = v ?? 'strength'),
          ),
          const SizedBox(height: 16),
          Text(tr('exercise_muscles'), style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: 8),
          Wrap(spacing: 8, runSpacing: 4, children: [
            for (final m in muscleGroups.keys)
              FilterChip(
                label: Text(muscleLabel(m)),
                selected: _muscles.contains(m),
                onSelected: (v) => setState(() => v ? _muscles.add(m) : _muscles.remove(m)),
              ),
          ]),
        ],
      ),
    );
  }
}
