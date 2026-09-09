import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Shield, Target, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const signalConfig = {
  buy: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: TrendingUp, label: 'BUY' },
  sell: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: TrendingDown, label: 'SELL' },
  hold: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Minus, label: 'HOLD' },
  call: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: TrendingUp, label: 'CALL' },
  put: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: TrendingDown, label: 'PUT' },
};

export default function AnalysisResult({ analysis }) {
  if (!analysis) return null;

  const signal = signalConfig[analysis.signal] || signalConfig.hold;
  const SignalIcon = signal.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="neon-border rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden neon-box-glow"
    >
      <div className="p-5 border-b border-border/50">
        <h2 className="text-sm font-semibold text-foreground">Analysis Result</h2>
      </div>
      <div className="p-5 space-y-5">
        {/* Signal & Confidence */}
        <div className="flex items-center gap-4">
          <Badge className={`${signal.color} border text-lg px-4 py-2 font-mono font-bold`}>
            <SignalIcon className="w-5 h-5 mr-2" />
            {signal.label}
          </Badge>
          {analysis.confidence > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-primary">{analysis.confidence}%</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Confidence</p>
            </div>
          )}
        </div>

        {/* Key Levels */}
        {(analysis.entry_price || analysis.stop_loss || analysis.take_profit) && (
          <div className="grid grid-cols-3 gap-3">
            {analysis.entry_price && (
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                <Target className="w-4 h-4 text-primary mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase">Entry</p>
                <p className="text-sm font-mono font-semibold text-foreground">{analysis.entry_price}</p>
              </div>
            )}
            {analysis.stop_loss && (
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                <Shield className="w-4 h-4 text-red-400 mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase">Stop Loss</p>
                <p className="text-sm font-mono font-semibold text-foreground">{analysis.stop_loss}</p>
              </div>
            )}
            {analysis.take_profit && (
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
                <TrendingUp className="w-4 h-4 text-emerald-400 mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase">Take Profit</p>
                <p className="text-sm font-mono font-semibold text-foreground">{analysis.take_profit}</p>
              </div>
            )}
          </div>
        )}

        {/* Patterns */}
        {analysis.patterns?.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Detected Patterns</p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.patterns.map((p, i) => (
                <Badge key={i} variant="outline" className="border-primary/20 text-primary/80 text-xs font-mono">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Full Analysis */}
        {analysis.result && (
          <div className="border-t border-border/30 pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Detailed Analysis</p>
            <div className="prose prose-invert prose-sm max-w-none text-foreground/80">
              <ReactMarkdown>{analysis.result}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}