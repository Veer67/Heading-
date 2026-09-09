import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Minus, Square, TrendingUp, Trash2, MousePointer } from 'lucide-react';

const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
const FIB_COLORS = ['#00ffff', '#00e5ff', '#00ccff', '#ffff00', '#ff9900', '#ff6600', '#00ffcc'];

const TOOLS = [
  { id: 'select', label: 'Select', icon: MousePointer },
  { id: 'line', label: 'Trend Line', icon: TrendingUp },
  { id: 'zone', label: 'S/R Zone', icon: Square },
  { id: 'fib', label: 'Fibonacci', icon: Minus },
];

const ChartDrawingCanvas = forwardRef(function ChartDrawingCanvas({ imageUrl }, ref) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [tool, setTool] = useState('select');
  const [drawings, setDrawings] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [currentPos, setCurrentPos] = useState(null);

  // Expose export function to parent
  useImperativeHandle(ref, () => ({
    exportAsBlob: () => new Promise(resolve => {
      canvasRef.current?.toBlob(resolve, 'image/png');
    }),
    hasDrawings: () => drawings.length > 0,
  }));

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw saved drawings
    drawings.forEach(d => drawShape(ctx, d, false));

    // Draw current preview
    if (isDrawing && startPos && currentPos && tool !== 'select') {
      drawShape(ctx, { type: tool, x1: startPos.x, y1: startPos.y, x2: currentPos.x, y2: currentPos.y }, true);
    }
  }, [drawings, isDrawing, startPos, currentPos, tool]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        draw();
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  function drawShape(ctx, d, preview) {
    ctx.save();
    ctx.globalAlpha = preview ? 0.8 : 1;

    if (d.type === 'line') {
      ctx.beginPath();
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 6;
      ctx.moveTo(d.x1, d.y1);
      ctx.lineTo(d.x2, d.y2);
      ctx.stroke();
      // Dots at endpoints
      [{ x: d.x1, y: d.y1 }, { x: d.x2, y: d.y2 }].forEach(p => {
        ctx.beginPath();
        ctx.fillStyle = '#00ffff';
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (d.type === 'zone') {
      const yMin = Math.min(d.y1, d.y2);
      const yMax = Math.max(d.y1, d.y2);
      const w = canvasRef.current?.width || 800;
      ctx.fillStyle = 'rgba(255, 165, 0, 0.15)';
      ctx.fillRect(0, yMin, w, yMax - yMin);
      ctx.strokeStyle = 'rgba(255, 165, 0, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 3]);
      ctx.beginPath(); ctx.moveTo(0, yMin); ctx.lineTo(w, yMin); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, yMax); ctx.lineTo(w, yMax); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255, 165, 0, 0.9)';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('S/R ZONE', 8, yMin - 4);
    } else if (d.type === 'fib') {
      const w = canvasRef.current?.width || 800;
      const priceTop = Math.min(d.y1, d.y2);
      const priceBot = Math.max(d.y1, d.y2);
      const range = priceBot - priceTop;
      FIB_LEVELS.forEach((level, i) => {
        const y = priceTop + range * level;
        ctx.strokeStyle = FIB_COLORS[i];
        ctx.lineWidth = 1;
        ctx.globalAlpha = preview ? 0.6 : 0.8;
        ctx.setLineDash([4, 2]);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = FIB_COLORS[i];
        ctx.font = 'bold 10px monospace';
        ctx.globalAlpha = 1;
        ctx.fillText(`${(level * 100).toFixed(1)}%`, w - 52, y - 3);
      });
    }
    ctx.restore();
  }

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }

  function onMouseDown(e) {
    if (tool === 'select') return;
    setIsDrawing(true);
    const pos = getPos(e);
    setStartPos(pos);
    setCurrentPos(pos);
  }

  function onMouseMove(e) {
    if (!isDrawing) return;
    setCurrentPos(getPos(e));
  }

  function onMouseUp(e) {
    if (!isDrawing || !startPos) return;
    const end = getPos(e);
    if (Math.abs(end.x - startPos.x) > 5 || Math.abs(end.y - startPos.y) > 5) {
      setDrawings(prev => [...prev, { type: tool, x1: startPos.x, y1: startPos.y, x2: end.x, y2: end.y }]);
    }
    setIsDrawing(false);
    setStartPos(null);
    setCurrentPos(null);
  }

  if (!imageUrl) return null;

  return (
    <div className="neon-border rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="p-4 border-b border-border/50 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {TOOLS.map(t => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border',
                tool === t.id
                  ? 'bg-primary/20 text-primary border-primary/40 neon-border'
                  : 'text-muted-foreground border-border/40 hover:text-foreground hover:bg-secondary/40'
              )}
            >
              <t.icon className="w-3 h-3" />
              {t.label}
            </button>
          ))}
        </div>
        {drawings.length > 0 && (
          <button
            onClick={() => setDrawings([])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-3 h-3" />
            Clear ({drawings.length})
          </button>
        )}
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair max-h-[400px] object-contain"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{ cursor: tool === 'select' ? 'default' : 'crosshair' }}
        />
        {tool !== 'select' && (
          <div className="absolute top-2 left-2 bg-black/60 text-primary text-[10px] font-mono px-2 py-1 rounded border border-primary/20">
            {tool === 'line' && 'Click & drag to draw trend line'}
            {tool === 'zone' && 'Click & drag to mark S/R zone'}
            {tool === 'fib' && 'Click & drag to place Fibonacci levels'}
          </div>
        )}
      </div>
    </div>
  );
});

export default ChartDrawingCanvas;