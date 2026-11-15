import 'package:flutter/material.dart';

/// Einfaches Säulendiagramm (Beschriftung unten, Wert über der Säule).
class BarChart extends StatelessWidget {
  const BarChart({super.key, required this.bars, this.height = 120, this.highlightLast = true});

  final List<(String, num)> bars;
  final double height;
  final bool highlightLast;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SizedBox(
      height: height,
      child: CustomPaint(
        size: Size.infinite,
        painter: _BarPainter(bars, theme.colorScheme.primary, theme.colorScheme.primary.withValues(alpha: 0.45), theme.textTheme.labelSmall!.color ?? Colors.grey, highlightLast),
      ),
    );
  }
}

class _BarPainter extends CustomPainter {
  _BarPainter(this.bars, this.color, this.softColor, this.textColor, this.highlightLast);

  final List<(String, num)> bars;
  final Color color;
  final Color softColor;
  final Color textColor;
  final bool highlightLast;

  @override
  void paint(Canvas canvas, Size size) {
    if (bars.isEmpty) return;
    final maxValue = bars.map((b) => b.$2).fold<num>(1, (a, b) => a > b ? a : b).toDouble();
    const labelH = 16.0, valueH = 14.0;
    final plotH = size.height - labelH - valueH;
    final slot = size.width / bars.length;
    final barW = slot * 0.6;
    for (var i = 0; i < bars.length; i++) {
      final h = plotH * bars[i].$2 / maxValue;
      final x = i * slot + (slot - barW) / 2;
      final isLast = highlightLast && i == bars.length - 1;
      final rect = RRect.fromRectAndRadius(Rect.fromLTWH(x, valueH + plotH - h, barW, h), const Radius.circular(3));
      canvas.drawRRect(rect, Paint()..color = isLast ? color : softColor);
      _text(canvas, bars[i].$2 == 0 ? '' : _fmt(bars[i].$2), Offset(i * slot + slot / 2, valueH + plotH - h - 12), slot);
      if (bars.length <= 14 || i % 2 == 0 || i == bars.length - 1) _text(canvas, bars[i].$1, Offset(i * slot + slot / 2, size.height - labelH + 2), slot);
    }
  }

  String _fmt(num v) => v == v.roundToDouble() ? v.toStringAsFixed(0) : v.toStringAsFixed(1);

  void _text(Canvas canvas, String text, Offset centerTop, double width) {
    final tp = TextPainter(
      text: TextSpan(text: text, style: TextStyle(fontSize: 10, color: textColor)),
      textDirection: TextDirection.ltr,
      maxLines: 1,
    )..layout(maxWidth: width * 1.6);
    tp.paint(canvas, Offset(centerTop.dx - tp.width / 2, centerTop.dy));
  }

  @override
  bool shouldRepaint(_BarPainter old) => old.bars != bars || old.color != color;
}

/// Liniendiagramm über der Zeit. Punkte sind (Zeitpunkt, Wert), die Achsen passen sich an.
class LineChart extends StatelessWidget {
  const LineChart({super.key, required this.points, this.height = 180, this.unit = ''});

  final List<(DateTime, double)> points;
  final double height;
  final String unit;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SizedBox(
      height: height,
      child: CustomPaint(
        size: Size.infinite,
        painter: _LinePainter(points, theme.colorScheme.primary, theme.colorScheme.outlineVariant, theme.textTheme.labelSmall!.color ?? Colors.grey, unit),
      ),
    );
  }
}

class _LinePainter extends CustomPainter {
  _LinePainter(this.points, this.color, this.gridColor, this.textColor, this.unit);

  final List<(DateTime, double)> points;
  final Color color;
  final Color gridColor;
  final Color textColor;
  final String unit;

  @override
  void paint(Canvas canvas, Size size) {
    if (points.isEmpty) return;
    const left = 40.0, bottom = 18.0, top = 8.0, right = 8.0;
    final plot = Rect.fromLTWH(left, top, size.width - left - right, size.height - top - bottom);
    var lo = points.map((p) => p.$2).reduce((a, b) => a < b ? a : b);
    var hi = points.map((p) => p.$2).reduce((a, b) => a > b ? a : b);
    if (hi - lo < 1e-9) {
      lo -= 1;
      hi += 1;
    }
    final pad = (hi - lo) * 0.1;
    lo -= pad;
    hi += pad;
    final t0 = points.first.$1.millisecondsSinceEpoch.toDouble();
    final span = (points.last.$1.millisecondsSinceEpoch - points.first.$1.millisecondsSinceEpoch).toDouble();
    Offset at(DateTime t, double v) => Offset(
          plot.left + (span == 0 ? plot.width / 2 : (t.millisecondsSinceEpoch - t0) / span * plot.width),
          plot.bottom - (v - lo) / (hi - lo) * plot.height,
        );
    final grid = Paint()
      ..color = gridColor
      ..strokeWidth = 1;
    for (var i = 0; i <= 3; i++) {
      final v = lo + (hi - lo) * i / 3;
      final y = plot.bottom - plot.height * i / 3;
      canvas.drawLine(Offset(plot.left, y), Offset(plot.right, y), grid);
      _text(canvas, v.toStringAsFixed(v.abs() >= 100 ? 0 : 1), Offset(0, y - 6), left - 4, TextAlign.right);
    }
    _text(canvas, _date(points.first.$1), Offset(plot.left, size.height - bottom + 3), 80, TextAlign.left);
    _text(canvas, _date(points.last.$1), Offset(plot.right - 80, size.height - bottom + 3), 80, TextAlign.right);
    final path = Path();
    for (var i = 0; i < points.length; i++) {
      final o = at(points[i].$1, points[i].$2);
      i == 0 ? path.moveTo(o.dx, o.dy) : path.lineTo(o.dx, o.dy);
    }
    canvas.drawPath(
        path,
        Paint()
          ..color = color
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2
          ..strokeJoin = StrokeJoin.round);
    final dot = Paint()..color = color;
    if (points.length <= 60) {
      for (final p in points) {
        canvas.drawCircle(at(p.$1, p.$2), 3, dot);
      }
    }
    canvas.drawCircle(at(points.last.$1, points.last.$2), 5, dot);
  }

  String _date(DateTime d) => '${d.day}.${d.month}.${(d.year % 100).toString().padLeft(2, '0')}';

  void _text(Canvas canvas, String text, Offset o, double width, TextAlign align) {
    final tp = TextPainter(
      text: TextSpan(text: text, style: TextStyle(fontSize: 10, color: textColor)),
      textDirection: TextDirection.ltr,
      textAlign: align,
    )..layout(minWidth: width, maxWidth: width);
    tp.paint(canvas, o);
  }

  @override
  bool shouldRepaint(_LinePainter old) => old.points != points || old.color != color;
}
