import { Link } from 'react-router-dom';
import { Check, Lock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// state: 'completed' | 'current' | 'locked'
export default function PathNode({ lesson, state, courseIcon, style }) {
  const to = `/Learn/Lesson/${lesson.id}`;
  const locked = state === 'locked';

  const content = (
    <div className="flex flex-col items-center gap-1.5" style={style}>
      <div
        className={cn(
          'relative w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-200 select-none',
          state === 'completed' && 'bg-emerald-500/15 border-2 border-emerald-500/50 text-emerald-300 shadow-[0_0_18px_hsl(142_70%_45%/0.25)]',
          state === 'current' && 'bg-primary/15 border-2 border-primary text-primary shadow-[0_0_22px_hsl(217_100%_58%/0.35)] animate-pulse',
          state === 'locked' && 'bg-secondary/40 border-2 border-border/60 text-muted-foreground/40'
        )}
      >
        <span className="text-xl">{courseIcon}</span>
        {state === 'completed' && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </span>
        )}
        {state === 'current' && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Star className="w-3 h-3 text-primary-foreground" fill="currentColor" />
          </span>
        )}
        {locked && (
          <span className="absolute inset-0 flex items-center justify-center bg-secondary/60 rounded-full">
            <Lock className="w-4 h-4 text-muted-foreground/60" />
          </span>
        )}
      </div>
      <span
        className={cn(
          'text-[10px] font-mono max-w-[120px] text-center leading-tight px-1',
          locked ? 'text-muted-foreground/40' : 'text-muted-foreground'
        )}
      >
        {lesson.title}
      </span>
    </div>
  );

  if (locked) return <div className="cursor-not-allowed">{content}</div>;
  return <Link to={to} className="hover:scale-105 transition-transform">{content}</Link>;
}