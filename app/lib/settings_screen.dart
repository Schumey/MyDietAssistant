import 'package:flutter/material.dart';

import 'app_state.dart';
import 'l10n.dart';
import 'plates.dart';
import 'update_dialog.dart';
import 'package:package_info_plus/package_info_plus.dart';

class SettingsTab extends StatefulWidget {
  const SettingsTab({super.key, required this.app});

  final AppState app;

  @override
  State<SettingsTab> createState() => _SettingsTabState();
}

class _SettingsTabState extends State<SettingsTab> {
  String? _error;

  /// Stored fraction -> the nearest offered choice ('' = default 1.0).
  static String _hit(String v) {
    final f = double.tryParse(v) ?? 1.0;
    return f >= 0.9 ? '1.0' : (f >= 0.6 ? '0.75' : '0.5');
  }

  Future<void> _phase(String value) async {
    setState(() => _error = null);
    try {
      await widget.app.setPhase(value);
    } catch (e) {
      if (mounted) setState(() => _error = tr('sync_failed', ['$e']));
    }
  }

  Future<void> _setting(String key, String value) async {
    setState(() => _error = null);
    try {
      await widget.app.setSetting(key, value);
    } catch (e) {
      if (mounted) setState(() => _error = tr('sync_failed', ['$e']));
    }
  }

  Future<void> _editPlates() async {
    final bar = TextEditingController(text: L10n.kg(widget.app.plateBar));
    final set = TextEditingController(text: widget.app.plateSet.map(L10n.kg).join(' '));
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(tr('plates_title')),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: bar, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: InputDecoration(labelText: tr('plates_bar'))),
          TextField(controller: set, decoration: InputDecoration(labelText: tr('plates_set'), helperText: tr('plates_help'))),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: Text(tr('cancel'))),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: Text(tr('save'))),
        ],
      ),
    );
    if (ok != true) return;
    final b = double.tryParse(bar.text.trim().replaceAll(',', '.'));
    final p = parsePlates(set.text);
    if (b == null || b < 0 || b > 50 || p == null) {
      setState(() => _error = tr('plates_invalid'));
      return;
    }
    setState(() => _error = null);
    widget.app.setPlates(b, p);
  }

  Future<void> _logout() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        content: Text(tr('logout_confirm')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: Text(tr('cancel'))),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: Text(tr('logout'))),
        ],
      ),
    );
    if (ok == true) await widget.app.logout();
  }

  @override
  Widget build(BuildContext context) {
    final app = widget.app;
    final theme = Theme.of(context);
    final last = app.lastSync;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(tr('server'), style: theme.textTheme.titleSmall),
        const SizedBox(height: 4),
        Text(app.address ?? ''),
        const SizedBox(height: 4),
        Text(
          app.syncError != null
              ? tr('sync_failed', [app.syncError])
              : last != null
                  ? '${tr('sync_done')}: ${L10n.dayLabel(last)} ${L10n.time(last)}'
                  : '',
          style: theme.textTheme.bodySmall?.copyWith(color: app.syncError != null ? theme.colorScheme.error : null),
        ),
        if (app.pending > 0) Text(tr('sync_pending', [app.pending]), style: theme.textTheme.bodySmall),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: app.syncing ? null : app.syncNow,
          icon: const Icon(Icons.sync),
          label: Text(app.syncing ? tr('syncing') : tr('sync_now')),
        ),
        const SizedBox(height: 32),
        Text(tr('phase'), style: theme.textTheme.titleSmall),
        const SizedBox(height: 8),
        SegmentedButton<String>(
          showSelectedIcon: false,
          segments: [
            ButtonSegment(value: '', label: Text(tr('phase_auto'))),
            ButtonSegment(value: 'bulk', label: Text(tr('phase_bulk'))),
            ButtonSegment(value: 'maintain', label: Text(tr('phase_maintain'))),
            ButtonSegment(value: 'cut', label: Text(tr('phase_cut'))),
          ],
          selected: {app.phase},
          onSelectionChanged: (s) => _phase(s.first),
        ),
        const SizedBox(height: 4),
        Text(tr('phase_help'), style: theme.textTheme.bodySmall),
        const SizedBox(height: 24),
        Text(tr('progression'), style: theme.textTheme.titleSmall),
        const SizedBox(height: 8),
        Text(tr('hit_rule'), style: theme.textTheme.bodyMedium),
        const SizedBox(height: 4),
        SegmentedButton<String>(
          showSelectedIcon: false,
          segments: [
            ButtonSegment(value: '1.0', label: Text(tr('hit_all'))),
            ButtonSegment(value: '0.75', label: Text(tr('hit_most'))),
            ButtonSegment(value: '0.5', label: Text(tr('hit_half'))),
          ],
          selected: {_hit(app.settings['hit_fraction'] ?? '')},
          onSelectionChanged: (s) => _setting('hit_fraction', s.first),
        ),
        const SizedBox(height: 4),
        Text(tr('hit_help'), style: theme.textTheme.bodySmall),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(tr('drop_set_first')),
          subtitle: Text(tr('drop_set_first_help')),
          value: app.settings['cut_drop_set_first'] == '1',
          onChanged: (v) => _setting('cut_drop_set_first', v ? '1' : '0'),
        ),
        const SizedBox(height: 24),
        Text(tr('plates_title'), style: theme.textTheme.titleSmall),
        ListTile(
          contentPadding: EdgeInsets.zero,
          title: Text('${tr('plates_bar')}: ${L10n.kg(app.plateBar)}'),
          subtitle: Text('${tr('plates_set')}: ${app.plateSet.map(L10n.kg).join(' ')}'),
          trailing: const Icon(Icons.edit),
          onTap: _editPlates,
        ),
        if (_error != null) Text(_error!, style: TextStyle(color: theme.colorScheme.error)),
        if (app.updater != null) ...[
          const SizedBox(height: 24),
          Text(tr('app_section'), style: theme.textTheme.titleSmall),
          FutureBuilder<PackageInfo>(
            future: PackageInfo.fromPlatform(),
            builder: (context, snap) => ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(tr('check_updates')),
              subtitle: Text(tr('app_version', [snap.data?.version ?? ''])),
              trailing: const Icon(Icons.system_update),
              onTap: () => showUpdateDialog(context, app.updater!),
            ),
          ),
        ],
        const SizedBox(height: 32),
        TextButton.icon(onPressed: _logout, icon: const Icon(Icons.logout), label: Text(tr('logout'))),
      ],
    );
  }
}
