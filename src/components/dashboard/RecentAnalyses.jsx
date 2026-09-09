import { Link } from 'react-router-dom';
import { LineChart, ArrowRight, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const signalColors = {
  buy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  sell: 'bg-red-500/20 text-red-400 border-red-500/30',
  hold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  call: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  put: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function RecentAnalyses({ analyses }) {
  return (
    <div className="neon-border rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border/50">
        <h2 className="text-sm font-semibold text-foreground">Recent Analyses</h2>
        <Link to="/Analyze" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="p-5">
        {analyses.length === 0 ? (
          <div className="text-center py-8">
            <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No analyses yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Upload a chart to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                  <LineChart className="w-5 h-5 text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.summary || 'Chart Analysis'}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {a.model} · {a.mode} · {format(new Date(a.created_date), 'MMM d')}
                  </p>
                </div>
                {a.signal && (
                  <Badge className={`${signalColors[a.signal]} border text-xs uppercase font-mono`}>
                    {a.signal}
                  </Badge>
                )}
                {a.confidence > 0 && (
                  <span className="text-xs font-mono text-primary">{a.confidence}%</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}