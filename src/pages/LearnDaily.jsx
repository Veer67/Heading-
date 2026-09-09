import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Flame, Check, X, Trophy } from 'lucide-react';
import { useSEO } from '@/lib/useSEO';
import { useLearning } from '@/lib/learn/useLearning';

// Static educational challenge bank (NOT market data — educational questions only).
const CHALLENGES = [
  { q: 'You lost three trades in a row. What should you do?', options: ['Double your position size', 'Revenge trade to recover', 'Follow your risk rules and stop for the day if needed', 'Remove your stop loss'], correct: 2, explain: 'Following your risk rules protects your capital. Revenge trading and removing stops destroy accounts.' },
  { q: 'A candle has a tiny body and long upper and lower wicks after a rally. What is it most likely?', options: ['A strong bullish signal', 'A doji / spinning top — indecision', 'A guaranteed sell', 'A Marubozu'], correct: 1, explain: 'A small body with long wicks signals indecision — not a guaranteed reversal.' },
  { q: 'In an uptrend, price breaks below the last higher low. What is this called?', options: ['Break of Structure (BOS)', 'Change of Character (CHoCH)', 'A breakout', 'A doji'], correct: 1, explain: 'The first lower low in an uptrend is a Change of Character — a possible trend shift warning.' },
  { q: 'Your capital is ₹100,000 and you risk 1% per trade. What is your max loss per trade?', options: ['₹10,000', '₹1,000', '₹100', '₹50,000'], correct: 1, explain: '1% of ₹100,000 = ₹1,000 max risk per trade.' },
  { q: 'Price breaks resistance, pulls back to it, holds, and resumes up. What is this?', options: ['A fakeout', 'A successful retest', 'A doji', 'A range'], correct: 1, explain: 'A successful retest confirms the broken level held, offering a lower-risk entry.' },
  { q: 'RSI is above 70 in a strong uptrend. You should:', options: ['Immediately short everything', 'Not automatically sell — strong trends stay overbought', 'Go all-in long', 'Ignore your stop loss'], correct: 1, explain: 'Overbought RSI does not mean automatic sell in a strong trend.' },
  { q: 'Which is a sign of a potential fakeout?', options: ['A breakout on high volume', 'A quick spike beyond a level that reverses back', 'A confirmed close beyond resistance', 'A strong follow-through candle'], correct: 1, explain: 'A quick spike beyond a level that reverses is a fakeout — wait for confirmation.' },
  { q: 'What does a 1:2 risk/reward mean?', options: ['Risk 2 to make 1', 'Risk 1 to make 2', 'No stop loss', 'Guaranteed win'], correct: 1, explain: '1:2 means risking 1 unit to make 2 — you can lose over half your trades and still profit.' },
  { q: 'After a confirmed breakout, the broken resistance often acts as:', options: ['Stronger resistance', 'New support', 'Irrelevant', 'A doji'], correct: 1, explain: 'Role reversal: broken resistance often becomes support on a retest.' },
  { q: 'A hammer is most meaningful when it appears:', options: ['At the top of an uptrend', 'After a decline, near support', 'In the middle of a range', 'Anywhere, always'], correct: 1, explain: 'Hammers after declines near support carry more weight — context matters.' },
];

function dayIndex() {
  const start = new Date(2024, 0, 1).getTime();
  const now = Date.now();
  return Math.floor((now - start) / 86400000);
}

export default function LearnDaily() {
  useSEO({ title: 'Daily Challenge — Learn' });
  const { progress, dailyDone, completeDaily } = useLearning();
  const challenge = useMemo(() => CHALLENGES[dayIndex() % CHALLENGES.length], []);
  const [picked, setPicked] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handlePick = (i) => {
    if (answered || dailyDone) return;
    setPicked(i);
    setAnswered(true);
    if (i === challenge.correct) completeDaily();
  };

  const isCorrect = answered && picked === challenge.correct;

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto space-y-5">
      <Link to="/Learn" className="text-xs text-muted-foreground hover:text-foreground">← Back to Learn</Link>

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Target className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Daily Challenge</h1>
          <p className="text-[11px] font-mono text-muted-foreground">+25 XP for a correct answer · once per day</p>
        </div>
      </div>

      {dailyDone && !answered && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-emerald-400" />
          <p className="text-sm text-emerald-300">You already completed today's challenge. Come back tomorrow!</p>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 bg-card border border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">Today's Question</span>
        </div>
        <p className="text-base font-bold text-foreground mb-5">{challenge.q}</p>
        <div className="space-y-2">
          {challenge.options.map((opt, i) => {
            const isAnswer = i === challenge.correct;
            const isPicked = picked === i;
            let cls = 'border-border/50 bg-secondary/30 text-foreground/90 hover:border-amber-500/40';
            if (answered) {
              if (isAnswer) cls = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
              else if (isPicked) cls = 'border-red-500/40 bg-red-500/10 text-red-300';
              else cls = 'border-border/40 bg-secondary/20 text-muted-foreground';
            }
            return (
              <button key={i} onClick={() => handlePick(i)} disabled={answered || dailyDone}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-between ${cls}`}>
                <span>{opt}</span>
                {answered && isAnswer && <Check className="w-4 h-4 text-emerald-400" />}
                {answered && isPicked && !isAnswer && <X className="w-4 h-4 text-red-400" />}
              </button>
            );
          })}
        </div>
        {answered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pt-4 border-t border-border/40">
            <p className={`text-sm font-bold mb-1 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
              {isCorrect ? '✅ Correct! +25 XP' : '❌ Not quite.'}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">{challenge.explain}</p>
          </motion.div>
        )}
      </motion.div>
      <p className="text-center text-[10px] font-mono text-muted-foreground/40">Streak: {progress?.streak || 0} days · Educational only</p>
    </div>
  );
}