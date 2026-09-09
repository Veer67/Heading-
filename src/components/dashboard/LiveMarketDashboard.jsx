import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Zap, AlertTriangle } from 'lucide-react';
import { fetchRealTimePrices } from '@/lib/marketData';
import { useAlerts } from '@/lib/AlertContext';
import { motion } from 'framer-motion';

const WATCHLIST = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'BNB/USD', 'XRP/USD', 'ADA/USD', 'DOGE/USD', 'DOT/USD'];
const POLL_MS = 30000;

export default function LiveMarketDashboard() {
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { alerts } = useAlerts();

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const rows = await fetchRealTimePrices(WATCHLIST);
        if (!active) return;
        const map = {};
        rows.forEach((r) => { map[r.symbol] = r; });
        setMarketData(map);
        setError(null);
      } catch {
        if (active) setError('Live data unavailable. Retrying…');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, POLL_MS);
    return () => { active = false; clearInterval(id); };
  }, []);

  const rows = WATCHLIST.map((s) => [s, marketData[s]]).filter(([, d]) => d);
  const gainers = [...rows].filter(([, d]) => d.change > 0).sort((a, b) => b[1].change - a[1].change).slice(0, 5);
  const losers = [...rows].filter(([, d]) => d.change < 0).sort((a, b) => a[1].change - b[1].change).slice(0, 5);
  const scannerAlerts = alerts.filter((a) => a.type === 'pattern').slice(0, 8);

  const fmt = (n) => n.toLocaleString('en-US', { maximumFractionDigits: n < 1 ? 4 : 2 });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono">Real-time data via CoinGecko · auto-refresh 30s</span>
      </div>

      {/* Real Signal Scanner */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <CardTitle className="text-lg">Real Signal Scanner</CardTitle>
            <Badge variant="outline" className="ml-auto">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" /> Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {scannerAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No active signals right now. Scanner evaluates real EMA crossovers &amp; RSI every 5 min.
              </p>
            ) : (
              scannerAlerts.map((a) => (
                <div key={a.id} className={`p-3 rounded-lg border ${a.signal === 'buy' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${a.signal === 'buy' ? 'text-emerald-500' : 'text-red-500'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-xs font-bold text-foreground">{a.symbol}</span>
                        <span className={`text-[10px] font-mono uppercase font-bold ${a.signal === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>{a.signal}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{a.pattern} · {a.timeframe}</span>
                      </div>
                      <p className="text-xs text-foreground/80">{a.summary}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live watchlist */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Live Crypto Market</CardTitle></CardHeader>
        <CardContent>
          {loading && rows.length === 0 ? (
            <div className="grid md:grid-cols-2 gap-3">
              {WATCHLIST.map((s) => <div key={s} className="p-4 border rounded-lg bg-muted/20 animate-pulse h-24" />)}
            </div>
          ) : error && rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {WATCHLIST.map((symbol) => {
                const d = marketData[symbol];
                if (!d) return <div key={symbol} className="p-4 border rounded-lg bg-muted/20 animate-pulse h-24" />;
                return (
                  <motion.div key={symbol} initial={{ scale: 0.98 }} animate={{ scale: 1 }} className="p-4 border rounded-lg hover:border-primary/50 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-sm">{symbol}</p>
                        <p className="text-2xl font-bold tabular-nums">${fmt(d.price)}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded ${d.change >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {d.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span className="text-sm font-semibold">{d.change >= 0 ? '+' : ''}{d.change.toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      <div><p className="text-muted-foreground">24h High</p><p className="font-medium text-green-500">${fmt(d.high24h)}</p></div>
                      <div><p className="text-muted-foreground">24h Low</p><p className="font-medium text-red-500">${fmt(d.low24h)}</p></div>
                      <div className="col-span-2"><p className="text-muted-foreground">24h Volume</p><p className="font-medium">${(d.volume / 1e9).toFixed(2)}B</p></div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" /> Top Gainers (24h)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gainers.length === 0 ? <p className="text-sm text-muted-foreground">No gainers</p> : gainers.map(([s, d]) => (
                <div key={s} className="flex items-center justify-between p-2 rounded-lg bg-green-500/5">
                  <span className="font-medium text-sm">{s}</span><span className="text-green-500 font-semibold text-sm">+{d.change.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingDown className="w-5 h-5 text-red-500" /> Top Losers (24h)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {losers.length === 0 ? <p className="text-sm text-muted-foreground">No losers</p> : losers.map(([s, d]) => (
                <div key={s} className="flex items-center justify-between p-2 rounded-lg bg-red-500/5">
                  <span className="font-medium text-sm">{s}</span><span className="text-red-500 font-semibold text-sm">{d.change.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}