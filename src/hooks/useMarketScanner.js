import { useEffect, useRef } from 'react';
import { useAlerts } from '@/lib/AlertContext';
import { fetchHistoricalOHLC, isCryptoSymbol, isIndianSymbol } from '@/lib/marketData';
import { rsi, ema } from '@/lib/indicators';

const SCAN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const SYMBOLS = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'BNB/USD', 'XRP/USD', 'ADA/USD'];
// Indian stocks (EOD via Twelve Data) — scanned every ~6h to respect free-tier limits.
const INDIAN_SYMBOLS = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN'];

// Compute a REAL signal from real OHLC: EMA20/50 crossover + RSI extremes.
// Returns null when no genuine signal exists (no fabricated alerts).
function analyze(candles) {
  if (!candles || candles.length < 55) return null;
  const closes = candles.map((c) => c.close);
  const prevCloses = closes.slice(0, -1);

  const ema20 = ema(closes, 20);
  const ema50 = ema(closes, 50);
  const prevEma20 = ema(prevCloses, 20);
  const prevEma50 = ema(prevCloses, 50);
  const rsiVal = rsi(closes, 14);

  if (prevEma20 != null && prevEma50 != null && ema20 != null && ema50 != null) {
    if (prevEma20 <= prevEma50 && ema20 > ema50) {
      return { signal: 'buy', pattern: 'EMA Golden Cross', confidence: 72, timeframe: '1D',
        summary: `EMA20 crossed above EMA50 — bullish momentum shift (RSI ${rsiVal?.toFixed(0)}).` };
    }
    if (prevEma20 >= prevEma50 && ema20 < ema50) {
      return { signal: 'sell', pattern: 'EMA Death Cross', confidence: 72, timeframe: '1D',
        summary: `EMA20 crossed below EMA50 — bearish momentum shift (RSI ${rsiVal?.toFixed(0)}).` };
    }
  }
  if (rsiVal != null) {
    if (rsiVal < 30) return { signal: 'buy', pattern: 'RSI Oversold', confidence: 65, timeframe: '1D',
      summary: `RSI ${rsiVal.toFixed(0)} — oversold territory, potential mean-reversion bounce.` };
    if (rsiVal > 70) return { signal: 'sell', pattern: 'RSI Overbought', confidence: 65, timeframe: '1D',
      summary: `RSI ${rsiVal.toFixed(0)} — overbought territory, potential pullback risk.` };
  }
  return null;
}

export default function useMarketScanner() {
  const { pushAlert } = useAlerts();
  const lastScanRef = useRef(null);
  const cycleRef = useRef(0);

  async function runScan() {
    cycleRef.current += 1;
    for (const symbol of SYMBOLS) {
      if (!isCryptoSymbol(symbol)) continue;
      try {
        const candles = await fetchHistoricalOHLC(symbol, '1d', 60);
        const sig = analyze(candles);
        if (sig) pushAlert({ type: 'pattern', symbol, ...sig });
      } catch {
        // network error — skip silently, retry next cycle
      }
    }
    // Indian stocks use EOD data — only re-scan every ~6h (72 cycles).
    if (cycleRef.current % 72 === 1) {
      for (const symbol of INDIAN_SYMBOLS) {
        if (!isIndianSymbol(symbol)) continue;
        try {
          const candles = await fetchHistoricalOHLC(symbol, '1d', 60);
          const sig = analyze(candles);
          if (sig) pushAlert({ type: 'pattern', symbol, ...sig });
        } catch {
          // network error / no API key — skip silently
        }
      }
    }
    lastScanRef.current = new Date();
  }

  useEffect(() => {
    const initial = setTimeout(runScan, 4000);
    const interval = setInterval(runScan, SCAN_INTERVAL_MS);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, []);

  return { lastScan: lastScanRef.current };
}