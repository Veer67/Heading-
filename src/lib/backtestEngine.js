// Backtesting engine on REAL historical data (Binance) with correct indicator math.
import { fetchHistoricalOHLCRange, isCryptoSymbol, isIndianSymbol } from './marketData';
import { sma, rsi } from './indicators';

export class BacktestEngine {
  constructor(strategy, symbol, startDate, endDate, initialCapital = 10000) {
    this.strategy = strategy;
    this.symbol = symbol;
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    this.initialCapital = initialCapital;
    this.currentCapital = initialCapital;
    this.positions = [];
    this.trades = [];
    this.equityCurve = [];
  }

  async loadData() {
    if (!isCryptoSymbol(this.symbol) && !isIndianSymbol(this.symbol)) {
      throw new Error(
        `Real historical data is only available for crypto and Indian stocks. "${this.symbol}" is not supported yet.`
      );
    }
    return await fetchHistoricalOHLCRange(
      this.symbol,
      '1d',
      this.startDate.getTime(),
      this.endDate.getTime()
    );
  }

  async run() {
    const historicalData = await this.loadData();
    if (historicalData.length < 60) {
      throw new Error('Not enough historical data in this range (need 60+ daily candles). Try a wider date range.');
    }

    // Precompute indicators correctly over the growing series.
    const closes = historicalData.map((c) => c.close);
    const enriched = historicalData.map((c, i) => ({
      ...c,
      sma20: sma(closes.slice(0, i + 1), 20),
      sma50: sma(closes.slice(0, i + 1), 50),
      rsi: rsi(closes.slice(0, i + 1), 14),
    }));

    let currentPosition = null;
    const equity = [{ date: enriched[0].date, value: this.initialCapital }];

    enriched.forEach((candle, index) => {
      if (index < 50) {
        equity.push({ date: candle.date, value: this.currentCapital });
        return;
      }
      const signal = this.generateSignal(enriched, index);

      if (signal === 'buy' && !currentPosition) {
        const shares = Math.floor(this.currentCapital / candle.close);
        if (shares > 0) {
          currentPosition = {
            type: 'long',
            entryPrice: candle.close,
            entryDate: candle.date,
            shares,
            entryCapital: this.currentCapital,
          };
        }
      } else if (signal === 'sell' && currentPosition) {
        const exitValue = currentPosition.shares * candle.close;
        const profit = exitValue - currentPosition.shares * currentPosition.entryPrice;
        const profitPercent = (profit / (currentPosition.shares * currentPosition.entryPrice)) * 100;
        this.currentCapital = exitValue;
        this.trades.push({
          entry: currentPosition.entryDate,
          exit: candle.date,
          entryPrice: currentPosition.entryPrice,
          exitPrice: candle.close,
          shares: currentPosition.shares,
          profit,
          profitPercent,
          result: profit > 0 ? 'win' : 'loss',
        });
        currentPosition = null;
      }

      const currentEquity = currentPosition ? currentPosition.shares * candle.close : this.currentCapital;
      equity.push({ date: candle.date, value: currentEquity });
    });

    if (currentPosition) {
      const last = enriched[enriched.length - 1];
      this.currentCapital = currentPosition.shares * last.close;
    }

    this.equityCurve = equity;
    return this.calculateMetrics();
  }

  generateSignal(data, index) {
    const current = data[index];
    const prev = data[index - 1];
    if (current.sma20 == null || current.sma50 == null || prev.sma20 == null || prev.sma50 == null) return 'hold';
    if (current.sma20 > current.sma50 && prev.sma20 <= prev.sma50) return 'buy'; // Golden cross
    if (current.sma20 < current.sma50 && prev.sma20 >= prev.sma50) return 'sell'; // Death cross
    if (current.rsi != null) {
      if (current.rsi < 30) return 'buy'; // Oversold
      if (current.rsi > 70) return 'sell'; // Overbought
    }
    return 'hold';
  }

  calculateMetrics() {
    const totalReturn = ((this.currentCapital - this.initialCapital) / this.initialCapital) * 100;

    let peak = this.equityCurve[0].value;
    let maxDrawdown = 0;
    this.equityCurve.forEach((point) => {
      if (point.value > peak) peak = point.value;
      const drawdown = ((peak - point.value) / peak) * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    const returns = [];
    for (let i = 1; i < this.equityCurve.length; i++) {
      const dailyReturn = (this.equityCurve[i].value - this.equityCurve[i - 1].value) / this.equityCurve[i - 1].value;
      returns.push(dailyReturn);
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
    const sharpeRatio = (avgReturn / (stdDev || 1)) * Math.sqrt(252);

    const winningTrades = this.trades.filter((t) => t.result === 'win');
    const losingTrades = this.trades.filter((t) => t.result === 'loss');
    const winRate = this.trades.length > 0 ? (winningTrades.length / this.trades.length) * 100 : 0;

    const avgWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.profit, 0) / winningTrades.length
      : 0;
    const avgLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0) / losingTrades.length)
      : 0;

    const totalWins = winningTrades.reduce((sum, t) => sum + t.profit, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 999 : 0;

    return {
      initial_capital: this.initialCapital,
      final_capital: this.currentCapital,
      total_return: totalReturn,
      max_drawdown: maxDrawdown,
      sharpe_ratio: sharpeRatio,
      win_rate: winRate,
      total_trades: this.trades.length,
      winning_trades: winningTrades.length,
      losing_trades: losingTrades.length,
      avg_win: avgWin,
      avg_loss: avgLoss,
      profit_factor: profitFactor,
      equity_curve: this.equityCurve,
      trades: this.trades,
    };
  }
}