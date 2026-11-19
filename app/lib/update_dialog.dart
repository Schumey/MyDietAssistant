import 'package:flutter/material.dart';

import 'l10n.dart';
import 'updater.dart';
import 'wakelock.dart';

/// "Check for updates": looks for a newer package (or takes the already found [offer]), downloads and installs it.
Future<void> showUpdateDialog(BuildContext context, Updater updater, {AppOffer? offer}) => showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (_) => _UpdateDialog(updater: updater, found: offer),
    );

enum _Step { checking, upToDate, available, downloading, installing, failed }

class _UpdateDialog extends StatefulWidget {
  const _UpdateDialog({required this.updater, this.found});

  final Updater updater;
  final AppOffer? found;

  @override
  State<_UpdateDialog> createState() => _UpdateDialogState();
}

class _UpdateDialogState extends State<_UpdateDialog> {
  _Step _step = _Step.checking;
  AppOffer? _offer;
  String _current = '';
  double? _progress;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _check();
  }

  Future<void> _check() async {
    setState(() => _step = _Step.checking);
    try {
      _current = await widget.updater.currentVersion();
      final offer = widget.found ?? await widget.updater.check();
      if (!mounted) return;
      setState(() {
        _offer = offer;
        _step = offer == null ? _Step.upToDate : _Step.available;
      });
    } catch (e) {
      _fail(e);
    }
  }

  Future<void> _install() async {
    setState(() {
      _step = _Step.downloading;
      _progress = null;
    });
    keepScreenOn(true); // a locked screen throttles the download; the updater resumes if it breaks anyway
    try {
      final file = await widget.updater.download(_offer!, (p) {
        if (mounted) setState(() => _progress = p);
      });
      keepScreenOn(false);
      if (!mounted) return;
      setState(() => _step = _Step.installing);
      await widget.updater.install(file);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      keepScreenOn(false);
      _fail(e);
    }
  }

  void _fail(Object e) {
    if (!mounted) return;
    setState(() {
      _error = '$e';
      _step = _Step.failed;
    });
  }

  @override
  Widget build(BuildContext context) {
    final close = TextButton(onPressed: () => Navigator.pop(context), child: Text(tr('close')));
    final (Widget content, List<Widget> actions) = switch (_step) {
      _Step.checking => (_busy(tr('update_checking'), null), const <Widget>[]),
      _Step.upToDate => (Text(tr('update_none', [_current])), [close]),
      _Step.available => (
          Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(tr('update_available', [_offer!.version, _current])),
            const SizedBox(height: 8),
            Text('${(_offer!.size / 1048576).toStringAsFixed(1)} MB · ${tr('update_hint')}', style: Theme.of(context).textTheme.bodySmall),
          ]),
          [
            TextButton(onPressed: () => Navigator.pop(context), child: Text(tr('update_later'))),
            FilledButton(onPressed: _install, child: Text(tr('update_install'))),
          ]
        ),
      _Step.downloading => (_busy(tr('update_downloading'), _progress), const <Widget>[]),
      _Step.installing => (_busy(tr('update_installing'), null), const <Widget>[]),
      _Step.failed => (
          Text('${tr('update_failed')}\n\n$_error'),
          [close, FilledButton(onPressed: _offer == null ? _check : _install, child: Text(tr('retry')))]
        ),
    };
    return AlertDialog(title: Text(tr('check_updates')), content: content, actions: actions);
  }

  Widget _busy(String text, double? progress) => Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [Text(text), const SizedBox(height: 16), LinearProgressIndicator(value: progress)],
      );
}
