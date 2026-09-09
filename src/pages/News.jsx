import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Newspaper, RefreshCw, TrendingUp, TrendingDown, Minus, ExternalLink, Clock, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = ['All', 'Stocks', 'Crypto', 'Forex', 'Commodities', 'Economy'];

const sentimentConfig = {
  bullish: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: TrendingUp },
  bearish: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: TrendingDown },
  neutral: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Minus },
};

function NewsCard({ article, index }) {
  const sentiment = sentimentConfig[article.sentiment] || sentimentConfig.neutral;
  const SentimentIcon = sentiment.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="neon-border rounded-xl bg-card/60 backdrop-blur-sm p-5 hover:bg-card/80 transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {article.category && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono uppercase">
              {article.category}
            </Badge>
          )}
          <Badge className={`${sentiment.color} border text-[10px] font-mono flex items-center gap-1`}>
            <SentimentIcon className="w-2.5 h-2.5" />
            {article.sentiment}
          </Badge>
        </div>
        {article.url && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      <h3 className="font-semibold text-foreground text-sm leading-snug mb-2">{article.title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{article.summary}</p>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
        {article.source && (
          <span className="text-[10px] font-mono text-muted-foreground/70">{article.source}</span>
        )}
        {article.published_at && (
          <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60">
            <Clock className="w-2.5 h-2.5" />
            {article.published_at}
          </div>
        )}
      </div>

      {article.tickers?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {article.tickers.map((t, i) => (
            <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary/50 text-primary/70">
              ${t}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function News() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: newsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['trading-news', refreshKey],
    queryFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a financial news aggregator. Generate a realistic list of 12 current trading and financial market news articles from today. Include a mix of stocks, crypto, forex, commodities, and macro economy news. Make them realistic with plausible headlines, sources, and market impacts.

Return JSON with:
{
  "articles": [
    {
      "title": "headline",
      "summary": "2-3 sentence summary",
      "category": one of "Stocks" | "Crypto" | "Forex" | "Commodities" | "Economy",
      "sentiment": one of "bullish" | "bearish" | "neutral",
      "source": "e.g. Reuters, Bloomberg, CNBC",
      "published_at": "e.g. 2h ago, 35min ago",
      "tickers": ["AAPL", "BTC"] or empty array,
      "url": null
    }
  ]
}`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            articles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  summary: { type: 'string' },
                  category: { type: 'string' },
                  sentiment: { type: 'string' },
                  source: { type: 'string' },
                  published_at: { type: 'string' },
                  tickers: { type: 'array', items: { type: 'string' } },
                  url: { type: 'string' },
                },
              },
            },
          },
        },
      });
      return result.articles || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filtered = activeCategory === 'All'
    ? (newsData || [])
    : (newsData || []).filter(a => a.category === activeCategory);

  const counts = {
    bullish: (newsData || []).filter(a => a.sentiment === 'bullish').length,
    bearish: (newsData || []).filter(a => a.sentiment === 'bearish').length,
    neutral: (newsData || []).filter(a => a.sentiment === 'neutral').length,
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Market News</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Live trading & financial market news</p>
        </div>
        <Button
          onClick={() => { setRefreshKey(k => k + 1); }}
          disabled={isFetching}
          variant="outline"
          className="border-primary/30 text-primary hover:bg-primary/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh News
        </Button>
      </motion.div>

      {/* Market Sentiment Bar */}
      {newsData && newsData.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="neon-border rounded-xl bg-card/60 backdrop-blur-sm p-4 mb-6"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-mono">Market Sentiment</p>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono text-foreground">{counts.bullish} Bullish</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-xs font-mono text-foreground">{counts.bearish} Bearish</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-xs font-mono text-foreground">{counts.neutral} Neutral</span>
            </div>
            <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden ml-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 rounded-full transition-all"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <Filter className="w-3 h-3 text-muted-foreground" />
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              activeCategory === cat
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground bg-secondary/30 border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News Grid */}
      {isLoading || isFetching ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="neon-border rounded-xl bg-card/40 p-5 animate-pulse">
              <div className="flex gap-2 mb-3">
                <div className="h-4 w-16 bg-secondary rounded" />
                <div className="h-4 w-14 bg-secondary rounded" />
              </div>
              <div className="h-4 bg-secondary rounded mb-2" />
              <div className="h-4 bg-secondary rounded w-4/5 mb-2" />
              <div className="h-3 bg-secondary/50 rounded mb-1" />
              <div className="h-3 bg-secondary/50 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="neon-border rounded-xl bg-card/60 p-12 text-center">
          <Newspaper className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No news in this category</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((article, i) => (
            <NewsCard key={i} article={article} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}