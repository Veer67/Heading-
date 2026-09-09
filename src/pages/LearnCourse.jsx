import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Circle, ChevronRight, Lock } from 'lucide-react';
import { useSEO } from '@/lib/useSEO';
import { useLearning } from '@/lib/learn/useLearning';
import { COURSE_BY_ID, courseProgress } from '@/lib/learn/curriculum';

export default function LearnCourse() {
  const { courseId } = useParams();
  const course = COURSE_BY_ID[courseId];
  useSEO({ title: course ? `${course.title} — Learn` : 'Learn' });
  const { progress } = useLearning();
  const navigate = useNavigate();

  if (!course) {
    return <div className="p-10 text-center text-muted-foreground">Course not found. <Link to="/Learn" className="text-primary">Back to Learn</Link></div>;
  }

  const completed = progress?.completed_lessons || [];
  const cp = courseProgress(completed, course);

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto space-y-5">
      <Link to="/Learn" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Learn
      </Link>

      <div className="rounded-2xl p-6 bg-card border border-border/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">{course.icon}</div>
          <div>
            <h1 className="text-2xl font-black text-foreground">{course.title}</h1>
            <p className="text-[11px] font-mono text-muted-foreground">{cp.done}/{cp.total} lessons · {cp.pct}%</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{course.description}</p>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${cp.pct}%` }} />
        </div>
      </div>

      <div className="space-y-2">
        {course.lessons.map((lesson, i) => {
          const done = completed.includes(lesson.id);
          // Simple sequential unlock: a lesson is locked if the previous one isn't done (first always open)
          const prevDone = i === 0 || completed.includes(course.lessons[i - 1].id);
          const locked = !prevDone && !done;
          return (
            <motion.div key={lesson.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <button
                onClick={() => !locked && navigate(`/Learn/Lesson/${lesson.id}`)}
                disabled={locked}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                  locked ? 'border-border/30 bg-card/40 opacity-50 cursor-not-allowed'
                         : 'border-border/50 bg-card hover:border-primary/40 hover:bg-secondary/30'
                }`}
              >
                {done ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      : locked ? <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      : <Circle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${done ? 'text-emerald-400' : 'text-foreground'}`}>{i + 1}. {lesson.title}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{lesson.explanation}</p>
                </div>
                {!locked && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}