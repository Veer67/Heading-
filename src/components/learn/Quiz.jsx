import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Lightbulb } from 'lucide-react';

// Quiz component: shows question + options, evaluates, explains, then calls onDone(correct, total).
export default function Quiz({ quiz, onDone }) {
  const [picked, setPicked] = useState(null);
  const [answered, setAnswered] = useState(false);

  if (!quiz) return null;
  const isCorrect = answered && picked === quiz.correct;

  const handlePick = (i) => {
    if (answered) return;
    setPicked(i);
    setAnswered(true);
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Lightbulb className="w-3.5 h-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Quick Quiz</h3>
      </div>
      <p className="text-sm text-foreground/90 mb-4">{quiz.q}</p>
      <div className="space-y-2">
        {quiz.options.map((opt, i) => {
          const isAnswer = i === quiz.correct;
          const isPicked = picked === i;
          let cls = 'border-border/50 bg-secondary/30 text-foreground/90 hover:border-primary/40';
          if (answered) {
            if (isAnswer) cls = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
            else if (isPicked) cls = 'border-red-500/40 bg-red-500/10 text-red-300';
            else cls = 'border-border/40 bg-secondary/20 text-muted-foreground';
          }
          return (
            <button
              key={i}
              onClick={() => handlePick(i)}
              disabled={answered}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm font-medium transition-all flex items-center justify-between ${cls}`}
            >
              <span>{opt}</span>
              {answered && isAnswer && <Check className="w-4 h-4 text-emerald-400" />}
              {answered && isPicked && !isAnswer && <X className="w-4 h-4 text-red-400" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-border/40"
          >
            <p className={`text-sm font-bold mb-1 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
              {isCorrect ? '✅ Correct!' : '❌ Not quite.'}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">{quiz.explain}</p>
            <button
              onClick={() => onDone(isCorrect)}
              className="mt-3 w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}