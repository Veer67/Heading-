import { motion } from 'framer-motion';
import { useSEO } from '@/lib/useSEO';
import { TrendingUp, Zap, BarChart3, FlaskConical, Shield, Users } from 'lucide-react';

export default function About() {
  useSEO({
    title: 'About',
    description: 'Trade AI Zotra is an AI-powered trading analysis platform providing intelligent chart analysis, technical indicators, and advanced trading tools for modern traders.',
    keywords: 'Trade AI Zotra, AI trading platform, trading analysis, about Trade AI Zotra, AI trading tools',
  });
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-primary uppercase">About the Platform</span>
          </div>
          <h1 className="text-4xl font-black tracking-widest shimmer-text mb-4">Trade AI Zotra</h1>
          <p className="text-muted-foreground text-sm font-mono">AI-powered trading intelligence for modern traders</p>
        </div>

        {/* About text */}
        <div className="space-y-5 text-foreground/80 leading-relaxed mb-10">
          <p>
            <strong className="text-foreground">Trade AI Zotra</strong> is an advanced AI-driven trading analysis platform built for retail traders, swing traders, day traders, and options enthusiasts who want an intelligent edge in the financial markets. Whether you are analyzing stocks, cryptocurrencies, forex, or commodities, our platform provides institutional-grade technical analysis at the click of a button.
          </p>
          <p>
            At its core, Trade AI Zotra harnesses the power of leading large language models — including Claude Sonnet, GPT-5, and Gemini — to interpret uploaded chart images and generate precise trading signals. The AI detects chart patterns, support and resistance levels, candlestick formations, trend lines, and momentum indicators, then delivers actionable recommendations with confidence scores, entry prices, stop losses, and take-profit targets.
          </p>
          <p>
            Beyond chart analysis, the platform features a full <strong className="text-foreground">Paper Trading</strong> simulator with a virtual $100,000 portfolio, letting you practice executing trades risk-free with live-simulated price data. Strategy management tools help you document, track, and backtest your trading systems over historical data, giving you performance metrics like Sharpe ratio, win rate, and maximum drawdown.
          </p>
          <p>
            Trade AI Zotra is built by a passionate team of developers and traders who believe that cutting-edge AI should be accessible to every trader — not just hedge funds. We are continuously improving the platform with new models, indicators, and features. Our mission is simple: empower every trader to make smarter, more confident decisions.
          </p>
        </div>

        {/* Feature highlights */}
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground/50 uppercase mb-4">What We Offer</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Zap, label: 'AI Chart Analysis', desc: 'Instant signals from top AI models', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
              { icon: FlaskConical, label: 'Paper Trading', desc: 'Risk-free virtual trading simulator', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
              { icon: BarChart3, label: 'Live Charts', desc: 'Real-time market data & candlesticks', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { icon: Shield, label: 'Backtesting', desc: 'Validate strategies on historical data', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
              { icon: TrendingUp, label: 'Strategy Builder', desc: 'Create and manage trading strategies', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
              { icon: Users, label: 'AI Chat', desc: 'Your personal AI trading assistant', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className={`rounded-xl p-4 border bg-card flex items-start gap-3 border-border/50`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </motion.div>
    </div>
  );
}