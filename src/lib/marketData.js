// Real market data via free, CORS-enabled public APIs.
//   - Crypto  -> CoinGecko (prices + historical OHLC; not geo-blocked)
//   - Forex   -> open.er-api (spot rates)
//   - Indian  -> Twelve Data (NSE/BSE prices + historical OHLC; free key)
// Other stocks/commodities/indices have no keyless browser source; their
// real chart renders via the TradingView widget.

import { isIndianSymbol, toTwelveData, hasIndianDataKey, TWELVE_DATA_API_KEY } from './marketDataConfig';

export { isIndianSymbol, hasIndianDataKey };

const CRYPTO_ID_MAP = {
  'BTC/USD': 'bitcoin', 'ETH/USD': 'ethereum', 'BNB/USD': 'binancecoin',
  'SOL/USD': 'solana', 'XRP/USD': 'ripple', 'ADA/USD': 'cardano',
  'DOGE/USD': 'dogecoin', 'MATIC/USD': 'matic-network', 'DOT/USD': 'polkadot',
  'AVAX/USD': 'avalanche-2',
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin',
  XRP: 'ripple', ADA: 'cardano',
};

const TF_TO_DAYS = { '1m': 1, '5m': 1, '15m': 1, '30m': 1, '1h': 7, '4h': 30, '1d': 365, '1w': 365 };

export function isCryptoSymbol(symbol) {
  return !!CRYPTO_ID_MAP[symbol];
}

export function toCoinGeckoId(symbol) {
  return CRYPTO_ID_MAP[symbol];
}

export const SUPPORTED_CRYPTO = Object.keys(CRYPTO_ID_MAP);

