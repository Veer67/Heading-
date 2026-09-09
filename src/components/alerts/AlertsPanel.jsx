import { useState } from 'react';
import { useAlerts } from '@/lib/AlertContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, TrendingUp, TrendingDown, Minus, CheckCircle2, Scan, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const signalIcon = { buy: TrendingUp, call: TrendingUp, sell: TrendingDown, put: TrendingDown, hold: Minus };
const signalColor = {
  buy: 'text-emerald-400', call: 'text-emerald-400',
  sell: 'text-red-400', put: 'text-red-400',
  hold: 'text-yellow-400',
};

function AlertItem({ alert, onDismiss }) {
  const isPattern = alert.type === 'pattern';
  const Icon = signalIcon[alert.signal] || Minus;

  return (
    <div className="flex gap-3 p-3 border-b border-border/30 hover:bg-secondary/20 transition-colors group">
      <div className={cn(
        'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
        isPattern ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-secondary/50'
      )}>
        {isPattern
          ? <Scan className="w-3.5 h-3.5 text-purple-400" />
          : <Icon className={cn('w-3.5 h-3.5', signalColor[alert.signal])} />
        }
      </div>
      <div className="flex-1 min-w-0">
        {isPattern && (
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded uppercase tracking-wider">
              PATTERN SCAN
            </span>
            {alert.symbol && (
              <span className="text-[9px] font-mono font-bold text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                {alert.symbol}
              </span>
            )}
          </div>
        )}
        <p className="text-xs font-medium text-foreground line-clamp-2">{alert.summary}</p>
        <div className="flex items-center gap-2 mt-1">
          {alert.pattern && (
            <span className="text-[10px] font-mono text-purple-300 truncate max-w-[100px]">{alert.pattern}</span>
          )}
          {alert.signal && (
            <span className={cn('text-[10px] font-mono uppercase font-bold', signalColor[alert.signal])}>
              {alert.signal}
            </span>
          )}
          {alert.confidence > 0 && (
            <span className="text-[10px] font-mono text-primary">{alert.confidence}%</span>
          )}
          {alert.timeframe && (
            <span className="text-[10px] font-mono text-muted-foreground/60">{alert.timeframe}</span>
          )}
          <span className="text-[10px] text-muted-foreground/40 font-mono ml-auto">
            {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
          </span>
        </div>
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all flex-shrink-0"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function AlertsPanel() {
  const { alerts, unread, dismiss, clearAll, markAllRead } = useAlerts();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(o => {
      if (!o) markAllRead();
      return !o;
    });
  };

  const patternCount = alerts.filter(a => a.type === 'pattern').length;

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className={cn(
          'relative flex items-center justify-center w-8 h-8 rounded-lg border transition-all',
          open
            ? 'bg-primary/20 border-primary/40 text-primary'
            : 'border-border/40 text-muted-foreground hover:text-foreground hover:border-border/70'
        )}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 bottom-12 w-84 bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden z-50"
            style={{ width: '320px' }}
          >
            <div className="flex items-center justify-between p-3 border-b border-border/50 bg-secondary/10">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Live Alerts</span>
                {alerts.length > 0 && (
                  <span className="text-[10px] font-mono text-muted-foreground">({alerts.length})</span>
                )}
                {patternCount > 0 && (
                  <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                    {patternCount} patterns
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {alerts.length > 0 && (
                  <button onClick={clearAll} className="text-[10px] text-muted-foreground hover:text-foreground font-mono px-1.5">
                    Clear all
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="py-8 text-center">
                  <Scan className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No alerts yet</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">Market scanner runs every 5 min</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <AlertItem key={alert.id} alert={alert} onDismiss={dismiss} />
                ))
              )}
            </div>
            <div className="p-2 border-t border-border/30 bg-secondary/5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-mono text-muted-foreground">Auto-scanning: BTC, ETH, SOL, BNB, XRP, ADA…</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}