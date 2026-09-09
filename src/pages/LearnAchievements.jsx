import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Lock } from 'lucide-react';
import { useSEO } from '@/lib/useSEO';
import { useLearning } from '@/lib/learn/useLearning';
import { ACHIEVEMENTS } from '@/lib/learn/levels';
import { completedCourses, COURSE_BY_ID } from '@/lib/learn/curriculum';

export default function LearnAchievements() {
  useSEO({ title: 'Achievements — Learn' });
  const { progress, ctx } = useLearning();
  const unlocked = new Set(progress?.achievements || []);
  const doneCourseIds = ctx?.completedCourses || [];

  // For display, recompute live status too (in case achievements not yet persisted)
  const liveUnlocked = new Set([
    ...unlocked,
    ...ACHIEVEMENTS.filter((a) => a.check(progress || {}, { completedCourses: doneCourseIds, totalCourses: ctx?.totalCourses || 0 })).map((a) => a.id),
  ]);

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto space-y-5">
      <Link to="/Learn" className="text-xs text-muted-foreground hover:text-foreground">← Back to Learn</Link>

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Award className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Achievements</h1>
          <p className="text-[11px] font-mono text-muted-foreground">{liveUnlocked.size}/{ACHIEVEMENTS.length} unlocked</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {ACHIEVEMENTS.map((a, i) => {
          const got = liveUnlocked.has(a.id);
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`rounded-xl p-4 border flex items-center gap-3 transition-all ${
                got ? 'border-amber-500/30 bg-amber-500/5' : 'border-border/40 bg-card/60 opacity-70'
              }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                got ? 'bg-amber-500/15 border border-amber-500/30' : 'bg-secondary/40 border border-border/40 grayscale'
              }`}>
                {got ? a.icon : <Lock className="w-4 h-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${got ? 'text-foreground' : 'text-muted-foreground'}`}>{a.name}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">{a.desc}</p>
              </div>
              {got && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25">UNLOCKED</span>}
            </motion.div>
          );
        })}
      </div>
      <p className="text-center text-[10px] font-mono text-muted-foreground/40">Levels represent learning progress only — not trading profitability.</p>
    </div>
  );
}