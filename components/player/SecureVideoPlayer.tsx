'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  ShieldCheck,
  CheckCircle,
  SkipForward,
  SkipBack,
  Sliders,
  Tv,
} from 'lucide-react';

interface SecureVideoPlayerProps {
  videoUrl?: string;
  poster?: string;
  title?: string;
  studentName?: string;
  studentEmail?: string;
  autoPlayNext?: boolean;
  onEnded?: () => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  hasNextLesson?: boolean;
  hasPrevLesson?: boolean;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
}

export default function SecureVideoPlayer({
  videoUrl,
  poster,
  title = 'Lesson Video',
  studentName = 'Student Learner',
  studentEmail = 'student@englishcapsules.com',
  autoPlayNext = true,
  onEnded,
  onNextLesson,
  onPrevLesson,
  hasNextLesson = false,
  hasPrevLesson = false,
  isCompleted = false,
  onToggleComplete,
}: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hoverSeekTime, setHoverSeekTime] = useState<number | null>(null);
  const [hoverSeekX, setHoverSeekX] = useState<number>(0);
  const [watermarkPos, setWatermarkPos] = useState({ top: '15%', left: '20%' });

  // Safe fallback sample video stream
  const sampleVideos = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  ];

  const src =
    videoUrl && (videoUrl.startsWith('http') || videoUrl.startsWith('/'))
      ? videoUrl
      : sampleVideos[0];

  // Watermark drifting position timer to discourage screen recording
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTop = Math.floor(10 + Math.random() * 70);
      const randomLeft = Math.floor(10 + Math.random() * 65);
      setWatermarkPos({ top: `${randomTop}%`, left: `${randomLeft}%` });
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVideoEnded = () => {
      setIsPlaying(false);
      if (onEnded) {
        onEnded();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleVideoEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleVideoEnded);
    };
  }, [onEnded]);

  // Fullscreen change detection
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Controls auto-hide when active
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 3500);
    }
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const seekRelative = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const target = Math.max(0, Math.min(duration, video.currentTime + seconds));
    video.currentTime = target;
    setCurrentTime(target);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleSeekMouseMove = (e: React.MouseEvent<HTMLInputElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(duration, pos * duration));
    setHoverSeekTime(time);
    setHoverSeekX(e.clientX - rect.left);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP error:', err);
    }
  };

  // Keyboard controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (['Space', 'ArrowLeft', 'ArrowRight', 'KeyM', 'KeyF'].includes(e.code)) {
      e.preventDefault();
    }
    if (e.code === 'Space') togglePlay();
    if (e.code === 'ArrowLeft') seekRelative(-5);
    if (e.code === 'ArrowRight') seekRelative(5);
    if (e.code === 'KeyM') toggleMute();
    if (e.code === 'KeyF') toggleFullscreen();
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onContextMenu={(e) => e.preventDefault()} // Anti-piracy context menu lock
      className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl group select-none outline-none"
    >
      {/* ── HTML5 Video Element ── */}
      <video
        ref={videoRef}
        src={src}
        poster={poster || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1280&h=720&fit=crop'}
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* ── SECURITY WATERMARK OVERLAY (Anti-Piracy) ── */}
      <div
        className="absolute pointer-events-none transition-all duration-1000 z-10 select-none opacity-25"
        style={{ top: watermarkPos.top, left: watermarkPos.left }}
      >
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10 text-[10px] text-white/70 font-mono tracking-tight shadow-md">
          <ShieldCheck className="w-3 h-3 text-[#FACC15]" />
          <span>{studentName} • {studentEmail}</span>
        </div>
      </div>

      {/* ── CONTROLS OVERLAY ── */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 flex flex-col justify-between p-4 sm:p-6 transition-opacity duration-300 z-20 ${
          showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-2 max-w-[70%]">
            <span className="bg-[#FACC15] text-[#111827] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Capsule Player
            </span>
            <h3 className="font-display font-semibold text-white truncate text-xs sm:text-sm">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {autoPlayNext && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                Auto-Next ON
              </span>
            )}
            <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/10 font-mono">
              1080p HD
            </span>
          </div>
        </div>

        {/* Center Touch Play/Pause & Skip Overlay */}
        <div className="self-center flex items-center gap-6 sm:gap-10">
          {hasPrevLesson && (
            <button
              onClick={onPrevLesson}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110"
              title="Previous Lesson"
            >
              <SkipBack className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => seekRelative(-10)}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110"
            title="Rewind 10 seconds"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FACC15] hover:bg-[#eab308] text-[#111827] flex items-center justify-center shadow-2xl shadow-[#FACC15]/40 hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
            ) : (
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={() => seekRelative(10)}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110"
            title="Forward 10 seconds"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          {hasNextLesson && (
            <button
              onClick={onNextLesson}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all hover:scale-110"
              title="Next Lesson"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Bottom Custom Controls Bar */}
        <div className="space-y-3 bg-black/60 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 shadow-xl">
          {/* Custom Seek Bar with Preview Tooltip */}
          <div className="relative group/seek">
            {hoverSeekTime !== null && (
              <div
                className="absolute -top-7 transform -translate-x-1/2 bg-[#111827] text-white text-[10px] font-mono px-2 py-0.5 rounded border border-white/20 pointer-events-none shadow"
                style={{ left: `${hoverSeekX}px` }}
              >
                {formatTime(hoverSeekTime)}
              </div>
            )}

            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeekChange}
                onMouseMove={handleSeekMouseMove}
                onMouseLeave={() => setHoverSeekTime(null)}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FACC15] focus:outline-none transition-all group-hover/seek:h-2.5"
                style={{
                  background: `linear-gradient(to right, #FACC15 0%, #FACC15 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%, rgba(255,255,255,0.2) 100%)`,
                }}
              />
            </div>
          </div>

          {/* Controls Bottom Row */}
          <div className="flex items-center justify-between gap-3 text-xs text-white">
            {/* Left Controls: Play, Volume, Time */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={togglePlay}
                className="hover:text-[#FACC15] transition-colors p-1"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              {/* Volume Slider & Mute Toggle */}
              <div className="flex items-center gap-2 group/vol">
                <button onClick={toggleMute} className="hover:text-[#FACC15] transition-colors">
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-14 sm:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#FACC15]"
                />
              </div>

              {/* Time display */}
              <div className="text-[11px] font-mono text-slate-300">
                <span className="text-white font-semibold">{formatTime(currentTime)}</span>
                <span className="mx-1 text-slate-500">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls: Mark Complete, Speed, PiP, Fullscreen */}
            <div className="flex items-center gap-2 sm:gap-3">
              {onToggleComplete && (
                <button
                  onClick={onToggleComplete}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  <CheckCircle className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-400' : ''}`} />
                  <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
                </button>
              )}

              {/* Speed dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu((s) => !s)}
                  className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 transition-colors"
                >
                  <span>{playbackSpeed}x</span>
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-[#111827] border border-white/15 rounded-xl p-1 shadow-2xl z-30 min-w-[80px] space-y-1">
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => changeSpeed(s)}
                        className={`w-full text-left px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          playbackSpeed === s
                            ? 'bg-[#FACC15] text-[#111827] font-bold'
                            : 'text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Picture in Picture */}
              <button
                onClick={togglePiP}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Picture-in-Picture"
              >
                <Tv className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
