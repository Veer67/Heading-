import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 300);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background grid-bg"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-10 h-10 border-l-2 border-t-2 border-primary/40" />
      <div className="absolute top-4 right-4 w-10 h-10 border-r-2 border-t-2 border-primary/40" />
      <div className="absolute bottom-4 left-4 w-10 h-10 border-l-2 border-b-2 border-primary/40" />
      <div className="absolute bottom-4 right-4 w-10 h-10 border-r-2 border-b-2 border-primary/40" />

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-primary/10 rounded-full blur-[100px]" />

      {/* Logo container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="neon-border rounded-xl p-6 px-10 flex items-center gap-4 mb-6 neon-box-glow"
      >
        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
          <TrendingUp className="w-7 h-7 text-primary neon-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-wider text-primary neon-glow">TRADE-AI-ZOTRA</h1>
          <p className="text-xs font-mono text-primary/70 tracking-widest">.ZTRA</p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-primary/80 text-sm font-medium mb-6 tracking-wide"
      >
        AI-Powered Trading Analysis
      </motion.p>

      {/* Progress bar */}
      <div className="w-64 space-y-2">
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>Loading...</span>
          <span>{Math.min(Math.round(progress), 100)}%</span>
        </div>
      </div>

      {/* Bouncing dots */}
      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  );
}