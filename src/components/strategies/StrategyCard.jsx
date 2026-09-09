import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Play, Pause, Archive } from 'lucide-react';

const statusColors = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  archived: 'bg-muted text-muted-foreground border-border',
};

const riskColors = {
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function StrategyCard({ strategy, index, onEdit, onDelete, onStatusChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="neon-border rounded-xl bg-card/60 backdrop-blur-sm p-5 hover:bg-card/80 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{strategy.name}</h3>
          <p className="text-xs text-muted-foreground font-mono mt-0.5 capitalize">{strategy.type?.replace('_', ' ')}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            <DropdownMenuItem onClick={onEdit} className="text-foreground">
              <Pencil className="w-3 h-3 mr-2" /> Edit
            </DropdownMenuItem>
            {strategy.status !== 'active' && (
              <DropdownMenuItem onClick={() => onStatusChange('active')} className="text-emerald-400">
                <Play className="w-3 h-3 mr-2" /> Activate
              </DropdownMenuItem>
            )}
            {strategy.status === 'active' && (
              <DropdownMenuItem onClick={() => onStatusChange('paused')} className="text-yellow-400">
                <Pause className="w-3 h-3 mr-2" /> Pause
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onStatusChange('archived')} className="text-muted-foreground">
              <Archive className="w-3 h-3 mr-2" /> Archive
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-3 h-3 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {strategy.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{strategy.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={`${statusColors[strategy.status]} border text-[10px] font-mono`}>
          {strategy.status}
        </Badge>
        <Badge className={`${riskColors[strategy.risk_level]} border text-[10px] font-mono`}>
          {strategy.risk_level} risk
        </Badge>
      </div>

      {(strategy.win_rate > 0 || strategy.total_trades > 0) && (
        <div className="flex gap-4 mt-3 pt-3 border-t border-border/30">
          {strategy.win_rate > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Win Rate</p>
              <p className="text-sm font-mono font-semibold text-foreground">{strategy.win_rate}%</p>
            </div>
          )}
          {strategy.total_trades > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">Trades</p>
              <p className="text-sm font-mono font-semibold text-foreground">{strategy.total_trades}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}