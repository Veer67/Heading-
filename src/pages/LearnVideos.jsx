import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, CheckCircle2, Clock, ArrowLeft, Search } from 'lucide-react';
import { useSEO } from '@/lib/useSEO';
import { VIDEOS, VIDEO_TOPICS, TOPIC_BY_ID } from '@/lib/learn/videos';
import { useAllVideoProgress } from '@/lib/learn/useVideoProgress';
import { cn } from '@/lib/utils';

const COLOR_CLASSES = {
  blue: 'border-blue-500/20 text-blue-400 bg-blue-500/8',
  green: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/8',
  purple: 'border-purple-500/20 text-purple-400 bg-purple-500/8',
  amber: 'border-amber-500/20 text-amber-400 bg-amber-500/8',
  red: 'border-red-500/20 text-red-400 bg-red-500/8',
};

function fmtPct(pos, dur) {
  if (!dur) return 0;
  return Math.min(100, Math.round((pos / dur) * 100));
}

function VideoCard({ video, progress }) {
  const topic = TOPIC_BY_ID[video.topic];
  const cls = COLOR_CLASSES[topic?.color] || COLOR_CLASSES.blue;
  const watched = !!progress;
  const pct = watched ? fmtPct(progress.position, progress.duration) : 0;
  const done = watched && progress.completed;

  return (
    <Link to={`/Learn/Video/${video.id}`}
      className="block rounded-xl overflow-hidden bg-card border border-border/50 hover:border-primary/40 transition-all group">
      <div className="relative aspect-video bg-secondary/40 overflow-hidden">
        <img
          src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className={cn('text-[9px] font-mono px-2 py-0.5 rounded-full border', cls)}>{topic?.icon} {topic?.title}</span>
        </div>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] font-mono text-white/90 bg-black/50 px-1.5 py-0.5 rounded">
          <Clock className="w-3 h-3" /> {video.duration}
        </div>
        {done && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-mono text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3" /> Done
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <PlayCircle className="w-12 h-12 text-white/90 drop-shadow-lg" />
        </div>
        {watched && !done && pct > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">{video.title}</p>
        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-snug">{video.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{video.level}</span>
          {watched && !done && (
            <span className="text-[9px] font-mono text-primary">Resume · {pct}%</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function LearnVideos() {
  useSEO({ title: 'Video Library — Zotra Learn', description: 'Curated educational trading videos with resumable progress.' });
  const progressMap = useAllVideoProgress();
  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState('all');

  const filtered = VIDEOS.filter((v) => {
    const matchesTopic = activeTopic === 'all' || v.topic === activeTopic;
    const matchesQuery = !query || v.title.toLowerCase().includes(query.toLowerCase()) || v.description.toLowerCase().includes(query.toLowerCase());
    return matchesTopic && matchesQuery;
  });

  const watchedCount = Object.values(progressMap).filter((p) => p.completed).length;
  const inProgressCount = Object.values(progressMap).filter((p) => !p.completed && p.position > 0).length;

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-5">
      <Link to="/Learn" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Learn
      </Link>

      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-wider shimmer-text">VIDEO LIBRARY</h1>
          <p className="text-[11px] font-mono text-muted-foreground">Curated trading lessons · Resumable progress</p>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="text-emerald-400">{watchedCount} completed</span>
          <span className="text-primary">{inProgressCount} in progress</span>
          <span className="text-muted-foreground">{VIDEOS.length} total</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Topic filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveTopic('all')}
          className={cn('text-[11px] font-mono px-3 py-1.5 rounded-full border transition-all',
            activeTopic === 'all' ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border/50 text-muted-foreground hover:text-foreground')}
        >
          All
        </button>
        {VIDEO_TOPICS.map((t) => {
          const cls = COLOR_CLASSES[t.color] || COLOR_CLASSES.blue;
          return (
            <button key={t.id} onClick={() => setActiveTopic(t.id)}
              className={cn('text-[11px] font-mono px-3 py-1.5 rounded-full border transition-all',
                activeTopic === t.id ? cls : 'border-border/50 text-muted-foreground hover:text-foreground')}>
              {t.icon} {t.title}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="p-10 text-center text-muted-foreground text-sm">No videos match your search.</div>
      ) : (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <motion.div key={v.id} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
              <VideoCard video={v} progress={progressMap[v.id]} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <p className="text-center text-[10px] font-mono text-muted-foreground/40 pt-2">
        Videos are free educational content from YouTube · Not financial advice
      </p>
    </div>
  );
}