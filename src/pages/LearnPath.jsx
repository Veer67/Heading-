import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame, Zap, ChevronDown } from 'lucide-react';
import { useSEO } from '@/lib/useSEO';
import { useLearning } from '@/lib/learn/useLearning';
import { COURSES, courseProgress } from '@/lib/learn/curriculum';
import { DAILY_XP_GOAL } from '@/lib/learn/levels';
import { LevelBadge, XpBar, StreakBadge } from '@/components/learn/LearnShared';
import PathNode from '@/components/learn/PathNode';

// Winding horizontal offset pattern for the path nodes (in px).
const OFFSETS = [0, 70, 95, 70, 0, -70, -95, -70];

export default function LearnPath() {
  useSEO({ title: 'Learning Path — Zotra Learn' });
  const { progress, isLoading, level } = useLearning();
  const currentRef = useRef(null);

  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isLoading]);

  if (isLoading || !progress) {
    return <div className="p-10 text-center text-muted-foreground text-sm">Loading path…</div>;
  }

  const completed = progress.completed_lessons || [];
  // Flatten all lessons in order; the first incomplete one is "current".
  let currentId = null;
  const flat = [];
  COURSES.forEach((c) => {
    c.lessons.forEach((l) => {
      const isDone = completed.includes(l.id);
      if (!isDone && !currentId) currentId = l.id;
      flat.push({ lesson: l, course: c, isDone, isCurrent: false });
    });
  });
  flat.forEach((f) => { f.isCurrent = f.lesson.id === currentId; });

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto space-y-5">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/Learn" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Learn
        </Link>
        <StreakBadge streak={progress.streak} />
      </div>

      {/* Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 bg-card border border-border/50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <LevelBadge level={level} />
            <p className="text-2xl font-black text-foreground mt-2 font-mono">{(progress.xp || 0).toLocaleString()} XP</p>
          </div>
          <div className="flex-1 min-w-0">
            <XpBar value={progress.daily_xp || 0} max={DAILY_XP_GOAL} label="Today's Goal" />
          </div>
        </div>
        {currentId && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-primary">
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" /> Continue where you left off below
          </div>
        )}
      </motion.div>

      {/* The winding path */}
      <div className="relative">
        {/* Central dashed path line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 border-l-2 border-dashed border-primary/20" />

        <div className="space-y-10 pb-8">
          {COURSES.map((course) => {
            const cp = courseProgress(completed, course);
            const colorCls = {
              blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-300',
              green: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-300',
              purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-300',
              amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-300',
              red: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-300',
            }[course.color] || 'from-primary/20 to-primary/5 border-primary/30 text-primary';

            return (
              <div key={course.id} className="relative">
                {/* Unit banner */}
                <div className={`relative z-10 mx-auto mb-6 w-fit px-5 py-2.5 rounded-2xl border bg-gradient-to-r ${colorCls}`}
                  style={{ maxWidth: '90%' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{course.icon}</span>
                    <div className="text-left">
                      <p className="text-sm font-black tracking-wide">{course.title}</p>
                      <p className="text-[10px] font-mono opacity-80">{cp.done}/{cp.total} lessons · {cp.pct}%</p>
                    </div>
                  </div>
                </div>

                {/* Lesson nodes */}
                <div className="space-y-7">
                  {course.lessons.map((lesson, i) => {
                    const isDone = completed.includes(lesson.id);
                    const isCurrent = lesson.id === currentId;
                    const isLocked = !isDone && !isCurrent;
                    const state = isDone ? 'completed' : isCurrent ? 'current' : 'locked';
                    const offset = OFFSETS[i % OFFSETS.length];
                    return (
                      <div key={lesson.id} className="flex justify-center" ref={isCurrent ? currentRef : null}>
                        <PathNode
                          lesson={lesson}
                          state={state}
                          courseIcon={course.icon}
                          style={{ transform: `translateX(${offset}px)` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!currentId && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
          <p className="text-sm font-bold text-emerald-400">🏆 You have completed every lesson!</p>
          <Link to="/Learn" className="mt-2 inline-block text-xs text-primary hover:underline">Back to Learn hub</Link>
        </div>
      )}

      <p className="text-center text-[10px] font-mono text-muted-foreground/40">
        Educational tool only · No guaranteed profit · Always manage risk
      </p>
    </div>
  );
}