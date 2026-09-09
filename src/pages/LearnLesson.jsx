import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Lightbulb, Target, Sparkles } from 'lucide-react';
import { useSEO } from '@/lib/useSEO';
import { useLearning } from '@/lib/learn/useLearning';
import { LESSON_BY_ID, COURSE_BY_ID, COURSES } from '@/lib/learn/curriculum';
import Quiz from '@/components/learn/Quiz';

export default function LearnLesson() {
  const { lessonId } = useParams();
  const lesson = LESSON_BY_ID[lessonId];
  useSEO({ title: lesson ? `${lesson.title} — Learn` : 'Learn' });
  const { progress, submitLesson } = useLearning();
  const navigate = useNavigate();
  const [quizDone, setQuizDone] = useState(false);

  useEffect(() => { setQuizDone(false); }, [lessonId]);

  if (!lesson) {
    return <div className="p-10 text-center text-muted-foreground">Lesson not found. <Link to="/Learn" className="text-primary">Back to Learn</Link></div>;
  }

  const course = COURSE_BY_ID[lesson.courseId];
  const completed = progress?.completed_lessons || [];
  const alreadyDone = completed.includes(lesson.id);

  // Find next lesson in same course, else next course's first lesson
  const lessonsInCourse = course.lessons;
  const idx = lessonsInCourse.findIndex((l) => l.id === lesson.id);
  let next = idx < lessonsInCourse.length - 1 ? lessonsInCourse[idx + 1] : null;
  if (!next) {
    const cIdx = COURSES.findIndex((c) => c.id === course.id);
    for (let i = cIdx + 1; i < COURSES.length; i++) {
      if (COURSES[i].lessons.length) { next = COURSES[i].lessons[0]; break; }
    }
  }

  const handleQuizDone = (correct) => {
    submitLesson(lesson.id, course.id, correct ? 1 : 0, 1);
    setQuizDone(true);
  };

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto space-y-5">
      <Link to={`/Learn/Course/${course.id}`} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> {course.title}
      </Link>

      {/* Lesson header */}
      <div className="rounded-2xl p-6 bg-card border border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{course.icon}</span>
          <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">{course.title}</span>
          {alreadyDone && <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">COMPLETED</span>}
        </div>
        <h1 className="text-2xl font-black text-foreground mb-3">{lesson.title}</h1>

        {/* Explanation */}
        <div className="flex items-start gap-2.5 mb-4">
          <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground/90 leading-relaxed">{lesson.explanation}</p>
        </div>

        {/* Key points */}
        <div className="rounded-xl border border-border/40 bg-secondary/20 p-4 mb-4">
          <p className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Key Points
          </p>
          <ul className="space-y-1.5">
            {lesson.keyPoints.map((k, i) => (
              <li key={i} className="text-sm text-foreground/85 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-1 flex-shrink-0" />
                <span>{k}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Real-world example */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <p className="text-[10px] font-mono font-bold tracking-widest text-blue-400 uppercase mb-1.5 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" /> Real-World Example
          </p>
          <p className="text-sm text-foreground/85 leading-relaxed">{lesson.example}</p>
        </div>

        <p className="text-[10px] font-mono text-muted-foreground/50 mt-4 leading-relaxed">
          ⚠️ Educational content only. No pattern or concept is a guaranteed signal. Always confirm and manage risk.
        </p>
      </div>

      {/* Quiz */}
      {!quizDone ? (
        <Quiz quiz={lesson.quiz} onDone={handleQuizDone} />
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center">
          <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-foreground">Lesson complete! +10 XP</p>
          {next ? (
            <button onClick={() => navigate(`/Learn/Lesson/${next.id}`)}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors">
              Next Lesson <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <Link to="/Learn" className="mt-3 inline-block text-sm text-primary hover:underline">Back to Learn</Link>
          )}
        </motion.div>
      )}
    </div>
  );
}