import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Eye, EyeOff, RefreshCw, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useSEO } from '@/lib/useSEO';
import { useLearning } from '@/lib/learn/useLearning';
import { fetchHistoricalOHLC } from '@/lib/marketData';
import CandlestickChart from '@/components/charts/CandlestickChart';

// Real OHLC via CoinGecko — NO fallback / NO fabricated data.
const SYMBOLS = [
  { label: 'BTC/USD', symbol: 'BTC/USD', tf: '1d' },
  { label: 'ETH/USD', symbol: 'ETH/USD', tf: '1d' },
  { label: 'SOL/USD', symbol: 'SOL/USD', tf: '1d' },
  { label: 'BNB/USD', symbol: 'BNB/USD', tf: '4h' },
  { label: 'XRP/USD', symbol: 'XRP/USD', tf: '4h' },
  { label: 'ADA/USD', symbol: 'ADA/USD', tf: '4h' },
  { label: 'RELIANCE', symbol: 'RELIANCE', tf: '1d' },
  { label: 'TCS', symbol: 'TCS', tf: '1d' },
  { label: 'INFY', symbol: 'INFY', tf: '1d' },
  { label: 'HDFCBANK', symbol: 'HDFCBANK', tf: '1d' },
  { label: 'ICICIBANK', symbol: 'ICICIBANK', tf: '1d' },
  { label: 'SBIN', symbol: 'SBIN', tf: '1d' },
];

export default function LearnPractice() {
  useSEO({ title: 'Historical Practice — Learn' });
  const { incrementPatterns } = useLearning();
  const [sym, setSym] = useState(SYMBOLS[0]);
  const [allData, setAllData] = useState(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [plan, setPlan] = useState('');
  const [planSaved, setPlanSaved] = useState(false);

  const load = async (s = sym) => {
    setLoading(true);
    setError(null);
    setRevealed(false);
    setPlan('');
    setPlanSaved(false);
    try {
      const data = await fetchHistoricalOHLC(s.symbol, s.tf, 180);
      setAllData(data);
      setVisibleCount(Math.floor(data.length * 0.6)); // hide last ~40%
    } catch (e) {
      setAllData(null);
      setError('Live market data unavailable. Please try again later.');
    }
    setLoading(false);
  };

  const visibleData = allData ? allData.slice(0, visibleCount) : [];
  const hiddenCount = allData ? allData.length - visibleCount : 0;

  const revealMore = () => {
    setVisibleCount((c) => Math.min(allData.length, c + 15));
    if (visibleCount + 15 >= allData.length) setRevealed(true);
  };
  const revealAll = () => { setVisibleCount(allData.length); setRevealed(true); };

  const savePlan = () => {
    if (!plan.trim()) return;
    setPlanSaved(true);
    incrementPatterns(1);
  };

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Gamepad2 className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Historical Practice</h1>
          <p className="text-[11px] font-mono text-amber-400/90">⚠️ HISTORICAL PRACTICE — NOT live trading</p>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-xl bg-card border border-border/50 p-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Symbol</span>
          <select value={sym.label} onChange={(e) => { const s = SYMBOLS.find((x) => x.label === e.target.value); setSym(s); }}
            className="bg-secondary/40 border border-border/50 rounded-lg px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none">
            {SYMBOLS.map((s) => <option key={s.label} value={s.label}>{s.label} · {s.tf}</option>)}
          </select>
        </div>
        <button onClick={() => load()} disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Load Real Data
        </button>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">Real OHLC · CoinGecko / Twelve Data</span>
      </div>

      {/* Chart area */}
      <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">{sym.label} · {sym.tf}</h2>
          {allData && !revealed && (
            <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1"><EyeOff className="w-3 h-3" /> {hiddenCount} candles hidden</span>
          )}
          {revealed && <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1"><Eye className="w-3 h-3" /> Fully revealed</span>}
        </div>
        <div className="h-[340px] md:h-[420px] w-full p-2">
          {loading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Fetching real market data…
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
              <p className="text-sm text-foreground">{error}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Historical practice requires a live data connection. No fake data is shown.</p>
            </div>
          ) : !allData ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <Gamepad2 className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Pick a symbol and load real historical data to begin.</p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">Future candles are hidden until you commit to a plan.</p>
            </div>
          ) : (
            <CandlestickChart data={visibleData} />
          )}
        </div>
        {allData && !error && (
          <div className="px-4 py-3 border-t border-border/40 flex items-center gap-2 flex-wrap">
            {!revealed ? (
              <>
                <button onClick={revealMore} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 bg-secondary/30 text-xs font-bold text-foreground hover:border-primary/40">
                  <Eye className="w-3.5 h-3.5" /> Reveal 15 candles
                </button>
                <button onClick={revealAll} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 bg-secondary/30 text-xs font-bold text-foreground hover:border-primary/40">
                  Reveal All
                </button>
                <span className="text-[10px] font-mono text-muted-foreground">Commit to your plan before revealing.</span>
              </>
            ) : (
              <button onClick={() => load()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90">
                <RefreshCw className="w-3.5 h-3.5" /> New Practice Round
              </button>
            )}
          </div>
        )}
      </div>

      {/* Plan / analysis */}
      {allData && !error && (
        <div className="rounded-xl bg-card border border-border/50 p-5">
          <p className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground/60 uppercase mb-2">Your Analysis (commit before revealing)</p>
          <textarea
            value={plan}
            onChange={(e) => { setPlan(e.target.value); setPlanSaved(false); }}
            disabled={revealed}
            rows={4}
            placeholder="Trend: …  Key levels: …  Setup: …  Entry: …  Stop: …  Target: …  Invalidation: …"
            className="w-full bg-secondary/30 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 disabled:opacity-60 resize-none"
          />
          <div className="mt-2 flex items-center gap-2">
            <button onClick={savePlan} disabled={!plan.trim() || revealed || planSaved}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 disabled:opacity-50">
              {planSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              {planSaved ? 'Plan locked in' : 'Lock in my plan'}
            </button>
            {planSaved && <span className="text-[10px] font-mono text-emerald-400">Now reveal candles and judge your process, not just the outcome.</span>}
          </div>
        </div>
      )}
      <p className="text-center text-[10px] font-mono text-muted-foreground/40">
        Historical practice uses real past data. Past performance does not guarantee future results. Educational only.
      </p>
    </div>
  );
}