import { Link } from 'react-router-dom';
import { Flame, Star, BookOpen } from 'lucide-react';
import { courseProgress } from '@/lib/learn/curriculum';
import { DAILY_XP_GOAL } from '@/lib/learn/levels';

const COLOR_CLASSES = {
  blue: 'border-blue-500/20 text-blue-400 bg-blue-500/8',
  green: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/8',
  purple: 'border-purple-500/20 text-purple-400 bg-purple-500/8',
  amber: 'border-amber-500/20 text-amber-400 bg-amber-500/8',
  red: 'border-red-500/20 text-red-400 bg-red-500/8',
};

export function LevelBadge({ level }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10">
      <Star className="w-3.5 h-3.5 text-primary" />
      <span className="text-xs font-mono font-bold text-primary">LVL {level.current.level}</span>
      <span className="text-xs font-bold text-foreground/90">{level.current.name}</span>
    </div>
  );
}

export function XpBar({ value, max = DAILY_XP_GOAL, label, height = 'h-2' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      {label && (
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
          <span>{label}</span>
          <span>{value}/{max} XP</span>
        </div>
      )}
      <div className={`w-full ${height} bg-secondary rounded-full overflow-hidden`}>
        <div className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ProgressRing({ pct, size = 64, stroke = 6, color = 'hsl(217 100% 58%)' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-foreground">{pct}%</div>
    </div>
  );
}

export function StatTile({ label, value, icon: Icon, color = 'blue', sub }) {
  const cls = COLOR_CLASSES[color] || COLOR_CLASSES.blue;
  return (
    <div className="rounded-xl p-4 bg-card border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${cls}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <p className="text-xl font-black text-foreground">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{sub}</p>}
    </div>
  );
}

export function CourseCard({ course, completed = [] }) {
  const cp = courseProgress(completed, course);
  const cls = COLOR_CLASSES[course.color] || COLOR_CLASSES.blue;
  return (
    <Link to={`/Learn/Course/${course.id}`}
      className="block rounded-xl p-4 bg-card border border-border/50 hover:border-primary/40 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cls} text-xl`}>
          {course.icon}
        </div>
        {cp.complete && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">DONE</span>}
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{course.title}</h3>
      <p className="text-[11px] text-muted-foreground leading-snug mb-3 line-clamp-2">{course.description}</p>
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1.5">
        <span>{cp.done}/{cp.total} lessons</span>
        <span>{cp.pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${cp.pct}%` }} />
      </div>
    </Link>
  );
}

export function StreakBadge({ streak }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10">
      <Flame className="w-4 h-4 text-amber-400" />
      <span className="text-sm font-black text-amber-400">{streak || 0}</span>
      <span className="text-xs font-medium text-amber-400/80">Day Streak</span>
    </div>
  );
}

export function SectionCard({ title, icon: Icon, action, children }) {
  return (
    <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
      <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}