import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, TrendingDown, LineChart as LineChartIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fetchRealTimePrices, fetchForexPrices, fetchIndianRealTimePrices, isCryptoSymbol, isForexSymbol, isIndianSymbol } from '@/lib/marketData';

// Symbol catalogue. Prices are fetched LIVE:
//   - Crypto -> Binance public API (client-side, keyless)
//   - Forex  -> open.er-api (client-side, keyless, real spot rates)
//   - Others -> "Live chart" (real chart via TradingView). Real *prices* for
//               stocks/commodities/indices need a Builder+ backend function or
//               a paid market-data API key — none are fabricated.
const SYMBOLS = [
  // Crypto
  { symbol: 'BTC/USD', name: 'Bitcoin', category: 'Crypto' },
  { symbol: 'ETH/USD', name: 'Ethereum', category: 'Crypto' },
  { symbol: 'BNB/USD', name: 'Binance Coin', category: 'Crypto' },
  { symbol: 'SOL/USD', name: 'Solana', category: 'Crypto' },
  { symbol: 'XRP/USD', name: 'Ripple', category: 'Crypto' },
  { symbol: 'ADA/USD', name: 'Cardano', category: 'Crypto' },
  { symbol: 'DOGE/USD', name: 'Dogecoin', category: 'Crypto' },
  { symbol: 'MATIC/USD', name: 'Polygon', category: 'Crypto' },
  { symbol: 'DOT/USD', name: 'Polkadot', category: 'Crypto' },
  { symbol: 'AVAX/USD', name: 'Avalanche', category: 'Crypto' },

  // US Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'US Tech' },
  { symbol: 'MSFT', name: 'Microsoft', category: 'US Tech' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'US Tech' },
  { symbol: 'AMZN', name: 'Amazon', category: 'US Tech' },
  { symbol: 'META', name: 'Meta Platforms', category: 'US Tech' },
  { symbol: 'NVDA', name: 'NVIDIA', category: 'US Tech' },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'US Tech' },
  { symbol: 'NFLX', name: 'Netflix', category: 'US Tech' },
  { symbol: 'AMD', name: 'AMD', category: 'US Tech' },
  { symbol: 'INTC', name: 'Intel', category: 'US Tech' },

  // Forex
  { symbol: 'EUR/USD', name: 'Euro/Dollar', category: 'Forex' },
  { symbol: 'GBP/USD', name: 'Pound/Dollar', category: 'Forex' },
  { symbol: 'USD/JPY', name: 'Dollar/Yen', category: 'Forex' },
  { symbol: 'AUD/USD', name: 'Aussie/Dollar', category: 'Forex' },
  { symbol: 'USD/CAD', name: 'Dollar/Loonie', category: 'Forex' },
  { symbol: 'USD/CHF', name: 'Dollar/Franc', category: 'Forex' },
  { symbol: 'NZD/USD', name: 'Kiwi/Dollar', category: 'Forex' },
  { symbol: 'EUR/GBP', name: 'Euro/Pound', category: 'Forex' },
  { symbol: 'INR/USD', name: 'Rupee/Dollar', category: 'Forex' },

  // Commodities
  { symbol: 'GOLD', name: 'Gold Spot', category: 'Commodities' },
  { symbol: 'SILVER', name: 'Silver Spot', category: 'Commodities' },
  { symbol: 'CRUDE_OIL', name: 'Crude Oil WTI', category: 'Commodities' },
  { symbol: 'NATURAL_GAS', name: 'Natural Gas', category: 'Commodities' },
  { symbol: 'COPPER', name: 'Copper', category: 'Commodities' },
  { symbol: 'PLATINUM', name: 'Platinum', category: 'Commodities' },

  // Global Indices
  { symbol: 'SPX', name: 'S&P 500', category: 'Indices' },
  { symbol: 'DJI', name: 'Dow Jones', category: 'Indices' },
  { symbol: 'IXIC', name: 'Nasdaq', category: 'Indices' },
  { symbol: 'FTSE', name: 'FTSE 100', category: 'Indices' },
  { symbol: 'DAX', name: 'DAX 40', category: 'Indices' },
  { symbol: 'NIKKEI', name: 'Nikkei 225', category: 'Indices' },
  { symbol: 'HSI', name: 'Hang Seng', category: 'Indices' },

  // Indian Indices
  { symbol: 'NIFTY50', name: 'Nifty 50', category: 'Indian Indices' },
  { symbol: 'SENSEX', name: 'BSE Sensex', category: 'Indian Indices' },
  { symbol: 'NIFTYBANK', name: 'Nifty Bank', category: 'Indian Indices' },

  // Indian Stocks (NSE) — real charts via TradingView
  { symbol: 'RELIANCE', name: 'Reliance Industries', category: 'Indian Stocks' },
  { symbol: 'TCS', name: 'Tata Consultancy', category: 'Indian Stocks' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', category: 'Indian Stocks' },
  { symbol: 'INFY', name: 'Infosys', category: 'Indian Stocks' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', category: 'Indian Stocks' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', category: 'Indian Stocks' },
  { symbol: 'ITC', name: 'ITC Limited', category: 'Indian Stocks' },
  { symbol: 'SBIN', name: 'State Bank of India', category: 'Indian Stocks' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', category: 'Indian Stocks' },
  { symbol: 'WIPRO', name: 'Wipro', category: 'Indian Stocks' },
  { symbol: 'LT', name: 'Larsen & Toubro', category: 'Indian Stocks' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', category: 'Indian Stocks' },
  { symbol: 'AXISBANK', name: 'Axis Bank', category: 'Indian Stocks' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', category: 'Indian Stocks' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', category: 'Indian Stocks' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', category: 'Indian Stocks' },
];

// Currency prefix + decimal places per category (honest units, not all-$).
const CURRENCY = {
  Crypto: { prefix: '$', decimals: 2 },
  'US Tech': { prefix: '$', decimals: 2 },
  Commodities: { prefix: '$', decimals: 2 },
  Forex: { prefix: '', decimals: 4 },
  Indices: { prefix: '', decimals: 2 },
  'Indian Indices': { prefix: '₹', decimals: 2 },
  'Indian Stocks': { prefix: '₹', decimals: 2 },
};

const fmtPrice = (n, category) => {
  const c = CURRENCY[category] || { prefix: '', decimals: 2 };
  const num = n.toLocaleString('en-US', { maximumFractionDigits: c.decimals, minimumFractionDigits: 0 });
  return `${c.prefix}${num}`;
};

export default function MarketSymbols({ selectedSymbol, onSymbolSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [livePrices, setLivePrices] = useState({});

  const cryptoSymbols = SYMBOLS.filter((s) => isCryptoSymbol(s.symbol)).map((s) => s.symbol);
  const forexSymbols = SYMBOLS.filter((s) => isForexSymbol(s.symbol)).map((s) => s.symbol);
  const indianSymbols = SYMBOLS.filter((s) => isIndianSymbol(s.symbol)).map((s) => s.symbol);

  // Indian quotes are EOD (Twelve Data) — refresh infrequently (every 6h)
  // to stay well within the free 800 credits/day tier.
  useEffect(() => {
    let active = true;
    const loadIndian = async () => {
      try {
        const rows = await fetchIndianRealTimePrices(indianSymbols);
        if (!active) return;
        setLivePrices((prev) => {
          const next = { ...prev };
          rows.forEach((r) => { next[r.symbol] = r; });
          return next;
        });
      } catch {
        // network error — retry next cycle
      }
    };
    loadIndian();
    const id = setInterval(loadIndian, 6 * 60 * 60 * 1000);
    return () => { active = false; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const next = {};
      // Crypto via Binance (real price + 24h change)
      try {
        const rows = await fetchRealTimePrices(cryptoSymbols);
        rows.forEach((r) => { next[r.symbol] = r; });
      } catch {
        // network error — retry next cycle
      }
      // Forex via open.er-api (real spot price; no 24h change on free tier)
      try {
        const rows = await fetchForexPrices(forexSymbols);
        rows.forEach((r) => { next[r.symbol] = r; });
      } catch {
        // network error — retry next cycle
      }
      if (active) setLivePrices(next);
    };
    load();
    const id = setInterval(load, 60000);
    return () => { active = false; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSymbols = SYMBOLS.filter((s) =>
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search symbols..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-2">
          {filteredSymbols.map((item) => {
            const live = livePrices[item.symbol];
            const change = live?.change;
            const hasChange = change != null;
            return (
              <button
                key={item.symbol}
                onClick={() => onSymbolSelect(item.symbol)}
                className={`w-full text-left p-4 rounded-lg border transition-all hover:border-primary/50 hover:bg-accent/50 ${
                  selectedSymbol === item.symbol
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{item.symbol}</span>
                      {hasChange ? (
                        change >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        )
                      ) : (
                        <LineChartIcon className="w-3 h-3 text-blue-400" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider">{item.category}</p>
                  </div>
                  <div className="text-right">
                    {live ? (
                      <>
                        <p className="font-semibold text-sm tabular-nums">{fmtPrice(live.price, item.category)}</p>
                        {hasChange ? (
                          <p className={`text-xs font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                          </p>
                        ) : (
                          <p className="text-[10px] font-mono text-muted-foreground/60">spot rate</p>
                        )}
                      </>
                    ) : (
                      <p className="text-[10px] font-mono text-blue-400/80 flex items-center gap-1 justify-end">
                        <LineChartIcon className="w-3 h-3" /> Live chart
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}