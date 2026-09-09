// Curated library of real, free educational trading videos (YouTube embeds).
// Videos are organized by topic and mapped to the academy curriculum.
// Content is educational only and never a guaranteed strategy.

export const VIDEO_TOPICS = [
  { id: 'fundamentals', title: 'Trading Fundamentals', icon: '📚', color: 'blue' },
  { id: 'candlesticks', title: 'Candlesticks', icon: '🕯️', color: 'amber' },
  { id: 'price-action', title: 'Price Action', icon: '📈', color: 'green' },
  { id: 'support-resistance', title: 'Support & Resistance', icon: '📐', color: 'purple' },
  { id: 'supply-demand', title: 'Supply & Demand', icon: '💧', color: 'blue' },
  { id: 'market-structure', title: 'Market Structure', icon: '📊', color: 'green' },
  { id: 'technical-analysis', title: 'Technical Analysis', icon: '📉', color: 'blue' },
  { id: 'chart-reading', title: 'Chart Reading', icon: '📖', color: 'amber' },
  { id: 'strategies', title: 'Strategies', icon: '🎯', color: 'purple' },
  { id: 'risk-management', title: 'Risk Management', icon: '🛡️', color: 'red' },
  { id: 'psychology', title: 'Trading Psychology', icon: '🧠', color: 'purple' },
  { id: 'advanced', title: 'Advanced Concepts', icon: '🔬', color: 'blue' },
];

export const VIDEOS = [
  { id: 'vid-fund-1', title: 'Forex Trading For Beginners (Full Course)', youtubeId: 'Xb4KWuHmHBQ', topic: 'fundamentals', duration: '59:09', level: 'Beginner', description: 'A complete beginner-friendly introduction to how markets work, orders, and the basics of trading.' },
  { id: 'vid-cand-1', title: 'How to Read Candlestick Charts (Zero Experience)', youtubeId: 'myUKta-wicQ', topic: 'candlesticks', duration: '56:26', level: 'Beginner', description: 'Learn to read candlestick shapes and charts from scratch, with clear visual examples.' },
  { id: 'vid-cand-2', title: 'MASTER Candlestick Patterns in 125 Minutes', youtubeId: 'lEk4cSA7cqc', topic: 'candlesticks', duration: '2:05:13', level: 'Intermediate', description: 'An in-depth masterclass on the most useful candlestick patterns and how to read them in context.' },
  { id: 'vid-pa-1', title: 'Ultimate Beginners Guide To Price Action Trading', youtubeId: 'vbM2R2CM96Q', topic: 'price-action', duration: 'Full Course', level: 'Beginner', description: 'A full beginner-to-advanced price action course covering structure, trends, and entries.' },
  { id: 'vid-pa-2', title: 'PRICE ACTION Trading Made Simple (Full Course)', youtubeId: 'tWiErAItlpY', topic: 'price-action', duration: '1:12:35', level: 'Intermediate', description: 'A simplified, practical approach to reading raw price action without indicators.' },
  { id: 'vid-sr-1', title: 'Support & Resistance Trading — 3-Step Trick', youtubeId: 'dQHwBtXoPTA', topic: 'support-resistance', duration: '1:17:20', level: 'Intermediate', description: 'A practical method for identifying and trading key support and resistance levels.' },
  { id: 'vid-sr-2', title: 'Master The Support & Resistance Trading Strategy', youtubeId: 'MSzOocvljqc', topic: 'support-resistance', duration: '36:44', level: 'Beginner', description: 'Everything you need to know about support and resistance, with real chart examples.' },
  { id: 'vid-sd-1', title: 'Using Structure To Defeat the Market', youtubeId: 'bHTwShGVIQE', topic: 'supply-demand', duration: '—', level: 'Intermediate', description: 'How market structure and supply/demand zones interact, and where institutional orders cluster.' },
  { id: 'vid-ms-1', title: 'Trend Trading Secret — Reading Market Structure', youtubeId: 'rWOwMPyGsgk', topic: 'market-structure', duration: '—', level: 'Intermediate', description: 'How to identify and follow the trend using objective market structure.' },
  { id: 'vid-ta-1', title: 'Learn to Master Technical Analysis', youtubeId: 'XGQcw4RFT-A', topic: 'technical-analysis', duration: '—', level: 'Intermediate', description: 'A broad guide to technical analysis tools and how to use them as supporting evidence.' },
  { id: 'vid-cr-1', title: 'How to Read Candlestick Patterns (Step-by-Step)', youtubeId: 'dvetF0H3pNo', topic: 'chart-reading', duration: '54:55', level: 'Beginner', description: 'A step-by-step walk-through of reading charts and candlestick patterns in context.' },
  { id: 'vid-strat-1', title: 'The 3 Scalping Setups That Make A Living', youtubeId: 'PjigwAmhiT0', topic: 'strategies', duration: '45:59', level: 'Advanced', description: 'Three concrete trading setups with entries, stops, and invalidation — not guaranteed.' },
  { id: 'vid-rm-1', title: 'Risk Management for Beginners', youtubeId: 'dNyZ-jGn02s', topic: 'risk-management', duration: '13:21', level: 'Beginner', description: 'Position sizing and risk management explained simply so your edge can play out over time.' },
  { id: 'vid-rm-2', title: '52-Minute Risk Management Masterclass', youtubeId: 'hC4g7qY6UcQ', topic: 'risk-management', duration: '51:53', level: 'Advanced', description: 'A deep masterclass on risk, position sizing, and surviving drawdowns from a pro.' },
  { id: 'vid-psy-1', title: 'Master Trading Psychology in Under 83 Minutes', youtubeId: 'ICeHYLSXgYI', topic: 'psychology', duration: '1:22:00', level: 'Intermediate', description: 'Emotions, discipline, and the mindset that separates consistent traders from the rest.' },
  { id: 'vid-psy-2', title: 'Trading Psychology — Dr David Paul', youtubeId: 'MGglyvc8d58', topic: 'psychology', duration: '25:06', level: 'Intermediate', description: 'Euphoria, the 1-2% risk rule, and the psychology of perfect execution.' },
  { id: 'vid-adv-1', title: 'MASTER Price Action in 105 Minutes (Premium Course)', youtubeId: '7rdixIbe9V4', topic: 'advanced', duration: '1:45:00', level: 'Advanced', description: 'An advanced price action course covering liquidity, imbalances, and reading the next move.' },
];

export const VIDEO_BY_ID = Object.fromEntries(VIDEOS.map((v) => [v.id, v]));
export const TOPIC_BY_ID = Object.fromEntries(VIDEO_TOPICS.map((t) => [t.id, t]));

export function videosByTopic(topicId) {
  return VIDEOS.filter((v) => v.topic === topicId);
}