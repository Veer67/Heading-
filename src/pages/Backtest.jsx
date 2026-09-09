import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import BacktestForm from '../components/backtest/BacktestForm';
import BacktestResults from '../components/backtest/BacktestResults';
import { BacktestEngine } from '../lib/backtestEngine';
import { useToast } from '@/components/ui/use-toast';
import { useSEO } from '@/lib/useSEO';

export default function Backtest() {
  useSEO({
    title: 'Strategy Backtesting',
    description: 'Backtest your trading strategies on historical data with Trade AI Zotra. Get performance metrics including Sharpe ratio, win rate, and max drawdown.',
    keywords: 'backtesting, strategy backtest, trading simulation, Sharpe ratio, historical performance, Trade AI Zotra backtest',
  });

  const [currentBacktest, setCurrentBacktest] = useState(null);
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.Strategy.list('-created_date', 100),
  });

  const { data: backtests = [] } = useQuery({
    queryKey: ['backtests'],
    queryFn: () => base44.entities.Backtest.list('-created_date', 50),
  });

  const saveBacktestMutation = useMutation({
    mutationFn: (backtestData) => base44.entities.Backtest.create(backtestData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backtests'] });
      toast({
        title: 'Backtest Saved',
        description: 'Your backtest results have been saved successfully.',
      });
    },
  });

  const handleRunBacktest = async (config) => {
    setRunning(true);
    try {
      const engine = new BacktestEngine(
        config.strategy,
        config.symbol,
        config.startDate,
        config.endDate,
        config.initialCapital
      );

      const backtestResults = await engine.run();
      setResults(backtestResults);

      const backtestRecord = {
        strategy_id: config.strategy.id,
        strategy_name: config.strategy.name,
        symbol: config.symbol,
        start_date: config.startDate.toISOString().split('T')[0],
        end_date: config.endDate.toISOString().split('T')[0],
        ...backtestResults,
      };

      setCurrentBacktest(backtestRecord);
      saveBacktestMutation.mutate(backtestRecord);

      toast({
        title: 'Backtest Complete',
        description: `Simulation ran ${backtestResults.total_trades} trades with ${backtestResults.total_return.toFixed(2)}% return.`,
      });
    } catch (error) {
      toast({
        title: 'Backtest Failed',
        description: error?.message || 'An error occurred while running the backtest.',
        variant: 'destructive',
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[140rem] mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Activity className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Strategy Backtesting</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
          {/* Backtest Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configure Backtest</CardTitle>
            </CardHeader>
            <CardContent>
              <BacktestForm
                strategies={strategies}
                onRun={handleRunBacktest}
                isRunning={running || saveBacktestMutation.isPending}
              />
            </CardContent>
          </Card>

          {/* Results */}
          <div>
            {results ? (
              <BacktestResults results={results} backtest={currentBacktest} />
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Run Your First Backtest</h3>
                  <p className="text-muted-foreground max-w-md">
                    Select a strategy and configure the parameters to simulate historical performance.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Historical Backtests */}
        {backtests.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Backtest History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {backtests.map((bt) => (
                <Card key={bt.id} className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => {
                    setCurrentBacktest(bt);
                    setResults(bt);
                  }}
                >
                  <CardContent className="pt-6">
                    <h3 className="font-bold mb-1">{bt.strategy_name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {bt.symbol} · {new Date(bt.start_date).toLocaleDateString()} - {new Date(bt.end_date).toLocaleDateString()}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Return</p>
                        <p className={`font-bold ${bt.total_return > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {bt.total_return > 0 ? '+' : ''}{bt.total_return?.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sharpe</p>
                        <p className="font-bold">{bt.sharpe_ratio?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Trades</p>
                        <p className="font-bold">{bt.total_trades}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}