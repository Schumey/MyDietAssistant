import 'package:flutter/material.dart';

import 'l10n.dart';
import 'repo.dart';

/// Die Tage eines Monats als Raster mit Wochen ab Montag; Tage außerhalb des Monats sind null.
List<List<DateTime?>> monthGrid(DateTime month) {
  final first = DateTime(month.year, month.month);
  final days = DateTime(month.year, month.month + 1, 0).day;
  final cells = <DateTime?>[
    for (var i = 0; i < first.weekday - 1; i++) null,
    for (var d = 1; d <= days; d++) DateTime(month.year, month.month, d),
  ];
  while (cells.length % 7 != 0) {
    cells.add(null);
  }
  return [for (var i = 0; i < cells.length; i += 7) cells.sublist(i, i + 7)];
}

/// Monatskalender des Verlaufs: Tage mit Workouts sind markiert, Antippen öffnet das Workout.
class HistoryCalendar extends StatefulWidget {
  const HistoryCalendar({super.key, required this.items, required this.onOpen, this.initialMonth});

  final List<WorkoutSummary> items;
  final void Function(WorkoutSummary) onOpen;
  final DateTime? initialMonth;

  @override
  State<HistoryCalendar> createState() => _HistoryCalendarState();
}

class _HistoryCalendarState extends State<HistoryCalendar> {
  late DateTime _month = DateTime((widget.initialMonth ?? DateTime.now()).year, (widget.initialMonth ?? DateTime.now()).month);

  Future<void> _tapDay(List<WorkoutSummary> list) async {
    if (list.length == 1) return widget.onOpen(list.single);
    final chosen = await showModalBottomSheet<WorkoutSummary>(
      context: context,
      builder: (context) => SafeArea(
        child: ListView(shrinkWrap: true, children: [
          for (final w in list)
            ListTile(
              title: Text('${L10n.time(w.startedAt)}${w.routineName.isEmpty ? '' : ' · ${w.routineName}'}'),
              subtitle: Text(tr('sets_count', [w.sets])),
              onTap: () => Navigator.pop(context, w),
            ),
        ]),
      ),
    );
    if (chosen != null) widget.onOpen(chosen);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final byDay = <int, List<WorkoutSummary>>{};
    for (final w in widget.items) {
      if (w.startedAt.year == _month.year && w.startedAt.month == _month.month) {
        (byDay[w.startedAt.day] ??= []).add(w);
      }
    }
    final today = DateTime.now();
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(children: [
        Row(children: [
          IconButton(
            tooltip: '<',
            icon: const Icon(Icons.chevron_left),
            onPressed: () => setState(() => _month = DateTime(_month.year, _month.month - 1)),
          ),
          Expanded(child: Text(L10n.monthLabel(_month), textAlign: TextAlign.center, style: theme.textTheme.titleMedium)),
          IconButton(
            tooltip: '>',
            icon: const Icon(Icons.chevron_right),
            onPressed: () => setState(() => _month = DateTime(_month.year, _month.month + 1)),
          ),
        ]),
        Row(children: [
          for (final d in L10n.weekdayLabels) Expanded(child: Center(child: Text(d, style: theme.textTheme.labelSmall))),
        ]),
        const SizedBox(height: 4),
        for (final week in monthGrid(_month))
          Row(children: [
            for (final day in week)
              Expanded(
                child: AspectRatio(
                  aspectRatio: 1,
                  child: day == null
                      ? const SizedBox.shrink()
                      : _cell(theme, day, byDay[day.day] ?? const [], day.year == today.year && day.month == today.month && day.day == today.day),
                ),
              ),
          ]),
        const SizedBox(height: 8),
        Text(tr('calendar_count', [byDay.values.fold<int>(0, (a, l) => a + l.length)]), style: theme.textTheme.bodySmall),
      ]),
    );
  }

  Widget _cell(ThemeData theme, DateTime day, List<WorkoutSummary> list, bool isToday) {
    final trained = list.isNotEmpty;
    return Padding(
      padding: const EdgeInsets.all(2),
      child: Material(
        color: trained ? theme.colorScheme.primary : Colors.transparent,
        shape: CircleBorder(side: isToday ? BorderSide(color: theme.colorScheme.primary, width: 2) : BorderSide.none),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: trained ? () => _tapDay(list) : null,
          child: Center(
            child: Text('${day.day}', style: TextStyle(color: trained ? theme.colorScheme.onPrimary : null, fontWeight: trained ? FontWeight.bold : null)),
          ),
        ),
      ),
    );
  }
}
