import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { useSEO } from '@/lib/useSEO';
import { VIDEO_BY_ID, TOPIC_BY_ID, VIDEOS } from '@/lib/learn/videos';
import { useVideoProgress } from '@/lib/learn/useVideoProgress';

let apiPromise = null;
function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev && prev(); resolve(); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  });
  return apiPromise;
}

function fmtTime(sec) {
  if (!sec || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function LearnVideo() {
  const { videoId } = useParams();
  const video = VIDEO_BY_ID[videoId];
  useSEO({ title: video ? `${video.title} — Video` : 'Video — Zotra Learn' });
  const { record, save } = useVideoProgress(videoId);

  const elRef = useRef(null);
  const playerRef = useRef(null);
  const initialPosRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!video) return;
    initialPosRef.current = record?.position || 0;
    setCompleted(record?.completed || false);
    let poll;

    loadYouTubeAPI().then(() => {
      if (!elRef.current) return;
      playerRef.current = new window.YT.Player(elRef.current, {
        videoId: video.youtubeId,
        playerVars: {
          start: Math.floor(initialPosRef.current || 0),
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (e) => {
            setReady(true);
            try { setDuration(e.target.getDuration() || 0); } catch {}
          },
          onStateChange: (e) => {
            const YT = window.YT;
            if (e.data === YT.PlayerState.PLAYING) {
              try { setDuration(e.target.getDuration() || 0); } catch {}
            }
            if (e.data === YT.PlayerState.ENDED) {
              setCompleted(true);
              try {
                const d = e.target.getDuration() || duration;
                save.mutate({ position: d, duration: d, completed: true, title: video.title, topic: video.topic });
              } catch {}
            }
          },
        },
      });

      poll = setInterval(() => {
        const p = playerRef.current;
        if (!p || !p.getCurrentTime) return;
        try {
          const t = p.getCurrentTime();
          const d = p.getDuration();
          if (t > 0) {
            setPosition(t);
            if (d) setDuration(d);
            const isDone = d && (t / d) >= 0.9;
            if (isDone && !completed) setCompleted(true);
            save.mutate({ position: t, duration: d || duration, completed: isDone, title: video.title, topic: video.topic });
          }
        } catch {}
      }, 5000);
    });

    return () => {
      if (poll) clearInterval(poll);
      try { playerRef.current && playerRef.current.destroy && playerRef.current.destroy(); } catch {}
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  if (!video) {
    return <div className="p-10 text-center text-muted-foreground">Video not found. <Link to="/Learn/Videos" className="text-primary">Back to library</Link></div>;
  }

  const topic = TOPIC_BY_ID[video.topic];
  const pct = duration ? Math.min(100, Math.round((position / duration) * 100)) : 0;
  const resumeFrom = record?.position || 0;

  const restart = () => {
    const p = playerRef.current;
    if (p && p.seekTo) { p.seekTo(0, true); p.playVideo && p.playVideo(); }
    setPosition(0);
    setCompleted(false);
    save.mutate({ position: 0, duration, completed: false, title: video.title, topic: video.topic });
  };

  // Related videos in the same topic
  const related = VIDEOS.filter((v) => v.topic === video.topic && v.id !== video.id).slice(0, 3);

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto space-y-5">
      <Link to="/Learn/Videos" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-3.5 h-3.5" /> Video Library
      </Link>

      {/* Player */}
      <div className="rounded-2xl overflow-hidden bg-card border border-border/50">
        <div className="relative aspect-video bg-black">
          <div ref={elRef} className="absolute inset-0 w-full h-full" />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="px-4 py-3 border-t border-border/50">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1.5">
              {completed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-primary" />}
              {completed ? 'Completed' : resumeFrom > 0 ? `Resumed from ${fmtTime(resumeFrom)}` : 'In progress'}
            </span>
            <span>{fmtTime(position)} / {fmtTime(duration)} · {pct}%</span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button onClick={restart}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Restart
            </button>
            {completed && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Marked complete
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="rounded-2xl p-5 bg-card border border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{topic?.icon}</span>
          <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase">{topic?.title}</span>
          <span className="ml-auto text-[9px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground">{video.level}</span>
        </div>
        <h1 className="text-xl font-black text-foreground mb-2">{video.title}</h1>
        <div className="flex items-start gap-2.5">
          <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground/85 leading-relaxed">{video.description}</p>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground/50 mt-4">
          ⚠️ Educational content from third-party creators. Not financial advice. No strategy is guaranteed.
        </p>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground/50 uppercase mb-3">More in {topic?.title}</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {related.map((rv) => (
              <Link key={rv.id} to={`/Learn/Video/${rv.id}`}
                className="flex gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/40 transition-all">
                <img src={`https://i.ytimg.com/vi/${rv.youtubeId}/default.jpg`} alt={rv.title} loading="lazy"
                  className="w-20 h-14 rounded object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground line-clamp-2 leading-snug">{rv.title}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {rv.duration}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}