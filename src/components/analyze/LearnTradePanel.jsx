import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { COURSES } from '@/lib/learn/curriculum';

// Surface a handful of foundational lessons as quick "learn" cards.
const TIPS = (COURSES[0]?.lessons || []).slice(0, 4).map(l => ({
  id: l.id,
  title: l.title,
  takeaway: l.keyPoints?.[0],
}));

export default function LearnTradePanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border border-border/50 overflow-hidden"
    >
      <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Learn to Trade</h2>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">QUICK LESSONS</span>
      </div>

      <div className="p-4 space-y-2.5">
        {TIPS.map(tip => (
          <Link
            key={tip.id}
            to={`/Learn/Lesson/${tip.id}`}
            className="block group rounded-lg p-3 bg-secondary/30 border border-border/40 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
          >
            <div className="flex items-start gap-2.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground group-hover:text-blue-400 transition-colors">
                  {tip.title}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                  {tip.takeaway}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="px-4 pb-4">
        <Link
          to="/Learn"
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Open Trading Academy
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}