// Real 24h ticker (price + change + high/low + volume) for many crypto symbols.
export async function fetchRealTimePrices(symbols) {
  const ids = symbols.map(toCoinGeckoId).filter(Boolean);
  if (ids.length === 0) return [];
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(',')}&sparkline=false&price_change_percentage=24h`
  );
  if (!res.ok) throw new Error('CoinGecko API error');
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('CoinGecko API error');
  const byId = {};
  data.forEach((d) => { byId[d.id] = d; });
  return symbols
    .map((symbol) => {
      const d = byId[toCoinGeckoId(symbol)];
      if (!d) return null;
      return {
        symbol,
        price: d.current_price,
        change: d.price_change_percentage_24h ?? 0,
        high24h: d.high_24h,
        low24h: d.low_24h,
        volume: d.total_volume,
        timestamp: Date.now(),
      };
    })
    .filter(Boolean);
}

// Real historical OHLC for a crypto symbol (most recent candles for the timeframe).
export async function fetchHistoricalOHLC(symbol, timeframe = '1d', limit = 365) {
  if (isIndianSymbol(symbol)) return fetchIndianHistoricalOHLC(symbol, timeframe, limit);
  const id = toCoinGeckoId(symbol);
  if (!id) throw new Error(`No historical source for ${symbol}`);
  const days = TF_TO_DAYS[timeframe] || 365;
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=${days}`
  );
  if (!res.ok) throw new Error('CoinGecko API error');
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error('No data returned');
  return data.map((c) => ({
    timestamp: c[0],
    time: new Date(c[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    open: c[1],
    high: c[2],
    low: c[3],
    close: c[4],
    volume: null,
  }));
}

// Real historical OHLC for a crypto symbol between two dates (ms timestamps).
export async function fetchHistoricalOHLCRange(symbol, timeframe, startTime, endTime) {
  if (isIndianSymbol(symbol)) return fetchIndianHistoricalOHLCRange(symbol, startTime, endTime);
  const id = toCoinGeckoId(symbol);
  if (!id) throw new Error(`No historical source for ${symbol}`);
  const rangeDays = Math.max(1, Math.ceil((endTime - startTime) / 86400000));
  const days = rangeDays > 365 ? 'max' : rangeDays;
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=${days}`
  );
  if (!res.ok) throw new Error('CoinGecko API error');
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error('No historical data for this range');
  return data
    .filter((c) => c[0] >= startTime && c[0] <= endTime)
    .map((c) => ({
      timestamp: c[0],
      date: new Date(c[0]),
      open: c[1],
      high: c[2],
      low: c[3],
      close: c[4],
      volume: null,
    }));
}

// Real forex spot rates via open.er-api (free, no key, CORS-enabled).
// Rates are relative to USD; the free tier does not provide 24h change.
const FOREX_MAP = {
  'EUR/USD': (r) => 1 / r.EUR,
  'GBP/USD': (r) => 1 / r.GBP,
  'USD/JPY': (r) => r.JPY,
  'AUD/USD': (r) => 1 / r.AUD,
  'USD/CAD': (r) => r.CAD,
  'USD/CHF': (r) => r.CHF,
  'NZD/USD': (r) => 1 / r.NZD,
  'EUR/GBP': (r) => r.GBP / r.EUR,
  'INR/USD': (r) => 1 / r.INR,
};

export function isForexSymbol(symbol) {
  return !!FOREX_MAP[symbol];
}

export async function fetchForexPrices(symbols) {
  const wanted = symbols.filter((s) => FOREX_MAP[s]);
  if (wanted.length === 0) return [];
  const res = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!res.ok) throw new Error('FX API error');
  const data = await res.json();
  const rates = data.rates || {};
  return wanted.map((symbol) => ({
    symbol,
    price: FOREX_MAP[symbol](rates),
    change: null,
    high: null,
    low: null,
    volume: null,
  }));
}

// --- Indian stock market data via Twelve Data (NSE/BSE) ---
// Real-time (EOD) quotes + historical OHLC. Requires a free Twelve Data API
// key (see marketDataConfig.js). NSE feed is end-of-day, so quotes are
// refreshed infrequently — the value only changes once per day after close.

const TD_BASE = 'https://api.twelvedata.com';
const TD_INTERVAL = { '1m': '1min', '5m': '5min', '15m': '15min', '30m': '30min', '1h': '1h', '4h': '4h', '1d': '1day', '1w': '1week' };

// Batched real-time (EOD) quote for Indian stocks/indices.
export async function fetchIndianRealTimePrices(symbols) {
  if (!hasIndianDataKey()) return [];
  const valid = symbols.map((s) => ({ s, td: toTwelveData(s) })).filter((x) => x.td);
  if (valid.length === 0) return [];
  const symStr = valid.map((x) => x.td.symbol).join(',');
  const exStr = valid.map((x) => x.td.exchange).join(',');
  const url = `${TD_BASE}/quote?symbol=${encodeURIComponent(symStr)}&exchange=${encodeURIComponent(exStr)}&apikey=${TWELVE_DATA_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Twelve Data API error');
  const data = await res.json();
  // Batch returns an object keyed by symbol; a single symbol returns an object.
  const entries = Array.isArray(data) ? data.map((d) => [d.symbol, d]) : Object.entries(data);
  const byKey = {};
  entries.forEach(([k, d]) => {
    if (d && d.symbol) byKey[d.symbol] = d;
    if (k) byKey[k] = d;
  });
  return valid
    .map(({ s, td }) => {
      const d = byKey[td.symbol] || byKey[s];
      if (!d || d.status === 'error') return null;
      const price = parseFloat(d.close ?? d.price);
      if (!isFinite(price)) return null;
      const change = d.percent_change != null ? parseFloat(d.percent_change) : null;
      return {
        symbol: s,
        price,
        change,
        high: null,
        low: null,
        volume: d.volume != null ? parseFloat(d.volume) : null,
        timestamp: Date.now(),
      };
    })
    .filter(Boolean);
}

// Historical OHLC for an Indian symbol (most recent `limit` candles, oldest->newest).
export async function fetchIndianHistoricalOHLC(symbol, timeframe = '1d', limit = 365) {
  if (!hasIndianDataKey()) {
    throw new Error('Twelve Data API key required for Indian stocks. Add your free key in src/lib/marketDataConfig.js.');
  }
  const td = toTwelveData(symbol);
  if (!td) throw new Error(`No Indian mapping for ${symbol}`);
  const interval = TD_INTERVAL[timeframe] || '1day';
  const url = `${TD_BASE}/time_series?symbol=${encodeURIComponent(td.symbol)}&exchange=${encodeURIComponent(td.exchange)}&interval=${interval}&outputsize=${limit}&apikey=${TWELVE_DATA_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Twelve Data API error');
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.message || 'Twelve Data error');
  const values = (data.values || []).slice().reverse(); // API returns newest-first
  if (values.length === 0) throw new Error(`No historical data for ${symbol}`);
  return values.map((v) => ({
    timestamp: new Date(v.datetime).getTime(),
    time: new Date(v.datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    open: parseFloat(v.open),
    high: parseFloat(v.high),
    low: parseFloat(v.low),
    close: parseFloat(v.close),
    volume: v.volume != null ? parseFloat(v.volume) : null,
  }));
}

// Historical OHLC for an Indian symbol between two dates (ms timestamps).
export async function fetchIndianHistoricalOHLCRange(symbol, startTime, endTime) {
  if (!hasIndianDataKey()) {
    throw new Error('Twelve Data API key required for Indian stocks. Add your free key in src/lib/marketDataConfig.js.');
  }
  const td = toTwelveData(symbol);
  if (!td) throw new Error(`No Indian mapping for ${symbol}`);
  const startDate = new Date(startTime).toISOString().slice(0, 10);
  const endDate = new Date(endTime).toISOString().slice(0, 10);
  const url = `${TD_BASE}/time_series?symbol=${encodeURIComponent(td.symbol)}&exchange=${encodeURIComponent(td.exchange)}&interval=1day&start_date=${startDate}&end_date=${endDate}&apikey=${TWELVE_DATA_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Twelve Data API error');
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.message || 'Twelve Data error');
  const values = (data.values || []).slice().reverse();
  if (values.length === 0) throw new Error('No historical data for this range');
  return values.map((v) => ({
    timestamp: new Date(v.datetime).getTime(),
    date: new Date(v.datetime),
    open: parseFloat(v.open),
    high: parseFloat(v.high),
    low: parseFloat(v.low),
    close: parseFloat(v.close),
    volume: v.volume != null ? parseFloat(v.volume) : null,
  }));
}