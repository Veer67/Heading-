import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  CandlestickChart,
  Activity,
  TrendingUp,
  Volume2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ChartControls = ({ 
  chartType, 
  setChartType, 
  timeframe, 
  setTimeframe,
  showVolume,
  setShowVolume,
  indicators,
  setIndicators
}) => {
  const chartTypes = [
    { value: 'candlestick', label: 'Candlestick', icon: CandlestickChart },
    { value: 'line', label: 'Line', icon: LineChartIcon },
    { value: 'area', label: 'Area', icon: AreaChartIcon },
    { value: 'bar', label: 'Bar', icon: BarChart3 },
  ];

  const ChartIcon = chartTypes.find(t => t.value === chartType)?.icon;

  const timeframes = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '1d', label: '1 Day' },
    { value: '1w', label: '1 Week' },
    { value: '1M', label: '1 Month' },
  ];

  const toggleIndicator = (indicator) => {
    setIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Chart Type Selection */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Chart Type:</span>
        <div className="flex gap-2">
          {chartTypes.map((type) => {
            const TypeIcon = type.icon;
            return (
              <Button
                key={type.value}
                variant={chartType === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType(type.value)}
                className="gap-2"
              >
                <TypeIcon className="w-4 h-4" />
                {type.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Timeframe Selection */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Timeframe:</span>
        <div className="flex gap-2 flex-wrap">
          {timeframes.map(({ value, label }) => (
            <Button
              key={value}
              variant={timeframe === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Indicators:</span>
        <Badge
          variant={indicators.sma20 ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-primary/80 transition-colors"
          onClick={() => toggleIndicator('sma20')}
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          SMA 20
        </Badge>
        <Badge
          variant={indicators.sma50 ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-primary/80 transition-colors"
          onClick={() => toggleIndicator('sma50')}
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          SMA 50
        </Badge>
        <Badge
          variant={indicators.ema ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-primary/80 transition-colors"
          onClick={() => toggleIndicator('ema')}
        >
          <Activity className="w-3 h-3 mr-1" />
          EMA 12
        </Badge>
        <Badge
          variant={showVolume ? 'default' : 'outline'}
          className="cursor-pointer hover:bg-primary/80 transition-colors"
          onClick={() => setShowVolume(!showVolume)}
        >
          <Volume2 className="w-3 h-3 mr-1" />
          Volume
        </Badge>
      </div>
    </div>
  );
};

export default ChartControls;