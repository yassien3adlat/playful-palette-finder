import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Video } from "@/data/videos";

const levelColors: Record<string, string> = {
  "مبتدئ": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "متوسط": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "متقدم": "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

export function VideoCard({ video }: { video: Video }) {
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Card className="group card-premium border-border/30 overflow-hidden bg-card/80">
      <div ref={ref} className="aspect-video bg-muted/30 relative overflow-hidden">
        {visible && !playing && (
          <>
            <img
              src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
            <button
              onClick={() => setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center group/play"
              aria-label={`تشغيل ${video.title}`}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/90 backdrop-blur-md flex items-center justify-center group-hover/play:scale-110 group-hover/play:bg-primary transition-all duration-300 shadow-[var(--shadow-xl)] border border-primary-foreground/10">
                <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground mr-[-2px]" />
              </div>
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-3.5 flex items-end justify-between">
              <span className="flex items-center gap-1.5 bg-foreground/60 backdrop-blur-md text-primary-foreground text-[11px] px-3 py-1.5 rounded-xl font-medium border border-primary-foreground/10">
                <Clock className="w-3 h-3" /> {video.duration}
              </span>
              <span className={cn("text-[11px] px-3 py-1.5 rounded-xl font-bold backdrop-blur-md border", levelColors[video.level])}>
                {video.level}
              </span>
            </div>
          </>
        )}
        {visible && playing && (
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full"
            title={video.title}
          />
        )}
        {!visible && <div className="w-full h-full skeleton" />}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2 mb-2.5">{video.title}</h3>
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground font-medium">📺 {video.channel}</p>
          <Badge variant="outline" className="text-[10px] px-2.5 py-0.5 h-5 rounded-full border-border/40 font-semibold">
            {video.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
