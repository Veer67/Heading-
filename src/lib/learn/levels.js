// Level definitions, XP rules, and achievements for the Learn Academy.

export const LEVELS = [
  { level: 1, name: 'Beginner', minXp: 0 },
  { level: 2, name: 'Candle Student', minXp: 300 },
  { level: 3, name: 'Chart Reader', minXp: 800 },
  { level: 4, name: 'Price Action Student', minXp: 1500 },
  { level: 5, name: 'Technical Analyst', minXp: 2500 },
  { level: 6, name: 'Risk Manager', minXp: 4000 },
  { level: 7, name: 'Trading Scholar', minXp: 6500 },
];

export const DAILY_XP_GOAL = 50;

export const XP_RULES = {
  lesson: 10,
  quiz: 10,
  perfectQuiz: 20,
  daily: 25,
  course: 100,
};

export function levelFromXp(xp) {
  let current = LEVELS[0];
  let next = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }
  const floor = current.minXp;
  const ceil = next ? next.minXp : current.minXp;
  const pct = next ? Math.min(100, Math.round(((xp - floor) / (ceil - floor)) * 100)) : 100;
  return { current, next, floor, ceil, pct };
}

// Achievements: `check` receives the progress object + a context object.
export const ACHIEVEMENTS = [
  { id: 'first_candle', icon: '🕯️', name: 'First Candle', desc: 'Complete your first lesson', check: (p) => (p.completed_lessons || []).length >= 1 },
  { id: 'first_course', icon: '📚', name: 'First Course', desc: 'Complete an entire course', check: (p, ctx) => (ctx.completedCourses || []).length >= 1 },
  { id: 'streak_7', icon: '🔥', name: '7 Day Learner', desc: 'Reach a 7-day learning streak', check: (p) => (p.streak || 0) >= 7 },
  { id: 'pattern_hunter', icon: '🎯', name: 'Pattern Hunter', desc: 'Identify 25 patterns in exercises', check: (p) => (p.patterns_identified || 0) >= 25 },
  { id: 'chart_reader', icon: '📊', name: 'Chart Reader', desc: 'Complete the Chart Reading course', check: (p, ctx) => (ctx.completedCourses || []).includes('chart-reading') },
  { id: 'price_action', icon: '📈', name: 'Price Action Student', desc: 'Complete the Price Action course', check: (p, ctx) => (ctx.completedCourses || []).includes('price-action') },
  { id: 'risk_manager', icon: '🛡️', name: 'Risk Manager', desc: 'Complete Risk Management', check: (p, ctx) => (ctx.completedCourses || []).includes('risk-management') },
  { id: 'psychology', icon: '🧠', name: 'Psychology Master', desc: 'Complete Trading Psychology', check: (p, ctx) => (ctx.completedCourses || []).includes('psychology') },
  { id: 'scholar', icon: '🏆', name: 'Trading Scholar', desc: 'Complete all available courses', check: (p, ctx) => (ctx.totalCourses || 0) > 0 && (ctx.completedCourses || []).length >= ctx.totalCourses },
];

export function checkAchievements(progress, ctx) {
  return ACHIEVEMENTS.filter((a) => a.check(progress, ctx)).map((a) => a.id);
}