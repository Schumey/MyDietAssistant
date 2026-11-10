import 'package:flutter/material.dart';

import 'app_state.dart';
import 'l10n.dart';
import 'repo_gym.dart';
import 'steps.dart';

const equipmentTypes = ['machine', 'cable', 'barbell', 'dumbbell', 'bodyweight', 'kettlebell', 'band', 'cardio', 'other'];

String typeLabel(String type) => type.isEmpty ? '' : tr('type_$type');

Future<String?> askText(BuildContext context, String title, {String initial = ''}) {
  final c = TextEditingController(text: initial);
  return showDialog<String>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(title),
      content: TextField(controller: c, autofocus: true, textCapitalization: TextCapitalization.sentences, onSubmitted: (v) => Navigator.pop(context, v)),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: Text(tr('cancel'))),
        FilledButton(onPressed: () => Navigator.pop(context, c.text), child: Text(tr('save'))),
      ],
    ),
  );
}

Future<bool> confirm(BuildContext context, String text, String action) async =>
    await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        content: Text(text),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: Text(tr('cancel'))),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: Text(action)),
        ],
      ),
    ) ??
    false;

/// Studios verwalten.
class GymsScreen extends StatefulWidget {
  const GymsScreen({super.key, required this.app});

  final AppState app;

  @override
  State<GymsScreen> createState() => _GymsScreenState();
}

class _GymsScreenState extends State<GymsScreen> {
  Future<void> _add() async {
    final name = await askText(context, tr('gym_name'));
    if (name == null || name.trim().isEmpty) return;
    widget.app.repo!.addGym(name);
    widget.app.changed();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final gyms = widget.app.repo!.gyms();
    return Scaffold(
      appBar: AppBar(title: Text(tr('gyms_title'))),
      floatingActionButton: FloatingActionButton.extended(onPressed: _add, icon: const Icon(Icons.add), label: Text(tr('gym_add'))),
      body: gyms.isEmpty
          ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(tr('gyms_empty'), textAlign: TextAlign.center)))
          : ListView(
              children: [
                for (final g in gyms)
                  ListTile(
                    leading: const Icon(Icons.store),
                    title: Text(g.name),
                    subtitle: Text(g.zone.isEmpty ? tr('equipment_n', [g.equipmentCount]) : '${tr('equipment_n', [g.equipmentCount])} · ${g.zone}'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () async {
                      await Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => GymDetailScreen(app: widget.app, gymId: g.id)));
                      if (mounted) setState(() {});
                    },
                  ),
              ],
            ),
    );
  }
}

/// Die Geräte eines Studios.
class GymDetailScreen extends StatefulWidget {
  const GymDetailScreen({super.key, required this.app, required this.gymId});

  final AppState app;
  final String gymId;

  @override
  State<GymDetailScreen> createState() => _GymDetailScreenState();
}

