import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/lib/useSEO';
import { Loader2, Sparkles, PenTool, Globe, Wifi, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import ModelSelector from '../components/analyze/ModelSelector';
import ModeSelector from '../components/analyze/ModeSelector';
import ChartUploader from '../components/analyze/ChartUploader';
import AnalysisResult from '../components/analyze/AnalysisResult';
import AnalysisHistory from '../components/analyze/AnalysisHistory';
import ChartDrawingCanvas from '../components/analyze/ChartDrawingCanvas';
import LearnTradePanel from '../components/analyze/LearnTradePanel';

const modelMap = {
  claude_sonnet_5: 'claude-sonnet-5',
  claude_opus_48: 'claude_opus_4_8',
  gpt56_luna: 'gpt_5_6_luna',
  gemini31_pro: 'gemini_3_1_pro',
};

const analystPreamble = `You are a senior, disciplined technical analyst. Read this chart PRECISELY and produce an accurate, evidence-based analysis. Follow this method strictly:

1. READ THE CHART: Identify the instrument/ticker and timeframe if visible. Read ACTUAL price values from the price axis — do not guess or round arbitrarily. Note the current price and recent swing highs / swing lows.
2. TREND & STRUCTURE: Determine the trend and market structure (Higher Highs + Higher Lows = uptrend; Lower Highs + Lower Lows = downtrend; sideways = range). State it explicitly.
3. KEY LEVELS: Mark the most important support/resistance and supply/demand zones from actual swing points on the chart. Use real price numbers from the axis.
4. PATTERNS: Identify candlestick patterns AND chart patterns (flags, triangles, wedges, double tops/bottoms, head & shoulders) ONLY if genuinely present. Do not invent patterns that are not clearly visible.
5. INDICATORS & VOLUME: If any indicators (MA, RSI, MACD, Bollinger) or volume bars are visible, read their actual readings and state what they imply.
6. CONFLUENCE & SIGNAL: Output "buy" or "sell" ONLY when trend, structure, a key level, AND a pattern/indicator all align with a clear invalidation point. If signals are mixed, unclear, or the chart is choppy, output "hold" with appropriately low confidence. NEVER force a trade.
7. LEVELS: Set entry at a specific logical price. Stop loss MUST sit just beyond the invalidation level (where the setup is proven wrong). Take profit at the next logical resistance/support with a risk:reward of at least 2:1. All three must be real numbers consistent with the chart's scale.
8. CONFIDENCE CALIBRATION: 80-100 only with strong multi-factor confluence and clean structure; 50-79 for reasonable but imperfect setups; below 50 for unclear or mixed charts. Do not inflate confidence.
9. HONESTY: If the image is unclear, low-resolution, or has no visible price axis, say so and lower confidence. Never fabricate levels or patterns you cannot see.

In the "result" field, write structured markdown with these sections: **Instrument / Timeframe**, **Trend & Structure**, **Key Levels**, **Patterns & Indicators**, **Trade Plan** (entry / stop loss / take profit with rationale and R:R), **Risk Notes**. Use real price numbers throughout. Be specific, not generic.`;

const modeAddenda = {
  quick: 'MODE: Quick scan. Keep the result concise (3-5 short sections) but still follow the full method. Signal must be buy/sell/hold.',
  options: 'MODE: Options analysis. Signal must be call/put/hold. Frame the entry around an approximate strike price, discuss directional bias and the implied move, and give an options-appropriate risk plan. Still follow the full method.',
  full: 'MODE: Full comprehensive analysis. Be thorough and detailed across every section; cover multiple timeframes if discernible and include a complete risk-management plan.',
};

export default function Analyze() {
  useSEO({
    title: 'AI Chart Analysis',
    description: 'Upload trading charts and get AI-powered technical analysis with trading signals, entry prices, stop loss, and take profit targets from Trade AI Zotra.',
    keywords: 'AI chart analysis, trading signals, technical analysis, chart patterns, AI trading, Trade AI Zotra analysis',
  });

  const [model, setModel] = useState('claude_sonnet_5');
  const [mode, setMode] = useState('quick');
  const [chartUrl, setChartUrl] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [liveMarket, setLiveMarket] = useState(false);
  const canvasRef = useRef(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: analyses = [] } = useQuery({
    queryKey: ['analyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 50),
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      // If user made drawings, export canvas as blob and upload it
      let analysisImageUrl = chartUrl;
      if (canvasRef.current?.hasDrawings()) {
        const blob = await canvasRef.current.exportAsBlob();
        if (blob) {
          const file = new File([blob], 'chart-annotated.png', { type: 'image/png' });
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          analysisImageUrl = file_url;
        }
      }

      const drawingNote = canvasRef.current?.hasDrawings()
        ? ' The chart includes user-drawn annotations: trend lines (cyan), support/resistance zones (orange), and/or Fibonacci retracement levels. Take these annotations into account in your analysis.'
        : '';

      const liveNote = liveMarket
        ? `\n\nLIVE MARKET INSIGHTS ENABLED — perform REAL-TIME analysis with these extra steps:
10. TICKER EXTRACTION: Carefully read the chart image for the stock ticker / symbol / company name (check the chart header, axis labels, watermark, or any text). Identify the EXACT instrument before searching.
11. REAL-TIME LOOKUP: Use web search to fetch the LIVE current price, today's % change, day's volume, market cap, and the most recent news headlines for that specific instrument. Also check for upcoming catalysts (earnings, ex-dividend, economic events) in the next few days.
12. RECONCILE: Compare the price shown on the chart with the real-time price you found. Note any gap and whether the chart appears current or stale.
13. ADJUST SIGNAL: Factor the live news and sentiment into your final signal and confidence. If a major breaking catalyst (earnings, downgrade, FDA, etc.) contradicts the chart setup, lower confidence or switch to "hold".
14. If you cannot identify a clear ticker from the image, state "Ticker not identifiable — chart-only analysis" and proceed with the technical method only.
Add a **Live Market Context** section in the result containing: identified ticker, real-time price, today's change, key news, upcoming catalysts, and how the live context affects the trade.`
        : '';

      // live market uses the higher-quality web-search-capable model for accurate real-time analysis
      const effectiveModel = liveMarket ? 'gemini_3_1_pro' : modelMap[model];

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${analystPreamble}\n\n${modeAddenda[mode]}${drawingNote}${liveNote}`,
        file_urls: [analysisImageUrl],
        model: effectiveModel,
        add_context_from_internet: liveMarket,
        response_json_schema: {
          type: "object",
          properties: {
            signal: { type: "string", enum: ["buy", "sell", "hold", "call", "put"] },
            confidence: { type: "number" },
            entry_price: { type: "string" },
            stop_loss: { type: "string" },
            take_profit: { type: "string" },
            patterns: { type: "array", items: { type: "string" } },
            summary: { type: "string" },
            result: { type: "string" },
          },
        },
      });

      const saved = await base44.entities.Analysis.create({
        chart_url: chartUrl,
        model,
        mode,
        signal: response.signal,
        confidence: response.confidence,
        entry_price: response.entry_price,
        stop_loss: response.stop_loss,
        take_profit: response.take_profit,
        patterns: response.patterns,
        summary: response.summary,
        result: response.result,
      });

      return { ...saved, ...response };
    },
    onSuccess: (data) => {
      setCurrentResult(data);
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    },
    onError: (e) => {
      toast({ title: 'Analysis failed', description: e?.message || 'Please try again.', variant: 'destructive' });
    },
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chart Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload and analyze your trading charts with AI</p>
        </div>
        {/* Right-side actions */}
        <div className="flex items-center gap-2">
          <Link to="/Learn"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-bold hover:bg-blue-500/20 transition-all duration-200"
          >
            <GraduationCap className="w-4 h-4" />
            Learn to Trade
          </Link>
          {/* Live Market Toggle */}
          <button
            onClick={() => setLiveMarket(l => !l)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200',
              liveMarket
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 neon-border'
                : 'border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            )}
          >
            {liveMarket ? <Wifi className="w-4 h-4 animate-pulse" /> : <Globe className="w-4 h-4" />}
            Live Market Insights
            <span className={cn(
              'text-[9px] font-mono px-1.5 py-0.5 rounded',
              liveMarket ? 'bg-emerald-500/20 text-emerald-300' : 'bg-secondary text-muted-foreground'
            )}>
              {liveMarket ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        {/* Left column: Config */}
        <div className="space-y-6">
          <ModelSelector selected={model} onSelect={setModel} />
          <ModeSelector selected={mode} onSelect={setMode} />
          <ChartUploader chartUrl={chartUrl} onUpload={setChartUrl} onClear={() => { setChartUrl(null); }} />

          {chartUrl && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <PenTool className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">Drawing Tools</span>
                <span className="text-[10px] text-muted-foreground font-mono">(annotations sent to AI)</span>
              </div>
              <ChartDrawingCanvas ref={canvasRef} imageUrl={chartUrl} />
            </div>
          )}

          <Button
            onClick={() => analyzeMutation.mutate()}
            disabled={!chartUrl || analyzeMutation.isPending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-sm font-semibold"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Chart...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Chart
              </>
            )}
          </Button>
        </div>

        {/* Right column: Results */}
        <div className="space-y-6">
          {currentResult && <AnalysisResult analysis={currentResult} />}
          <AnalysisHistory analyses={analyses} onSelect={setCurrentResult} />
          <LearnTradePanel />
        </div>
      </div>
    </div>
  );
}