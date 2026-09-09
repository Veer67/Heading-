import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { COURSES, courseProgress, completedCourses, courseAccuracy } from './curriculum';
import { LEVELS, levelFromXp, XP_RULES, DAILY_XP_GOAL, checkAchievements } from './levels';

const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

const DEFAULTS = {
  xp: 0,
  streak: 0,
  last_activity_date: null,
  daily_xp: 0,
  daily_xp_date: null,
  daily_challenge_date: null,
  completed_lessons: [],
  quiz_history: [],
  quiz_accuracy: 0,
  weak_topics: [],
  achievements: [],
  patterns_identified: 0,
};

function buildContext(progress) {
  const completed = progress.completed_lessons || [];
  const cc = completedCourses(completed);
  return {
    completedCourses: cc,
    totalCourses: COURSES.length,
  };
}

// Recompute derived fields (accuracy, weak topics, achievements) from raw progress.
function recompute(progress) {
  const history = progress.quiz_history || [];
  let accuracy = 0;
  if (history.length > 0) {
    const totalQ = history.reduce((s, a) => s + (a.total || 0), 0);
    const correctQ = history.reduce((s, a) => s + (a.correct || 0), 0);
    accuracy = totalQ ? Math.round((correctQ / totalQ) * 100) : 0;
  }
  // Weak topics: courses with accuracy < 60 and at least 2 attempts
  const weak = COURSES
    .map((c) => ({ id: c.id, acc: courseAccuracy(history, c.id), attempts: history.filter((a) => a.course_id === c.id).length }))
    .filter((c) => c.acc != null && c.acc < 60 && c.attempts >= 2)
    .sort((a, b) => a.acc - b.acc)
    .map((c) => c.id);
  const ctx = buildContext(progress);
  const achievements = checkAchievements(progress, ctx);
  return { ...progress, quiz_accuracy: accuracy, weak_topics: weak, achievements };
}

function applyStreak(progress) {
  const today = todayStr();
  let { streak, last_activity_date } = progress;
  if (last_activity_date === today) {
    // already active today, keep streak
  } else if (last_activity_date === yesterdayStr()) {
    streak = (streak || 0) + 1;
  } else {
    streak = 1;
  }
  // reset daily xp if new day
  let { daily_xp, daily_xp_date } = progress;
  if (daily_xp_date !== today) {
    daily_xp = 0;
    daily_xp_date = today;
  }
  return { ...progress, streak, last_activity_date: today, daily_xp, daily_xp_date };
}

