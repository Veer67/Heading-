import React, { useRef, useState, useEffect } from 'react';

const COL = {
  grid: 'rgba(59,130,246,0.10)',
  axis: 'hsl(214 25% 52%)',
  up: '#10b981',
  down: '#ef4444',
  sma20: '#10b981',
  sma50: '#f59e0b',
  ema: '#8b5cf6',
};

const PAD = { left: 58, right: 14, top: 12, bottom: 26 };

const fmtPrice = (v) =>
  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(2)}`;

export default function CandlestickChart({ data, indicators }) {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hoverIdx, setHoverIdx] = useState(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!data || data.length === 0) return null;

  const { width, height } = size;
  const ready = width > 0 && height > 0;

  const n = data.length;
  const highs = data.map(d => d.high).filter(v => v != null);
  const lows = data.map(d => d.low).filter(v => v != null);
  const yMinRaw = Math.min(...lows);
  const yMaxRaw = Math.max(...highs);
  const pad = ((yMaxRaw - yMinRaw) * 0.08) || 1;
  const yMin = yMinRaw - pad;
  const yMax = yMaxRaw + pad;

  const plotW = Math.max(width - PAD.left - PAD.right, 1);
  const plotH = Math.max(height - PAD.top - PAD.bottom, 1);
  const slot = plotW / n;
  const candleW = Math.max(slot * 0.68, 2);

  const xCenter = (i) => PAD.left + (i + 0.5) * slot;
  const yScale = (p) => PAD.top + plotH * (1 - (p - yMin) / (yMax - yMin || 1));

  // Y grid lines + labels (5)
  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (i / 4) * (yMax - yMin));

  // X labels (~6)
  const xLabelCount = Math.min(6, n);
  const xLabelStep = Math.max(1, Math.floor(n / xLabelCount));
  const xLabels = [];
  for (let i = 0; i < n; i += xLabelStep) xLabels.push(i);

  const handleMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - PAD.left;
    const idx = Math.floor(x / slot);
    if (idx >= 0 && idx < n) setHoverIdx(idx);
    else setHoverIdx(null);
  };

  const active = hoverIdx != null ? data[hoverIdx] : null;

  const indicatorLine = (key) => {
    if (!indicators?.[key]) return null;
    const pts = [];
    data.forEach((d, i) => {
      if (d[key] != null && isFinite(d[key])) pts.push(`${xCenter(i)},${yScale(d[key])}`);
    });
    if (pts.length < 2) return null;
    return <polyline points={pts.join(' ')} fill="none" stroke={COL[key]} strokeWidth={1.8} />;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {ready && (
        <svg
          width={width}
          height={height}
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          {/* Y grid + labels */}
          {yTicks.map((v, i) => {
            const y = yScale(v);
            return (
              <g key={`y${i}`}>
                <line x1={PAD.left} y1={y} x2={width - PAD.right} y2={y} stroke={COL.grid} strokeWidth={1} />
                <text x={PAD.left - 6} y={y + 3} textAnchor="end" fontSize={10} fill={COL.axis} fontFamily="monospace">
                  {fmtPrice(v)}
                </text>
              </g>
            );
          })}

          {/* X labels */}
          {xLabels.map((i) => (
            <text key={`x${i}`} x={xCenter(i)} y={height - 8} textAnchor="middle" fontSize={10} fill={COL.axis} fontFamily="monospace">
              {data[i].time ?? ''}
            </text>
          ))}

          {/* Indicator lines */}
          {indicatorLine('sma20')}
          {indicatorLine('sma50')}
          {indicatorLine('ema')}

          {/* Candles */}
          {data.map((d, i) => {
            if (d.open == null || d.close == null || d.high == null || d.low == null) return null;
            const up = d.close >= d.open;
            const color = up ? COL.up : COL.down;
            const xc = xCenter(i);
            const yHigh = yScale(d.high);
            const yLow = yScale(d.low);
            const yOpen = yScale(d.open);
            const yClose = yScale(d.close);
            const bodyTop = Math.min(yOpen, yClose);
            const bodyH = Math.max(Math.abs(yClose - yOpen), 1);
            return (
              <g key={i}>
                <line x1={xc} y1={yHigh} x2={xc} y2={yLow} stroke={color} strokeWidth={1.2} />
                <rect
                  x={xc - candleW / 2}
                  y={bodyTop}
                  width={candleW}
                  height={bodyH}
                  fill={color}
                  stroke={color}
                  strokeWidth={0.5}
                  opacity={hoverIdx === i ? 1 : 0.92}
                />
              </g>
            );
          })}

          {/* Hover crosshair */}
          {active && hoverIdx != null && (
            <line
              x1={xCenter(hoverIdx)}
              y1={PAD.top}
              x2={xCenter(hoverIdx)}
              y2={PAD.top + plotH}
              stroke="hsl(var(--primary))"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.5}
            />
          )}
        </svg>
      )}

      {/* Tooltip */}
      {active && (
        <div
          className="absolute pointer-events-none bg-card/95 backdrop-blur-sm border border-border p-3 rounded-lg shadow-xl text-xs z-10"
          style={{
            left: Math.min(Math.max(xCenter(hoverIdx) + 10, 8), width - 150),
            top: 8,
            minWidth: 130,
          }}
        >
          <p className="text-muted-foreground mb-1 font-mono">{active.time}</p>
          <div className="space-y-0.5 font-mono">
            <p><span className="text-muted-foreground">O: </span><span className="text-foreground">{active.open?.toFixed(2)}</span></p>
            <p><span className="text-muted-foreground">H: </span><span className="text-emerald-400">{active.high?.toFixed(2)}</span></p>
            <p><span className="text-muted-foreground">L: </span><span className="text-red-400">{active.low?.toFixed(2)}</span></p>
            <p><span className="text-muted-foreground">C: </span><span className="text-foreground">{active.close?.toFixed(2)}</span></p>
            {active.volume != null && (
              <p><span className="text-muted-foreground">V: </span><span className="text-foreground">{(active.volume / 1e6).toFixed(2)}M</span></p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}