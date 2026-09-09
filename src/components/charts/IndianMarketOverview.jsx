import { useEffect, useRef, memo } from 'react';

// Real Indian market data (NSE/BSE) streamed from TradingView's servers via
// their free market-overview embed — no API key, no backend. Shows live
// indices and top stocks with prices, change, and a sparkline.
const CONFIG = {
  colorTheme: 'dark',
  dateRange: '12M',
  showChart: true,
  locale: 'en',
  largeChartUrl: '',
  isTransparent: true,
  showSymbolLogo: true,
  width: '100%',
  height: '100%',
  plotLineColorGrowing: 'rgba(59, 130, 246, 1)',
  plotLineColorFalling: 'rgba(239, 68, 68, 1)',
  gridLineColor: 'rgba(233, 233, 233, 1)',
  scaleFontColor: 'rgba(120, 123, 134, 1)',
  belowLineFillColorGrowing: 'rgba(59, 130, 246, 0.12)',
  belowLineFillColorFalling: 'rgba(239, 68, 68, 0.12)',
  symbolActiveColor: 'rgba(59, 130, 246, 0.12)',
  tabs: [
    {
      title: 'Indices',
      symbols: [
        { s: 'NSE:NIFTY', d: 'Nifty 50' },
        { s: 'BSE:SENSEX', d: 'Sensex' },
        { s: 'NSE:NIFTY BANK', d: 'Nifty Bank' },
      ],
    },
    {
      title: 'Top Stocks',
      symbols: [
        { s: 'NSE:RELIANCE', d: 'Reliance' },
        { s: 'NSE:TCS', d: 'TCS' },
        { s: 'NSE:INFY', d: 'Infosys' },
        { s: 'NSE:HDFCBANK', d: 'HDFC Bank' },
        { s: 'NSE:ICICIBANK', d: 'ICICI Bank' },
        { s: 'NSE:SBIN', d: 'SBI' },
        { s: 'NSE:BHARTIARTL', d: 'Bharti Airtel' },
        { s: 'NSE:ITC', d: 'ITC' },
      ],
    },
  ],
};

function IndianMarketOverviewInner() {
  const container = useRef(null);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    el.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify(CONFIG);
    el.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: '100%', width: '100%' }}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}

export default memo(IndianMarketOverviewInner);