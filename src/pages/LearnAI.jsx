import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Sparkles, BarChart3, RefreshCw, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useSEO } from '@/lib/useSEO';
import { base44 } from '@/api/base44Client';
import { useLearning } from '@/lib/learn/useLearning';
import { COURSE_BY_ID } from '@/lib/learn/curriculum';
import TradingViewWidget from '@/components/charts/TradingViewWidget';

const CHART_SYMBOLS = [
  { symbol: 'BTC/USD', tf: '1h' },
  { symbol: 'ETH/USD', tf: '1h' },
  { symbol: 'EUR/USD', tf: '4h' },
  { symbol: 'AAPL', tf: '1d' },
  { symbol: 'TSLA', tf: '1d' },
  { symbol: 'GOLD', tf: '4h' },
];

const CHALLENGE_TASKS = [
  'Identify the current trend (uptrend, downtrend, or range) and explain your reasoning.',
  'Mark the most recent Higher High and Higher Low (or LH/LL) you can see. What does that imply?',
  'Identify a clear support and a clear resistance level on the chart.',
  'Is there a breakout or a fakeout visible? Describe what you see.',
  'Identify any candlestick pattern near the right edge of the chart and explain its context.',
  'Describe the market structure: is price making HH/HL, LH/LL, or moving sideways?',
  'Where would you place a stop if you entered long right now, and why (based only on structure)?',
];

function buildSystemPrompt(progress, level) {
  const completed = progress?.completed_lessons || [];
  const weak = (progress?.weak_topics || []).map((id) => COURSE_BY_ID[id]?.title || id);
  return `You are "Zotra AI Teacher", an educational trading coach inside the TRADE-AI-ZOTRA Learn Academy.
Teach with: Explain → Show → Ask → Evaluate → Correct → Practice → Advance.
Be concise, friendly, and practical. Use short paragraphs and bullet points.

STUDENT CONTEXT:
- Level: ${level.current.name} (Lvl ${level.current.level})
- XP: ${progress?.xp || 0}
- Lessons completed: ${completed.length}
- Quiz accuracy: ${progress?.quiz_accuracy || 0}%
- Weak areas: ${weak.length ? weak.join(', ') : 'none detected yet'}

STRICT RULES — never break:
- NEVER promise guaranteed profit, accuracy, returns, signals, or risk-free trading.
- Emphasize probability, risk, uncertainty, confirmation, market context, invalidation, and position sizing.
- Never invent specific prices, candles, volume, or chart data you cannot see.
- When giving a "Real Market Challenge", ask the student to identify something on the chart they see — do not fabricate what the chart shows.
- Keep answers short and educational. Encourage the student to think, then evaluate their reasoning.`;
}

const QUICK_PROMPTS = [
  'Explain Break of Structure with an example',
  'What is the difference between a breakout and a fakeout?',
  'How do I size a position with 1% risk?',
  'Quiz me on candlestick patterns',
];

export default function LearnAI() {
  useSEO({ title: 'Zotra AI Teacher — Learn' });
  const { progress, level } = useLearning();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [chartSym, setChartSym] = useState(CHART_SYMBOLS[0]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `👋 Hi! I'm your **Zotra AI Teacher**. I know you're at **${level.current.name}** level with ${progress?.xp || 0} XP.\n\nAsk me anything about trading, or tap **Real Market Challenge** to practice reading a live chart.\n\n_Remember: I teach probability and risk — never guaranteed signals._`,
      }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const prompt = text || input;
    if (!prompt.trim() || loading) return;
    const next = [...messages, { role: 'user', content: prompt }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const sys = buildSystemPrompt(progress, level);
      const challengeCtx = challenge
        ? `\n\nACTIVE REAL-MARKET CHALLENGE: "${challenge}" (chart: ${chartSym.symbol} ${chartSym.tf}). The student answered based on a live chart they can see but you cannot. Evaluate their reasoning, structure, risk awareness and process — not exact prices.`
        : '';
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${sys}${challengeCtx}\n\nStudent: ${prompt}`,
        model: 'gemini_3_flash',
      });
      const reply = typeof res === 'string' ? res : res?.output || res?.response || JSON.stringify(res);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages([...next, { role: 'assistant', content: '⚠️ Sorry, I could not respond right now. Please try again.' }]);
    }
    setLoading(false);
  };

  const startChallenge = async () => {
    const task = CHALLENGE_TASKS[Math.floor(Math.random() * CHALLENGE_TASKS.length)];
    setChallenge(task);
    const intro = `🎯 **Real Market Challenge**\n\nHere is a **real ${chartSym.symbol} ${chartSym.tf}** chart. ${task}\n\nLook at the chart above, form your answer, then type it to me. I will evaluate your reasoning — not just the outcome.`;
    setMessages((m) => [...m, { role: 'assistant', content: intro }]);
  };

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Bot className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-wider shimmer-text">ZOTRA AI TEACHER</h1>
          <p className="text-[11px] font-mono text-muted-foreground">Context-aware · {level.current.name}</p>
        </div>
      </div>

      {/* Real Market Challenge panel */}
      <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Real Market Challenge</h2>
          </div>
          <div className="flex items-center gap-2">
            <select value={chartSym.symbol} onChange={(e) => setChartSym(CHART_SYMBOLS.find((s) => s.symbol === e.target.value) || CHART_SYMBOLS[0])}
              className="bg-secondary/40 border border-border/50 rounded-lg px-2 py-1 text-xs font-mono text-foreground focus:outline-none">
              {CHART_SYMBOLS.map((s) => <option key={s.symbol} value={s.symbol}>{s.symbol}</option>)}
            </select>
            <button onClick={startChallenge} disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Sparkles className="w-3.5 h-3.5" /> New Challenge
            </button>
          </div>
        </div>
        <div className="h-[280px] md:h-[340px] w-full">
          <TradingViewWidget symbol={chartSym.symbol} chartType="candlestick" timeframe={chartSym.tf} showVolume={false} indicators={{}} />
        </div>
        {challenge && (
          <div className="px-5 py-3 border-t border-border/40 bg-amber-500/5">
            <p className="text-xs text-amber-300/90 flex items-start gap-1.5"><TrendingUp className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {challenge}</p>
          </div>
        )}
      </div>

      {/* Chat */}
      <div className="rounded-xl bg-card border border-border/50 flex flex-col" style={{ height: '52vh', minHeight: 360 }}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-foreground/90 border border-border/40'
              }`}>
                {m.role === 'user' ? m.content : <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5"><ReactMarkdown>{m.content}</ReactMarkdown></div>}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-secondary/50 border border-border/40 rounded-2xl px-4 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Thinking…
              </div>
            </div>
          )}
        </div>

        {/* Quick prompts */}
        <div className="px-3 pt-2 flex gap-2 overflow-x-auto pb-1">
          {QUICK_PROMPTS.map((q) => (
            <button key={q} onClick={() => send(q)}
              className="flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full border border-border/50 bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors whitespace-nowrap">
              {q}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-border/40 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask your AI teacher…"
            className="flex-1 bg-secondary/30 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50"
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-center text-[10px] font-mono text-muted-foreground/40">Educational only · No guaranteed profit · AI may make mistakes</p>
    </div>
  );
}