export function useLearning() {
  const qc = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['learning-progress'],
    queryFn: async () => {
      const list = await base44.entities.LearningProgress.list('-created_date', 1);
      if (list.length > 0) return { ...DEFAULTS, ...list[0] };
      const created = await base44.entities.LearningProgress.create({ ...DEFAULTS });
      return { ...DEFAULTS, ...created };
    },
  });

  const save = useMutation({
    mutationFn: async (patch) => {
      if (!progress) throw new Error('Progress not loaded');
      let next = { ...progress, ...patch };
      next = recompute(next);
      return await base44.entities.LearningProgress.update(progress.id, {
        xp: next.xp,
        streak: next.streak,
        last_activity_date: next.last_activity_date,
        daily_xp: next.daily_xp,
        daily_xp_date: next.daily_xp_date,
        daily_challenge_date: next.daily_challenge_date,
        completed_lessons: next.completed_lessons,
        quiz_history: next.quiz_history,
        quiz_accuracy: next.quiz_accuracy,
        weak_topics: next.weak_topics,
        achievements: next.achievements,
        patterns_identified: next.patterns_identified,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['learning-progress'] }),
  });

  // Complete a lesson (+ lesson XP). Idempotent.
  const completeLesson = (lessonId) => {
    if (!progress) return;
    const done = progress.completed_lessons || [];
    if (done.includes(lessonId)) return;
    let next = applyStreak({ ...progress, completed_lessons: [...done, lessonId] });
    next.xp = (next.xp || 0) + XP_RULES.lesson;
    next.daily_xp = (next.daily_xp || 0) + XP_RULES.lesson;
    // course completion bonus
    const lesson = COURSES.flatMap((c) => c.lessons).find((l) => l.id === lessonId);
    if (lesson) {
      const course = COURSES.find((c) => c.id === lesson.courseId || c.lessons.includes(lesson));
      if (course) {
        const cp = courseProgress(next.completed_lessons, course);
        if (cp.complete) {
          next.xp += XP_RULES.course;
          next.daily_xp += XP_RULES.course;
        }
      }
    }
    save.mutate(next);
  };

  // Record a quiz attempt (+ quiz XP, +perfect bonus if all correct)
  const recordQuiz = (lessonId, courseId, correct, total) => {
    if (!progress) return;
    const entry = { lesson_id: lessonId, course_id: courseId, correct, total, date: todayStr() };
    let next = applyStreak({ ...progress, quiz_history: [...(progress.quiz_history || []), entry] });
    const gained = XP_RULES.quiz + (correct === total ? XP_RULES.perfectQuiz : 0);
    next.xp = (next.xp || 0) + gained;
    next.daily_xp = (next.daily_xp || 0) + gained;
    save.mutate(next);
  };

  // Submit a lesson end-to-end: record quiz + complete lesson in ONE save
  // (avoids two concurrent saves overwriting each other).
  const submitLesson = (lessonId, courseId, correct, total) => {
    if (!progress) return;
    const done = progress.completed_lessons || [];
    const wasDone = done.includes(lessonId);
    let next = applyStreak({
      ...progress,
      completed_lessons: wasDone ? done : [...done, lessonId],
      quiz_history: [...(progress.quiz_history || []), { lesson_id: lessonId, course_id: courseId, correct, total, date: todayStr() }],
    });
    let gained = 0;
    if (!wasDone) gained += XP_RULES.lesson;
    gained += XP_RULES.quiz + (correct === total ? XP_RULES.perfectQuiz : 0);
    // course completion bonus
    if (!wasDone) {
      const course = COURSES.find((c) => c.id === courseId);
      if (course) {
        const cp = courseProgress(next.completed_lessons, course);
        if (cp.complete) gained += XP_RULES.course;
      }
    }
    next.xp = (next.xp || 0) + gained;
    next.daily_xp = (next.daily_xp || 0) + gained;
    save.mutate(next);
  };

  // Complete the daily challenge (+ daily XP), once per day
  const completeDaily = () => {
    if (!progress) return;
    if (progress.daily_challenge_date === todayStr()) return;
    let next = applyStreak({ ...progress, daily_challenge_date: todayStr() });
    next.xp = (next.xp || 0) + XP_RULES.daily;
    next.daily_xp = (next.daily_xp || 0) + XP_RULES.daily;
    save.mutate(next);
  };

  const incrementPatterns = (n = 1) => {
    if (!progress) return;
    save.mutate({ ...progress, patterns_identified: (progress.patterns_identified || 0) + n });
  };

  const level = progress ? levelFromXp(progress.xp || 0) : levelFromXp(0);
  const ctx = progress ? buildContext(progress) : { completedCourses: [], totalCourses: COURSES.length };
  const dailyDone = progress?.daily_challenge_date === todayStr();
  const dailyXpPct = progress ? Math.min(100, Math.round(((progress.daily_xp || 0) / DAILY_XP_GOAL) * 100)) : 0;

  // Recommended next lesson: first incomplete lesson in the user's weakest course,
  // else first incomplete lesson overall.
  const recommendNext = () => {
    if (!progress) return null;
    const done = progress.completed_lessons || [];
    const weak = progress.weak_topics || [];
    const pickFromCourse = (cid) => {
      const course = COURSES.find((c) => c.id === cid);
      if (!course) return null;
      return course.lessons.find((l) => !done.includes(l.id)) || null;
    };
    for (const cid of weak) {
      const l = pickFromCourse(cid);
      if (l) return { ...l, courseId: cid };
    }
    for (const c of COURSES) {
      const l = c.lessons.find((l) => !done.includes(l.id));
      if (l) return { ...l, courseId: c.id };
    }
    return null;
  };

  return {
    progress,
    isLoading,
    level,
    ctx,
    dailyDone,
    dailyXpPct,
    recommendNext: recommendNext(),
    completeLesson,
    recordQuiz,
    submitLesson,
    completeDaily,
    incrementPatterns,
    saving: save.isPending,
  };
}

export { DAILY_XP_GOAL, LEVELS };