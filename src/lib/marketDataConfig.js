// Twelve Data — reliable provider for Indian stock market data (NSE/BSE).
// Free tier: 800 credits/day, 8 req/min. The NSE feed is end-of-day (EOD):
// prices update once daily after the market close, so we fetch infrequently.
// Get a free key at https://twelvedata.com/ and paste it below.
export const TWELVE_DATA_API_KEY = '';

// App symbol -> Twelve Data { symbol, exchange }.
const INDIAN_MAP = {
  RELIANCE: { symbol: 'RELIANCE', exchange: 'NSE' },
  TCS: { symbol: 'TCS', exchange: 'NSE' },
  HDFCBANK: { symbol: 'HDFCBANK', exchange: 'NSE' },
  INFY: { symbol: 'INFY', exchange: 'NSE' },
  ICICIBANK: { symbol: 'ICICIBANK', exchange: 'NSE' },
  HINDUNILVR: { symbol: 'HINDUNILVR', exchange: 'NSE' },
  ITC: { symbol: 'ITC', exchange: 'NSE' },
  SBIN: { symbol: 'SBIN', exchange: 'NSE' },
  BHARTIARTL: { symbol: 'BHARTIARTL', exchange: 'NSE' },
  WIPRO: { symbol: 'WIPRO', exchange: 'NSE' },
  LT: { symbol: 'LT', exchange: 'NSE' },
  MARUTI: { symbol: 'MARUTI', exchange: 'NSE' },
  AXISBANK: { symbol: 'AXISBANK', exchange: 'NSE' },
  ASIANPAINT: { symbol: 'ASIANPAINT', exchange: 'NSE' },
  BAJFINANCE: { symbol: 'BAJFINANCE', exchange: 'NSE' },
  TATAMOTORS: { symbol: 'TATAMOTORS', exchange: 'NSE' },
  // Indices (best-effort via NSEI / BSE)
  NIFTY50: { symbol: 'NIFTY 50', exchange: 'NSEI' },
  NIFTYBANK: { symbol: 'NIFTY BANK', exchange: 'NSEI' },
  SENSEX: { symbol: 'SENSEX', exchange: 'BSE' },
};

export function isIndianSymbol(symbol) {
  return !!INDIAN_MAP[symbol];
}

export function toTwelveData(symbol) {
  return INDIAN_MAP[symbol];
}

export function hasIndianDataKey() {
  return typeof TWELVE_DATA_API_KEY === 'string' && TWELVE_DATA_API_KEY.trim().length >= 8;
}