import { Link } from 'react-router-dom';
import { Flame, Zap, Award, ChevronRight, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLearning } from '@/lib/learn/useLearning';
import { DAILY_XP_GOAL } from '@/lib/learn/levels';

export default function LearningProgressWidget() {
  const { progress, level, dailyXpPct, isLoading } = useLearning();

  if (isLoading || !progress) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-5 animate-pulse h-32" />
    );
  }

  const xp = progress.xp || 0;
  const streak = progress.streak || 0;
  const lvl = level.current;
  const next = level.next;
  const xpToNext = next ? next.minXp - xp : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl overflow-hidden border border-blue-500/20 bg-card"
    >
      {/* Header */}
      <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, hsl(217 100% 58% / 0.08), transparent)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground leading-none">Learning Progress</h2>
            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Trade AI Academy</p>
          </div>
        </div>
        <Link to="/Learn" className="text-[10px] font-mono text-blue-400 hover:text-blue-300 flex items-center gap-0.5">
          View <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-border/40">
        <div className="p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-2">
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-foreground tabular-nums leading-none">{streak}</p>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mt-1">Day Streak</p>
        </div>
        <div className="p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-black text-foreground tabular-nums leading-none">{xp.toLocaleString()}</p>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mt-1">Total XP</p>
        </div>
        <div className="p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2">
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-foreground tabular-nums leading-none">L{lvl.level}</p>
          <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mt-1 truncate px-1">{lvl.name}</p>
        </div>
      </div>

      {/* Level progress bar */}
      <div className="px-5 pb-4 pt-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-muted-foreground">
            {next ? `${lvl.name} → ${next.name}` : 'Max level reached'}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">
            {next ? `${xpToNext} XP to next` : '🏆'}
          </span>
        </div>
        <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${level.pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, hsl(217 100% 58%), hsl(199 100% 65%))' }}
          />
        </div>
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-[10px] font-mono text-muted-foreground">
            Daily goal: {progress.daily_xp || 0}/{DAILY_XP_GOAL} XP
          </span>
          <Link to="/Learn/Daily"
            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
          >
            Today's challenge <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}