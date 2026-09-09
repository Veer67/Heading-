import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, Flame, Target, Zap, Trophy, TrendingUp, BookOpen,
  ChevronRight, BarChart3, Brain, Award, Gamepad2, NotebookPen, Bot, Sparkles, Route, PlayCircle
} from 'lucide-react';
import { useSEO } from '@/lib/useSEO';
import { useLearning } from '@/lib/learn/useLearning';
import { COURSES, courseProgress, completedCourses, COURSE_BY_ID } from '@/lib/learn/curriculum';
import { DAILY_XP_GOAL, ACHIEVEMENTS } from '@/lib/learn/levels';
import { LevelBadge, XpBar, StatTile, CourseCard, StreakBadge, SectionCard, ProgressRing } from '@/components/learn/LearnShared';

const QUICK = [
  { to: '/Learn/Path', label: 'Learning Path', icon: Route, color: 'blue' },
  { to: '/Learn/Videos', label: 'Video Library', icon: PlayCircle, color: 'red' },
  { to: '/Learn/AI', label: 'AI Teacher', icon: Bot, color: 'blue' },
  { to: '/Learn/Daily', label: 'Daily Challenge', icon: Target, color: 'amber' },
  { to: '/Learn/Practice', label: 'Historical Practice', icon: Gamepad2, color: 'green' },
  { to: '/Learn/Journal', label: 'Trading Journal', icon: NotebookPen, color: 'purple' },
  { to: '/Learn/Achievements', label: 'Achievements', icon: Award, color: 'amber' },
  { to: '/Learn/Progress', label: 'Progress', icon: BarChart3, color: 'blue' },
];

export default function Learn() {
  useSEO({
    title: 'Zotra Learn — Trading Academy',
    description: 'Learn trading from beginner to advanced with interactive lessons, quizzes, AI teacher, and real market practice.',
    keywords: 'trading academy, learn trading, trading education, price action, candlesticks, risk management',
  });

  const { progress, isLoading, level, dailyDone, dailyXpPct, recommendNext } = useLearning();
  if (isLoading || !progress) return <div className="p-10 text-center text-muted-foreground text-sm">Loading academy…</div>;

  const completed = progress.completed_lessons || [];
  const doneCourses = completedCourses(completed);
  const totalLessons = COURSES.reduce((s, c) => s + c.lessons.length, 0);
  const overallPct = totalLessons ? Math.round((completed.length / totalLessons) * 100) : 0;
  const unlockedAch = (progress.achievements || []).length;

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider shimmer-text">ZOTRA LEARN</h1>
            <p className="text-[11px] font-mono text-muted-foreground">Trading Academy · Beginner → Advanced</p>
          </div>
        </div>
        <StreakBadge streak={progress.streak} />
      </div>

      {/* Hero stat card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 bg-card border border-border/50 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(217 100% 58% / 0.10), transparent 70%)' }} />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4">
            <ProgressRing pct={level.pct} size={84} stroke={7} />
            <div>
              <LevelBadge level={level} />
              <p className="text-3xl font-black text-foreground mt-2 font-mono">{(progress.xp || 0).toLocaleString()} XP</p>
              {level.next && <p className="text-[11px] font-mono text-muted-foreground">{level.next.minXp - progress.xp} XP to {level.next.name}</p>}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <XpBar value={progress.daily_xp || 0} max={DAILY_XP_GOAL} label="Today's Goal" height="h-2.5" />
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <Link to="/Learn/Path"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors">
                <Route className="w-4 h-4" /> Learning Path <ChevronRight className="w-4 h-4" />
              </Link>
              {recommendNext ? (
                <Link to={`/Learn/Lesson/${recommendNext.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors">
                  <Zap className="w-4 h-4" /> Continue Lesson <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="text-sm font-bold text-emerald-400">🏆 All lessons complete!</span>
              )}
              {!dailyDone && (
                <Link to="/Learn/Daily"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-bold hover:bg-amber-500/20 transition-colors">
                  <Target className="w-4 h-4" /> Daily Challenge +25 XP
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Lessons Done" value={`${completed.length}/${totalLessons}`} icon={BookOpen} color="blue" sub={`${overallPct}% complete`} />
        <StatTile label="Courses Done" value={`${doneCourses.length}/${COURSES.length}`} icon={Trophy} color="amber" />
        <StatTile label="Quiz Accuracy" value={`${progress.quiz_accuracy || 0}%`} icon={TrendingUp} color="green" />
        <StatTile label="Achievements" value={`${unlockedAch}/${ACHIEVEMENTS.length}`} icon={Award} color="purple" />
      </div>

      {/* Quick access */}
      <div>
        <p className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground/50 uppercase mb-3">Quick Access</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {QUICK.map(({ to, label, icon: Icon, color }) => {
            const cls = { blue: 'text-blue-400 bg-blue-500/8 border-blue-500/20', green: 'text-emerald-400 bg-emerald-500/8 border-emerald-500/20', purple: 'text-purple-400 bg-purple-500/8 border-purple-500/20', amber: 'text-amber-400 bg-amber-500/8 border-amber-500/20', red: 'text-red-400 bg-red-500/8 border-red-500/20' }[color];
            return (
              <Link key={to} to={to} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border/50 bg-card hover:bg-secondary/30 transition-all text-center">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${cls}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-bold text-foreground leading-tight">{label}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recommended + Weak topics */}
      {recommendNext && (
        <SectionCard title="Recommended for You" icon={Sparkles}>
          <Link to={`/Learn/Lesson/${recommendNext.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg">
              {COURSE_BY_ID[recommendNext.courseId]?.icon || '📖'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{recommendNext.title}</p>
              <p className="text-[11px] font-mono text-muted-foreground">{COURSE_BY_ID[recommendNext.courseId]?.title}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
          {(progress.weak_topics || []).length > 0 && (
            <div className="px-5 py-3 border-t border-border/40 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Weak areas:</span>
              {(progress.weak_topics || []).slice(0, 4).map((cid) => (
                <Link key={cid} to={`/Learn/Course/${cid}`}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                  {COURSE_BY_ID[cid]?.title || cid}
                </Link>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* Courses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground/50 uppercase">Courses</p>
          <span className="text-[10px] font-mono text-muted-foreground">{doneCourses.length}/{COURSES.length} complete</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COURSES.map((c) => (
            <CourseCard key={c.id} course={c} completed={completed} />
          ))}
        </div>
      </div>

      <p className="text-center text-[10px] font-mono text-muted-foreground/40 pt-2">
        Educational tool only · No guaranteed profit · Always manage risk
      </p>
    </div>
  );
}