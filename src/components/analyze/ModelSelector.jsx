import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Cpu } from 'lucide-react';

const models = [
  { id: 'claude_sonnet_5', name: 'Claude Sonnet 5', provider: 'Anthropic', desc: 'Newest Claude — best-in-class vision & precise chart reasoning', badge: 'Latest' },
  { id: 'claude_opus_48', name: 'Claude Opus 4.8', provider: 'Anthropic', desc: 'Most powerful model for deep, rigorous multi-step analysis', badge: 'Recommended' },
  { id: 'gpt56_luna', name: 'GPT-5.6 Luna', provider: 'OpenAI', desc: 'Advanced reasoning for complex technical setups', badge: null },
  { id: 'gemini31_pro', name: 'Gemini 3.1 Pro', provider: 'Google', desc: 'Top-tier vision + web search for live market context', badge: null },
];

export default function ModelSelector({ selected, onSelect }) {
  return (
    <div className="neon-border rounded-xl bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">AI Model</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Select AI Model</p>
      </div>
      <div className="p-4 space-y-2">
        {models.map(model => (
          <button
            key={model.id}
            onClick={() => onSelect(model.id)}
            className={cn(
              "w-full text-left p-4 rounded-lg border transition-all duration-200",
              selected === model.id
                ? "border-primary/50 bg-primary/5 neon-border"
                : "border-border/30 bg-secondary/20 hover:border-border/60 hover:bg-secondary/40"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">{model.name}</span>
                {model.badge && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0">
                    {model.badge}
                  </Badge>
                )}
                {selected === model.id && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0">
                    Selected
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground font-mono">{model.provider}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{model.desc}</p>
          </button>
        ))}
        <p className="text-xs text-muted-foreground/60 flex items-center gap-1 px-1 mt-2">
          💡 Tip: Different models may provide varying insights. Try multiple models for comprehensive analysis.
        </p>
      </div>
    </div>
  );
}