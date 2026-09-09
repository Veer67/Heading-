import { Link } from 'react-router-dom';
import { ArrowRight, Target, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const riskColors = {
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function ActiveStrategies({ strategies }) {
  const active = strategies.filter(s => s.status === 'active');

  return (
    <div className="neon-border rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border/50">
        <h2 className="text-sm font-semibold text-foreground">Active Strategies</h2>
        <Link to="/Strategies" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="p-5">
        {active.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No active strategies</p>
            <Link to="/Strategies">
              <Button variant="outline" size="sm" className="mt-3 border-primary/30 text-primary hover:bg-primary/10">
                <Plus className="w-3 h-3 mr-1" /> Create Strategy
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {active.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{s.type?.replace('_', ' ')} · {s.total_trades || 0} trades</p>
                </div>
                <Badge className={`${riskColors[s.risk_level]} border text-xs font-mono`}>
                  {s.risk_level}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}