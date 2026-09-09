import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { LineChart } from 'lucide-react';

const signalColors = {
  buy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  sell: 'bg-red-500/20 text-red-400 border-red-500/30',
  hold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  call: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  put: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function AnalysisHistory({ analyses, onSelect }) {
  if (analyses.length === 0) return null;

  return (
    <div className="neon-border rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <h2 className="text-sm font-semibold text-foreground">Analysis History</h2>
      </div>
      <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
        {analyses.map(a => (
          <button
            key={a.id}
            onClick={() => onSelect(a)}
            className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors"
          >
            <div className="w-9 h-9 rounded bg-secondary/50 flex items-center justify-center flex-shrink-0">
              <LineChart className="w-4 h-4 text-primary/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{a.summary || 'Chart Analysis'}</p>
              <p className="text-[10px] text-muted-foreground font-mono">
                {a.model} · {a.mode} · {format(new Date(a.created_date), 'MMM d, HH:mm')}
              </p>
            </div>
            {a.signal && (
              <Badge className={`${signalColors[a.signal]} border text-[10px] uppercase font-mono flex-shrink-0`}>
                {a.signal}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}