import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Play } from 'lucide-react';
import { format } from 'date-fns';

export default function BacktestForm({ strategies, onRun, isRunning }) {
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [symbol, setSymbol] = useState('BTC/USD');
  const [startDate, setStartDate] = useState(new Date(2023, 0, 1));
  const [endDate, setEndDate] = useState(new Date());
  const [initialCapital, setInitialCapital] = useState(10000);

  const handleSubmit = (e) => {
    e.preventDefault();
    const strategy = strategies.find(s => s.id === selectedStrategy);
    if (!strategy) return;

    onRun({
      strategy,
      symbol,
      startDate,
      endDate,
      initialCapital,
    });
  };

  const symbols = [
    'BTC/USD', 'ETH/USD', 'SOL/USD', 'BNB/USD', 'XRP/USD', 'ADA/USD', 'DOGE/USD', 'DOT/USD',
    'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'ITC', 'BHARTIARTL', 'TATAMOTORS',
    'NIFTY50', 'SENSEX',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Strategy</Label>
        <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
          <SelectTrigger>
            <SelectValue placeholder="Select a strategy to backtest" />
          </SelectTrigger>
          <SelectContent>
            {strategies.map(strategy => (
              <SelectItem key={strategy.id} value={strategy.id}>
                {strategy.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Symbol</Label>
        <Select value={symbol} onValueChange={setSymbol}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {symbols.map(sym => (
              <SelectItem key={sym} value={sym}>
                {sym}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[10px] font-mono text-muted-foreground">Real historical data — crypto via CoinGecko, Indian stocks via Twelve Data.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(startDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(endDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Initial Capital ($)</Label>
        <Input
          type="number"
          value={initialCapital}
          onChange={(e) => setInitialCapital(Number(e.target.value))}
          min={100}
          step={100}
        />
      </div>

      <Button type="submit" disabled={!selectedStrategy || isRunning} className="w-full">
        <Play className="w-4 h-4 mr-2" />
        {isRunning ? 'Running Backtest...' : 'Run Backtest'}
      </Button>
    </form>
  );
}