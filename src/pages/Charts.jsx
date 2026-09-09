import React, { useState } from 'react';
import TradingViewWidget from '../components/charts/TradingViewWidget';
import ChartControls from '../components/charts/ChartControls';
import MarketSymbols from '../components/charts/MarketSymbols';
import LiveMarketDashboard from '../components/dashboard/LiveMarketDashboard';
import IndianMarketOverview from '../components/charts/IndianMarketOverview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3 } from 'lucide-react';
import { useSEO } from '@/lib/useSEO';

export default function Charts() {
  useSEO({
    title: 'Live Trading Charts',
    description: 'Real-time trading charts with candlesticks, technical indicators, and live market data for stocks, crypto, forex, and commodities on Trade AI Zotra.',
    keywords: 'live trading charts, candlestick charts, technical indicators, market data, real-time charts, Trade AI Zotra charts',
  });

  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD');
  const [chartType, setChartType] = useState('candlestick');
  const [timeframe, setTimeframe] = useState('1h');
  const [showVolume, setShowVolume] = useState(true);
  const [indicators, setIndicators] = useState({
    sma20: false,
    sma50: false,
    ema: false,
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[140rem] mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Live Trading Charts</h1>
        </div>

        {/* Indian Market — real NSE/BSE data via TradingView (no API key) */}
        <Card className="mb-6 border-primary/20 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-primary/15 bg-primary/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-emerald-400 uppercase">Indian Market · Live · TradingView</span>
          </div>
          <div className="h-[420px] w-full p-2">
            <IndianMarketOverview />
          </div>
        </Card>

        <Tabs defaultValue="charts" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="charts">Advanced Charts</TabsTrigger>
            <TabsTrigger value="dashboard">Live Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="charts">
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
              {/* Sidebar - Market Symbols */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-lg">Markets</CardTitle>
                </CardHeader>
                <CardContent>
                  <MarketSymbols
                    selectedSymbol={selectedSymbol}
                    onSymbolSelect={setSelectedSymbol}
                  />
                </CardContent>
              </Card>

              {/* Main Chart Area */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <ChartControls
                      chartType={chartType}
                      setChartType={setChartType}
                      timeframe={timeframe}
                      setTimeframe={setTimeframe}
                      showVolume={showVolume}
                      setShowVolume={setShowVolume}
                      indicators={indicators}
                      setIndicators={setIndicators}
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="h-[600px] w-full">
                      <TradingViewWidget
                        symbol={selectedSymbol}
                        chartType={chartType}
                        timeframe={timeframe}
                        showVolume={showVolume}
                        indicators={indicators}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dashboard">
            <LiveMarketDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}