class _GymDetailScreenState extends State<GymDetailScreen> {
  Future<void> _edit([String? equipmentId]) async {
    await Navigator.of(context).push(MaterialPageRoute<void>(
        builder: (_) => EquipmentScreen(app: widget.app, gymId: widget.gymId, equipmentId: equipmentId)));
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final repo = widget.app.repo!;
    final gym = repo.gyms().where((g) => g.id == widget.gymId).firstOrNull;
    if (gym == null) return const Scaffold(body: SizedBox.shrink());
    final items = repo.equipment(widget.gymId);
    return Scaffold(
      appBar: AppBar(
        title: Text(gym.name),
        actions: [
          IconButton(
            tooltip: tr('gym_zone'),
            icon: Icon(gym.zone.isEmpty ? Icons.location_off_outlined : Icons.location_on),
            onPressed: () async {
              final zone = await askText(context, tr('gym_zone_ask'), initial: gym.zone);
              if (zone != null) {
                repo.setGymZone(gym.id, zone);
                widget.app.changed();
                setState(() {});
              }
            },
          ),
          IconButton(
            tooltip: tr('gym_rename'),
            icon: const Icon(Icons.edit),
            onPressed: () async {
              final name = await askText(context, tr('gym_name'), initial: gym.name);
              if (name != null && name.trim().isNotEmpty) {
                repo.renameGym(gym.id, name);
                widget.app.changed();
                setState(() {});
              }
            },
          ),
          IconButton(
            tooltip: tr('gym_delete'),
            icon: const Icon(Icons.delete_outline),
            onPressed: () async {
              if (await confirm(context, tr('gym_delete_confirm', [gym.name]), tr('delete'))) {
                repo.deleteGym(gym.id);
                widget.app.changed();
                if (context.mounted) Navigator.of(context).pop();
              }
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(onPressed: () => _edit(), icon: const Icon(Icons.add), label: Text(tr('equipment_add'))),
      body: ListView(
        children: [
          for (final e in items)
            ListTile(
              leading: const Icon(Icons.fitness_center),
              title: Text(e.name),
              subtitle: Text([
                typeLabel(e.type),
                stepsSummary(e.steps, L10n.kg, rangeText: tr('equipment_steps_range'), listText: tr('equipment_steps_list')) ?? '',
                if (e.outOfOrder) tr('equipment_out_of_order'),
              ].where((s) => s.isNotEmpty).join(' · ')),
              onTap: () => _edit(e.id),
            ),
        ],
      ),
    );
  }
}

/// Gerät anlegen oder bearbeiten: Name, Art, Gewichtsstufen, Einstellungen, passende Übungen.
class EquipmentScreen extends StatefulWidget {
  const EquipmentScreen({super.key, required this.app, required this.gymId, this.equipmentId});

  final AppState app;
  final String gymId;
  final String? equipmentId;

  @override
  State<EquipmentScreen> createState() => _EquipmentScreenState();
}

class _EquipmentScreenState extends State<EquipmentScreen> {
  final _name = TextEditingController();
  final _steps = TextEditingController();
  final _settings = TextEditingController();
  String _type = 'machine';
  bool _outOfOrder = false;
  Set<String> _exercises = {};
  String? _error;

  @override
  void initState() {
    super.initState();
    final repo = widget.app.repo!;
    final id = widget.equipmentId;
    if (id != null) {
      final e = repo.equipmentById(id);
      if (e != null) {
        _name.text = e.name;
        _type = e.type.isEmpty ? 'other' : e.type;
        _settings.text = e.settings;
        _outOfOrder = e.outOfOrder;
        final steps = expandSteps(e.steps);
        if (steps != null) _steps.text = _stepsText(e.steps, steps);
      }
      _exercises = repo.exercisesOf(id);
    }
  }

  /// Rückübersetzung in die Eingabeform: Bereich als „5-100/5“, sonst Liste.
  String _stepsText(String json, List<double> steps) {
    if (steps.length > 2) {
      final diffs = {for (var i = 1; i < steps.length; i++) ((steps[i] - steps[i - 1]) * 10000).round() / 10000};
      if (diffs.length == 1) return '${L10n.kg(steps.first)}-${L10n.kg(steps.last)}/${L10n.kg(diffs.first)}';
    }
    return steps.map(L10n.kg).join(' ');
  }

  @override
  void dispose() {
    _name.dispose();
    _steps.dispose();
    _settings.dispose();
    super.dispose();
  }

  Future<void> _pickExercises() async {
    final all = widget.app.repo!.exercises();
    final picked = {..._exercises};
    final result = await showDialog<Set<String>>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setLocal) => AlertDialog(
          title: Text(tr('equipment_exercises')),
          content: SizedBox(
            width: double.maxFinite,
            child: ListView(shrinkWrap: true, children: [
              for (final e in all)
                CheckboxListTile(
                  dense: true,
                  title: Text(e.name),
                  value: picked.contains(e.id),
                  onChanged: (v) => setLocal(() => v == true ? picked.add(e.id) : picked.remove(e.id)),
                ),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: Text(tr('cancel'))),
            FilledButton(onPressed: () => Navigator.pop(context, picked), child: const Text('OK')),
          ],
        ),
      ),
    );
    if (result != null) setState(() => _exercises = result);
  }

  void _save() {
    final steps = parseStepsInput(_steps.text);
    if (_name.text.trim().isEmpty) return;
    if (steps == null) {
      setState(() => _error = tr('equipment_steps_invalid'));
      return;
    }
    final repo = widget.app.repo!;
    final id = repo.saveEquipment(
      id: widget.equipmentId,
      gymId: widget.gymId,
      name: _name.text,
      type: _type,
      steps: steps,
      outOfOrder: _outOfOrder,
      settings: _settings.text.trim(),
    );
    repo.setExercisesOf(id, _exercises);
    widget.app.changed();
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.equipmentId == null ? tr('equipment_add') : tr('equipment_edit')),
        actions: [
          if (widget.equipmentId != null)
            IconButton(
              tooltip: tr('equipment_delete'),
              icon: const Icon(Icons.delete_outline),
              onPressed: () async {
                if (await confirm(context, tr('equipment_delete'), tr('delete'))) {
                  widget.app.repo!.deleteEquipment(widget.equipmentId!);
                  widget.app.changed();
                  if (context.mounted) Navigator.of(context).pop();
                }
              },
            ),
          TextButton(onPressed: _save, child: Text(tr('save'))),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(controller: _name, decoration: InputDecoration(labelText: tr('equipment_name'), border: const OutlineInputBorder())),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            initialValue: _type,
            decoration: InputDecoration(labelText: tr('equipment_type'), border: const OutlineInputBorder()),
            items: [for (final t in equipmentTypes) DropdownMenuItem(value: t, child: Text(typeLabel(t)))],
            onChanged: (v) => setState(() => _type = v ?? 'other'),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _steps,
            keyboardType: TextInputType.text,
            decoration: InputDecoration(
              labelText: tr('equipment_steps'),
              helperText: tr('equipment_steps_help'),
              helperMaxLines: 2,
              errorText: _error,
              border: const OutlineInputBorder(),
            ),
            onChanged: (_) => setState(() => _error = null),
          ),
          const SizedBox(height: 16),
          TextField(controller: _settings, decoration: InputDecoration(labelText: tr('equipment_settings'), border: const OutlineInputBorder())),
          SwitchListTile(contentPadding: EdgeInsets.zero, title: Text(tr('equipment_out_of_order')), value: _outOfOrder, onChanged: (v) => setState(() => _outOfOrder = v)),
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(tr('equipment_exercises')),
            subtitle: Text(tr('equipment_exercises_n', [_exercises.length])),
            trailing: const Icon(Icons.chevron_right),
            onTap: _pickExercises,
          ),
        ],
      ),
    );
  }
}
