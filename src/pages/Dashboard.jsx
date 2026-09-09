import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/lib/useSEO';
import {
  LineChart, Target, TrendingUp, Percent, Zap, ArrowUpRight,
  BarChart3, Activity, Newspaper, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';
import RecentAnalyses from '../components/dashboard/RecentAnalyses';
import ActiveStrategies from '../components/dashboard/ActiveStrategies';
import LearningProgressWidget from '../components/dashboard/LearningProgressWidget';
import TradingViewTicker from '../components/dashboard/TradingViewTicker';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const QUICK_LINKS = [
  { to: '/Analyze', label: 'AI Analysis', sub: 'Upload & analyze charts', icon: Zap, accent: 'blue' },
  { to: '/Charts', label: 'Live Charts', sub: 'Real-time market data', icon: BarChart3, accent: 'green' },
  { to: '/Backtest', label: 'Backtesting', sub: 'Test your strategies', icon: Activity, accent: 'purple' },
  { to: '/MarketNews', label: 'Market News', sub: 'Live financial news', icon: Newspaper, accent: 'blue' },
  { to: '/Chat', label: 'AI Chat', sub: 'Ask your AI trader', icon: MessageSquare, accent: 'purple' },
];

const accentMap = {
  blue:   { border: 'border-blue-500/20',   icon: 'text-blue-400',   bg: 'bg-blue-500/8',    hover: 'hover:border-blue-500/40' },
  green:  { border: 'border-emerald-500/20', icon: 'text-emerald-400', bg: 'bg-emerald-500/8', hover: 'hover:border-emerald-500/40' },
  purple: { border: 'border-purple-500/20',  icon: 'text-purple-400',  bg: 'bg-purple-500/8',  hover: 'hover:border-purple-500/40' },
  amber:  { border: 'border-amber-500/20',   icon: 'text-amber-400',   bg: 'bg-amber-500/8',   hover: 'hover:border-amber-500/40' },
};

function StatCard({ title, value, icon: Icon, color = 'blue', sub }) {
  const c = accentMap[color];
  return (
    <motion.div variants={item}
      className={`relative rounded-xl p-5 bg-card border ${c.border} ${c.hover} transition-all duration-200 group`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">{title}</p>
          <p className="text-3xl font-black text-foreground tabular-nums">{value}</p>
          {sub && <p className="text-[10px] font-mono text-muted-foreground mt-1.5 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-emerald-400" />{sub}
          </p>}
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg} border ${c.border}`}>
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  useSEO({
    description: 'Trade AI Zotra is an AI-powered trading analysis platform that provides intelligent chart analysis, technical indicators, market insights, and advanced trading tools for traders.',
    keywords: 'Trade AI Zotra, AI Trading, Trading AI, Stock Market AI, Trading Signals, Chart Analysis, Technical Analysis, AI Trading Platform, Trading Assistant, Market Insights',
  });

  const { data: analyses = [] } = useQuery({
    queryKey: ['analyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 50),
  });

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.Strategy.list('-created_date', 50),
  });

  const avgConfidence = analyses.length > 0
    ? Math.round(analyses.reduce((sum, a) => sum + (a.confidence || 0), 0) / analyses.length)
    : 0;

  const winSignals = analyses.filter(a => a.signal === 'buy' || a.signal === 'call').length;
  const winRate = analyses.length > 0 ? Math.round((winSignals / analyses.length) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-7">

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(222 55% 5.5%), hsl(217 80% 8%))',
          border: '1px solid hsl(217 100% 58% / 0.18)',
          boxShadow: '0 0 60px hsl(217 100% 58% / 0.06)',
        }}
      >
        {/* Grid bg */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.025) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
        {/* Glow orbs */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(217 100% 58% / 0.10), transparent 70%)' }} />
        <div className="absolute -left-10 bottom-0 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(199 100% 50% / 0.06), transparent 70%)' }} />

        <div className="relative p-7 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-emerald-400 uppercase">Live · AI Engine Active</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <img
                src="https://media.base44.com/images/public/69becf6aebe3b6ec4fa3fb48/9c38aa012_50843.png"
                alt="Trade-AI Zotra Logo"
                className="w-11 h-11 object-contain"
              />
              <h1 className="text-3xl md:text-4xl font-black tracking-widest shimmer-text">Trade AI Zotra</h1>
            </div>
            <p className="text-sm" style={{ color: 'hsl(214 40% 52%)' }}>
              AI-powered technical analysis · Real-time pattern detection · Live market data
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link to="/Analyze">
              <Button className="h-10 px-6 text-sm font-bold rounded-xl shadow-lg"
                style={{ background: 'linear-gradient(135deg, hsl(217 100% 52%), hsl(217 100% 44%))' }}
              >
                <Zap className="w-4 h-4 mr-2" />
                Analyze Chart
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Live Market Ticker — real prices via TradingView */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-blue-500/20 bg-card overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 py-2 border-b border-blue-500/15 bg-blue-500/5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-emerald-400 uppercase">Live Market · TradingView</span>
        </div>
        <TradingViewTicker />
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Analyses" value={analyses.length} icon={LineChart} color="blue" sub="All time" />
        <StatCard title="Strategies" value={strategies.length} icon={Target} color="purple" />
        <StatCard title="Avg Confidence" value={`${avgConfidence}%`} icon={TrendingUp} color="green" sub={avgConfidence > 70 ? 'Strong signals' : 'Moderate'} />
        <StatCard title="Bullish Signals" value={`${winRate}%`} icon={Percent} color="amber" />
      </motion.div>

      {/* Learning Progress Widget */}
      <LearningProgressWidget />

      {/* Quick Nav */}
      <div>
        <p className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground/50 uppercase mb-3">Quick Access</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_LINKS.map(({ to, label, sub, icon: Icon, accent }, i) => {
            const c = accentMap[accent];
            return (
              <motion.div key={to} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Link to={to}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${c.border} ${c.hover} bg-card hover:bg-secondary/30 transition-all group text-center`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.bg} border ${c.border}`}>
                    <Icon className={`w-4 h-4 ${c.icon}`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{label}</p>
                    <p className="text-[9px] font-mono text-muted-foreground mt-0.5 leading-snug">{sub}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Content Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="grid lg:grid-cols-2 gap-6"
      >
        <RecentAnalyses analyses={analyses} />
        <ActiveStrategies strategies={strategies} />
      </motion.div>
    </div>
  );
}