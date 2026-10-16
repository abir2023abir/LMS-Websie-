'use client';

import { useEffect, useRef } from 'react';

export function youtubeId(url?: string) {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{6,})/);
  return match?.[1] || '';
}

type Player = {
  destroy?: () => void;
  getDuration?: () => number;
  getCurrentTime?: () => number;
};

export default function YoutubeLesson({
  id,
  title,
  onProgress,
}: {
  id: string;
  title?: string;
  onProgress?: (percent: number) => void;
}) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let player: Player | undefined;
    let timer = 0;
    let cancelled = false;

    const start = () => {
      if (cancelled || !host.current || !(window as any).YT?.Player) return;
      player = new (window as any).YT.Player(host.current, {
        videoId: id,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (event: { data: number }) => {
            window.clearInterval(timer);
            if (event.data === 1) {
              timer = window.setInterval(() => {
                const duration = player?.getDuration?.() || 0;
                const current = player?.getCurrentTime?.() || 0;
                if (duration && onProgress) onProgress(Math.round((current / duration) * 100));
              }, 1000);
            }
          },
        },
      });
    };

    const win = window as any;
    if (win.YT?.Player) start();
    else {
      const previous = win.onYouTubeIframeAPIReady;
      win.onYouTubeIframeAPIReady = () => {
        previous?.();
        start();
      };
      if (!document.getElementById('youtube-iframe-api')) {
        const script = document.createElement('script');
        script.id = 'youtube-iframe-api';
        script.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      player?.destroy?.();
    };
  }, [id, onProgress]);

  return <div ref={host} className="w-full h-full" title={title || 'Lesson video'} />;
}
