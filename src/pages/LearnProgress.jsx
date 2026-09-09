import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Brain, Target } from 'lucide-react';
import { useSEO } from '@/lib/useSEO';
import { useLearning } from '@/lib/learn/useLearning';
import { COURSES, courseAccuracy, courseProgress } from '@/lib/learn/curriculum';
import { LevelBadge, StatTile, ProgressRing } from '@/components/learn/LearnShared';

export default function LearnProgress() {
  useSEO({ title: 'Your Progress — Learn' });
  const { progress, level } = useLearning();
  if (!progress) return <div className="p-10 text-center text-muted-foreground text-sm">Loading…</div>;

  const completed = progress.completed_lessons || [];
  const history = progress.quiz_history || [];
  const totalLessons = COURSES.reduce((s, c) => s + c.lessons.length, 0);

  // Per-course accuracy + progress
  const rows = COURSES.map((c) => ({
    id: c.id,
    title: c.title,
    icon: c.icon,
    color: c.color,
    acc: courseAccuracy(history, c.id),
    pct: courseProgress(completed, c).pct,
  }));
  const withAcc = rows.filter((r) => r.acc != null);
  const strongest = withAcc.length ? [...withAcc].sort((a, b) => b.acc - a.acc)[0] : null;
  const weakest = withAcc.length ? [...withAcc].sort((a, b) => a.acc - b.acc)[0] : null;

  const colorBar = (color) => {
    const m = { blue: 'bg-blue-400', green: 'bg-emerald-400', purple: 'bg-purple-400', amber: 'bg-amber-400', red: 'bg-red-400' };
    return m[color] || 'bg-primary';
  };

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto space-y-5">
      <Link to="/Learn" className="text-xs text-muted-foreground hover:text-foreground">← Back to Learn</Link>

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Your Trading Knowledge</h1>
          <p className="text-[11px] font-mono text-muted-foreground">Analytics & recommendations</p>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl p-6 bg-card border border-border/50 flex flex-col sm:flex-row items-center gap-5">
        <ProgressRing pct={level.pct} size={88} stroke={7} />
        <div className="flex-1">
          <LevelBadge level={level} />
          <p className="text-2xl font-black text-foreground mt-2 font-mono">{(progress.xp || 0).toLocaleString()} XP</p>
          <p className="text-[11px] font-mono text-muted-foreground">{completed.length}/{totalLessons} lessons · {progress.quiz_accuracy || 0}% quiz accuracy · 🔥 {progress.streak || 0} day streak</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatTile label="Strongest Topic" value={strongest ? `${strongest.acc}%` : '—'} icon={TrendingUp} color="green" sub={strongest?.title} />
        <StatTile label="Weakest Topic" value={weakest ? `${weakest.acc}%` : '—'} icon={TrendingDown} color="red" sub={weakest?.title} />
      </div>

      {/* Per-course bars */}
      <div className="rounded-xl bg-card border border-border/50 p-5">
        <p className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground/50 uppercase mb-4">Topic Mastery</p>
        <div className="space-y-3.5">
          {rows.map((r) => (
            <div key={r.id}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground/90 flex items-center gap-1.5">{r.icon} {r.title}</span>
                <span className="font-mono text-muted-foreground">{r.acc != null ? `${r.acc}%` : `${r.pct}% done`}</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full ${colorBar(r.color)} rounded-full transition-all`} style={{ width: `${r.acc != null ? r.acc : r.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      {weakest && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-purple-500/25 bg-purple-500/5 p-4 flex items-center gap-3">
          <Brain className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-foreground">Recommended focus</p>
            <p className="text-xs text-muted-foreground">Revise <span className="text-purple-300 font-bold">{weakest.title}</span> — your accuracy here is lowest. <Link to={`/Learn/Course/${weakest.id}`} className="text-primary hover:underline">Start revising →</Link></p>
          </div>
        </motion.div>
      )}
      <p className="text-center text-[10px] font-mono text-muted-foreground/40">Educational progress only · Not a measure of trading profitability</p>
    </div>
  );
}