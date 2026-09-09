import { cn } from '@/lib/utils';
import { Zap, BarChart3, Activity } from 'lucide-react';

const modes = [
  { id: 'quick', label: 'Quick Mode', desc: 'Fast trading signals', icon: Zap },
  { id: 'options', label: 'Options Mode', desc: 'CALL/PUT signals', icon: BarChart3 },
  { id: 'full', label: 'Full Mode', desc: 'Comprehensive analysis', icon: Activity },
];

export default function ModeSelector({ selected, onSelect }) {
  return (
    <div className="neon-border rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <h2 className="text-sm font-semibold text-foreground">Analysis Mode</h2>
      </div>
      <div className="p-4 grid grid-cols-3 gap-2">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-200 text-center",
              selected === mode.id
                ? "border-primary/50 bg-primary/5 neon-border"
                : "border-border/30 bg-secondary/20 hover:border-border/60 hover:bg-secondary/40"
            )}
          >
            <mode.icon className={cn("w-5 h-5", selected === mode.id ? "text-primary" : "text-muted-foreground")} />
            <div>
              <p className={cn("text-xs font-semibold", selected === mode.id ? "text-primary" : "text-foreground")}>{mode.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{mode.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}