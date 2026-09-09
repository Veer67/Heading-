import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Send, Bot, User, Loader2, Trash2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useSEO } from '@/lib/useSEO';

const SYSTEM_PROMPT = `You are ZTRA-AI, an expert trading assistant specialized in technical analysis, market structure, options trading, risk management, and trading psychology. 
You provide concise, actionable trading insights. You analyze market conditions, suggest trade setups, explain chart patterns, and help traders improve their strategies.
When giving trade setups, always include: entry, stop loss, take profit, and risk/reward ratio.
Be direct, professional, and data-driven. Use emojis sparingly for clarity.`;

const QUICK_PROMPTS = [
  "What's the best strategy for a volatile market?",
  "Explain the head and shoulders pattern",
  "How do I manage risk on options trades?",
  "What are the key support/resistance indicators?",
  "Explain RSI divergence and how to trade it",
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'linear-gradient(135deg, hsl(217 100% 20%), hsl(217 100% 14%))', border: '1px solid hsl(217 100% 30%)' }}
        >
          <Bot className="w-4 h-4 text-blue-400" />
        </div>
      )}
      <div className={cn('max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
        isUser
          ? 'rounded-br-sm text-white'
          : 'rounded-bl-sm'
      )}
        style={isUser
          ? { background: 'linear-gradient(135deg, hsl(217 100% 48%), hsl(217 100% 40%))', boxShadow: '0 4px 20px hsl(217 100% 58% / 0.25)' }
          : { background: 'hsl(222 55% 8%)', border: '1px solid hsl(217 75% 16%)' }
        }
      >
        {isUser ? (
          <p>{msg.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none text-foreground/90 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-secondary border border-border">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
}

export default function Chat() {
  useSEO({
    title: 'AI Trading Assistant',
    description: "Chat with Trade AI Zotra's AI trading assistant for technical analysis, chart patterns, risk management, and trading strategy guidance 24/7.",
    keywords: 'AI trading assistant, trading chat, AI trader, trading help, market analysis chat, Trade AI Zotra assistant',
  });

  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm **ZTRA-AI**, your personal trading assistant. I can help you with technical analysis, chart patterns, trading strategies, risk management, and more. What would you like to explore today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const MAX_INPUT_LENGTH = 2000;
  const MAX_HISTORY_MESSAGES = 20;

  const sendMessage = async (text) => {
    const raw = text || input.trim();
    if (!raw || isLoading) return;

    // Sanitize and enforce length limit
    const content = raw.slice(0, MAX_INPUT_LENGTH);
    setInput('');

    const userMsg = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    // Only send last N messages to prevent prompt injection via history bloat
    const recentHistory = newMessages.slice(-MAX_HISTORY_MESSAGES);
    const history = recentHistory.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');
    const prompt = `${SYSTEM_PROMPT}\n\nConversation history:\n${history}\n\nRespond as ZTRA-AI assistant:`;

    try {
      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      setMessages(prev => [...prev, { role: 'assistant', content: result }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(217 100% 20%), hsl(217 100% 12%))', border: '1px solid hsl(217 100% 30%)', boxShadow: '0 0 16px hsl(217 100% 58% / 0.2)' }}
          >
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider shimmer-text">ZTRA-AI Chat</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400">Online · Trading AI Active</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setMessages([{ role: 'assistant', content: "Hello! I'm **ZTRA-AI**, your personal trading assistant. How can I help you today?" }])}
          className="text-muted-foreground hover:text-destructive gap-1.5 text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </Button>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        <AnimatePresence>
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        </AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(217 100% 20%), hsl(217 100% 14%))', border: '1px solid hsl(217 100% 30%)' }}
            >
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-sm"
              style={{ background: 'hsl(222 55% 8%)', border: '1px solid hsl(217 75% 16%)' }}
            >
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-xs text-muted-foreground font-mono">ZTRA-AI is thinking...</span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => sendMessage(p)}
              className="text-xs px-3 py-1.5 rounded-full font-mono transition-all hover:scale-105"
              style={{ background: 'hsl(217 100% 58% / 0.1)', border: '1px solid hsl(217 100% 58% / 0.2)', color: 'hsl(217 80% 70%)' }}
            >
              {p}
            </button>
          ))}
        </motion.div>
      )}

      {/* Input */}
      <div className="flex gap-3 items-end rounded-2xl p-2"
        style={{ background: 'hsl(222 55% 6%)', border: '1px solid hsl(217 75% 18%)', boxShadow: '0 0 20px hsl(217 100% 58% / 0.06)' }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value.slice(0, 2000))}
          onKeyDown={handleKeyDown}
          placeholder="Ask ZTRA-AI about trading strategies, chart patterns, risk management..."
          rows={1}
          maxLength={2000}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 resize-none outline-none px-2 py-2 font-inter max-h-32"
          style={{ lineHeight: '1.5' }}
        />
        <Button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="w-10 h-10 rounded-xl flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, hsl(217 100% 52%), hsl(217 100% 42%))' }}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
      <p className="text-center text-[10px] text-muted-foreground/40 font-mono mt-2">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}