import React, { useEffect, useRef, useState } from 'react';

// Map app symbols -> TradingView symbols (exchange:ticker)
const SYMBOL_MAP = {
  // Crypto
  'BTC/USD': 'BINANCE:BTCUSDT',
  'ETH/USD': 'BINANCE:ETHUSDT',
  'BNB/USD': 'BINANCE:BNBUSDT',
  'SOL/USD': 'BINANCE:SOLUSDT',
  'XRP/USD': 'BINANCE:XRPUSDT',
  'ADA/USD': 'BINANCE:ADAUSDT',
  'DOGE/USD': 'BINANCE:DOGEUSDT',
  'MATIC/USD': 'BINANCE:MATICUSDT',
  'DOT/USD': 'BINANCE:DOTUSDT',
  'AVAX/USD': 'BINANCE:AVAXUSDT',
  // Bare tickers used by Paper Trading
  BTC: 'BINANCE:BTCUSDT',
  ETH: 'BINANCE:ETHUSDT',
  SOL: 'BINANCE:SOLUSDT',
  SPY: 'SP:SPY',
  QQQ: 'NASDAQ:QQQ',
  // US Stocks
  AAPL: 'NASDAQ:AAPL',
  MSFT: 'NASDAQ:MSFT',
  GOOGL: 'NASDAQ:GOOGL',
  AMZN: 'NASDAQ:AMZN',
  META: 'NASDAQ:META',
  NVDA: 'NASDAQ:NVDA',
  TSLA: 'NASDAQ:TSLA',
  NFLX: 'NASDAQ:NFLX',
  AMD: 'NASDAQ:AMD',
  INTC: 'NASDAQ:INTC',
  // Forex
  'EUR/USD': 'FX:EURUSD',
  'GBP/USD': 'FX:GBPUSD',
  'USD/JPY': 'FX:USDJPY',
  'AUD/USD': 'FX:AUDUSD',
  'USD/CAD': 'FX:USDCAD',
  'USD/CHF': 'FX:USDCHF',
  'NZD/USD': 'FX:NZDUSD',
  'EUR/GBP': 'FX:EURGBP',
  'INR/USD': 'FX:USDINR',
  // Commodities
  GOLD: 'OANDA:XAUUSD',
  SILVER: 'OANDA:XAGUSD',
  CRUDE_OIL: 'TVC:USOIL',
  NATURAL_GAS: 'TVC:NATGAS',
  COPPER: 'NYMEX:HG1!',
  PLATINUM: 'TVC:PLATIN',
  // Indices
  SPX: 'SP:SPX',
  DJI: 'DJ:DJI',
  IXIC: 'NASDAQ:IXIC',
  FTSE: 'TVC:FTSE',
  DAX: 'TVC:DAX',
  NIKKEI: 'TVC:NI225',
  HSI: 'TVC:HSI',
  // Indian
  NIFTY50: 'NSE:NIFTY',
  SENSEX: 'BSE:SENSEX',
  RELIANCE: 'NSE:RELIANCE',
  TCS: 'NSE:TCS',
  HDFCBANK: 'NSE:HDFCBANK',
  INFY: 'NSE:INFY',
  ICICIBANK: 'NSE:ICICIBANK',
  HINDUNILVR: 'NSE:HINDUNILVR',
  ITC: 'NSE:ITC',
  SBIN: 'NSE:SBIN',
  BHARTIARTL: 'NSE:BHARTIARTL',
  WIPRO: 'NSE:WIPRO',
  LT: 'NSE:LT',
  MARUTI: 'NSE:MARUTI',
  AXISBANK: 'NSE:AXISBANK',
  ASIANPAINT: 'NSE:ASIANPAINT',
  BAJFINANCE: 'NSE:BAJFINANCE',
  TATAMOTORS: 'NSE:TATAMOTORS',
  NIFTYBANK: 'NSE:NIFTY BANK',
};

const INTERVAL_MAP = {
  '1m': '1', '5m': '5', '15m': '15', '30m': '30',
  '1h': '60', '4h': '240', '1d': 'D', '1w': 'W', '1M': 'M',
};

// TradingView chart style ids
const STYLE_MAP = { candlestick: '1', line: '2', area: '3', bar: '0' };

function toTvSymbol(symbol) {
  if (SYMBOL_MAP[symbol]) return SYMBOL_MAP[symbol];
  // Fallback: treat "X/USD" crypto as Binance X-USDT
  if (symbol.includes('/USD')) return `BINANCE:${symbol.replace('/', '')}USDT`;
  return symbol.replace('/', '');
}

function buildStudies(indicators, showVolume) {
  const studies = [];
  if (showVolume) studies.push('STD;Volume');
  if (indicators?.sma20 || indicators?.sma50) studies.push('STD;SMA');
  if (indicators?.ema) studies.push('STD;EMA');
  return studies;
}

export default function TradingViewWidget({ symbol, chartType, timeframe, indicators, showVolume }) {
  const containerRef = useRef(null);
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('light') ? 'light' : 'dark'
  );

  // Keep the widget theme in sync with the app theme toggle
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const tvSymbol = toTvSymbol(symbol);
  const interval = INTERVAL_MAP[timeframe] || '60';
  const style = STYLE_MAP[chartType] || '1';
  const studies = buildStudies(indicators, showVolume);
  const configKey = `${tvSymbol}|${interval}|${style}|${theme}|${studies.join(',')}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    widget.style.height = '100%';
    widget.style.width = '100%';
    container.appendChild(widget);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval,
      timezone: 'Etc/UTC',
      theme,
      style,
      locale: 'en',
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      withdateranges: true,
      studies,
      support_host: 'https://www.tradingview.com',
    });
    container.appendChild(script);

    return () => { container.innerHTML = ''; };
  }, [configKey]);

  return (
    <div
      className="tradingview-widget-container"
      ref={containerRef}
      style={{ height: '100%', width: '100%' }}
    />
  );
}