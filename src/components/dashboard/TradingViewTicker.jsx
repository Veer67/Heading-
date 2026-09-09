import { useEffect, useRef, memo } from 'react';

// Real, live market quotes streamed from TradingView's servers via their
// free ticker-tape embed. No API key, no backend, no CORS — covers stocks,
// indices, commodities, forex, and crypto that we otherwise can't price
// client-side without a paid data feed.
const SYMBOLS = [
  { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
  { proName: 'FOREXCOM:NSXUSD', title: 'Nasdaq 100' },
  { proName: 'FOREXCOM:DJI', title: 'Dow Jones' },
  { proName: 'TVC:VIX', title: 'VIX' },
  { proName: 'NASDAQ:AAPL', title: 'Apple' },
  { proName: 'NASDAQ:TSLA', title: 'Tesla' },
  { proName: 'NASDAQ:NVDA', title: 'Nvidia' },
  { proName: 'NASDAQ:MSFT', title: 'Microsoft' },
  { proName: 'NYSE:JPM', title: 'JPMorgan' },
  { proName: 'TVC:GOLD', title: 'Gold' },
  { proName: 'TVC:SILVER', title: 'Silver' },
  { proName: 'TVC:USOIL', title: 'Crude Oil' },
  { proName: 'TVC:UKOIL', title: 'Brent' },
  { proName: 'TVC:DXY', title: 'Dollar Index' },
  { proName: 'FX:EURUSD', title: 'EUR/USD' },
  { proName: 'FX:GBPUSD', title: 'GBP/USD' },
  { proName: 'FX:USDJPY', title: 'USD/JPY' },
  { proName: 'BINANCE:BTCUSDT', title: 'Bitcoin' },
  { proName: 'BINANCE:ETHUSDT', title: 'Ethereum' },
  { proName: 'NSE:NIFTY', title: 'Nifty 50' },
  { proName: 'BSE:SENSEX', title: 'Sensex' },
];

function TradingViewTickerInner() {
  const container = useRef(null);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    el.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: SYMBOLS,
      showSymbolLogo: true,
      colorTheme: 'dark',
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'en',
    });
    el.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: '46px', width: '100%', overflow: 'hidden' }}>
      <div className="tradingview-widget-container__widget" style={{ height: '46px' }} />
    </div>
  );
}

export default memo(TradingViewTickerInner);