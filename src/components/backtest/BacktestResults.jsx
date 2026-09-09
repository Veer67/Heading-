import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Activity, DollarSign, Percent } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function BacktestResults({ results, backtest }) {
  if (!results) return null;

  const MetricCard = ({ title, value, icon: Icon, positive, trend }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
            <p className={`text-2xl font-bold ${
              positive !== undefined 
                ? positive ? 'text-green-500' : 'text-red-500'
                : 'text-foreground'
            }`}>
              {value}
            </p>
            {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            positive !== undefined
              ? positive ? 'bg-green-500/10' : 'bg-red-500/10'
              : 'bg-primary/10'
          }`}>
            <Icon className={`w-5 h-5 ${
              positive !== undefined
                ? positive ? 'text-green-500' : 'text-red-500'
                : 'text-primary'
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">{backtest.strategy_name}</h3>
          <p className="text-sm text-muted-foreground">
            {backtest.symbol} · {format(new Date(backtest.start_date), 'MMM d, yyyy')} - {format(new Date(backtest.end_date), 'MMM d, yyyy')}
          </p>
        </div>
        <Badge variant={results.total_return > 0 ? 'default' : 'destructive'} className="text-lg px-4 py-2">
          {results.total_return > 0 ? '+' : ''}{results.total_return.toFixed(2)}%
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Return"
          value={`${results.total_return > 0 ? '+' : ''}${results.total_return.toFixed(2)}%`}
          icon={TrendingUp}
          positive={results.total_return > 0}
        />
        <MetricCard
          title="Max Drawdown"
          value={`${results.max_drawdown.toFixed(2)}%`}
          icon={TrendingDown}
          positive={results.max_drawdown < 10}
        />
        <MetricCard
          title="Sharpe Ratio"
          value={results.sharpe_ratio.toFixed(2)}
          icon={Activity}
          positive={results.sharpe_ratio > 1}
        />
        <MetricCard
          title="Win Rate"
          value={`${results.win_rate.toFixed(1)}%`}
          icon={Target}
          positive={results.win_rate > 50}
        />
        <MetricCard
          title="Profit Factor"
          value={results.profit_factor.toFixed(2)}
          icon={DollarSign}
          positive={results.profit_factor > 1.5}
        />
        <MetricCard
          title="Total Trades"
          value={results.total_trades}
          icon={Percent}
          trend={`${results.winning_trades}W / ${results.losing_trades}L`}
        />
      </div>

      {/* Equity Curve */}
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={results.equity_curve}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-card/95 backdrop-blur-sm border border-border p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">
                          {format(new Date(payload[0].payload.date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm font-semibold">
                          ${payload[0].value.toFixed(2)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Trade Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Avg Win</p>
              <p className="text-lg font-bold text-green-500">${results.avg_win.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Avg Loss</p>
              <p className="text-lg font-bold text-red-500">-${results.avg_loss.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Initial Capital</p>
              <p className="text-lg font-bold">${results.initial_capital.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Final Capital</p>
              <p className={`text-lg font-bold ${
                results.final_capital > results.initial_capital ? 'text-green-500' : 'text-red-500'
              }`}>
                ${results.final_capital.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}