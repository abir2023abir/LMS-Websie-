'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Lock,
  RotateCcw,
  CheckCircle,
  Settings,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import YoutubeLesson, { youtubeId } from '@/components/player/YoutubeLesson';

interface VideoPlayerProps {
  videoUrl?: string;
  poster?: string;
  title?: string;
  isEnrolled?: boolean;
  onEnrollClick?: () => void;
}

export default function VideoPlayer({
  videoUrl,
  poster,
  title = 'Course Video Lesson',
  isEnrolled = false,
  onEnrollClick,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Default fallback sample video if no url is provided
  const src =
    videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.includes('sample') || videoUrl.includes('commondatastorage'))
      ? videoUrl
      : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!isEnrolled) return;
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 1;
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

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const yt = youtubeId(videoUrl);
  if (yt && isEnrolled) {
    return (
      <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl">
        <YoutubeLesson id={yt} title={title} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video rounded-3xl overflow-hidden bg-dark-800 border border-white/10 shadow-2xl group select-none"
    >
      {/* ── Video Element ── */}
      <video
        ref={videoRef}
        poster={poster || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop'}
        className="w-full h-full object-cover"
        onClick={togglePlay}
        playsInline
      >
        <source src={src} type="video/mp4" />
        Your browser does not support HTML5 video streaming.
      </video>

      {/* ── UN-ENROLLED LOCK OVERLAY ── */}
      {!isEnrolled && (
        <div className="absolute inset-0 bg-dark-900/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-4 border border-primary-500/30 shadow-lg shadow-primary-600/20 animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-2">
            This Video Lesson is Locked
          </h3>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            Enroll in this course to gain full instant access to all video modules, downloadable resources, and completion certificates.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={onEnrollClick}
            leftIcon={<CheckCircle className="w-5 h-5" />}
          >
            Enroll Now to Unlock Course
          </Button>
        </div>
      )}

      {/* ── ENROLLED VIDEO CONTROLS OVERLAY ── */}
      {isEnrolled && (
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-transparent to-dark-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-10 pointer-events-auto">
          {/* Top Title Bar */}
          <div className="flex items-center justify-between text-white font-medium text-sm">
            <span className="truncate max-w-md bg-dark-900/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              {title}
            </span>
            <span className="text-xs text-primary-300 font-semibold bg-primary-500/20 px-2.5 py-1 rounded-full border border-primary-500/30">
              HD Streaming Ready
            </span>
          </div>

          {/* Center Play/Pause Touch Overlay Button */}
          <button
            onClick={togglePlay}
            className="self-center w-16 h-16 rounded-full bg-primary-600/90 hover:bg-primary-500 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-all duration-200"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 translate-x-0.5" />}
          </button>

          {/* Bottom Custom Control Bar */}
          <div className="space-y-2 bg-dark-900/75 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            {/* Seek Bar */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-primary-500 h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />

            <div className="flex items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-primary-400 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>

                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="hover:text-white">
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 accent-primary-400 h-1 bg-white/20 rounded-lg cursor-pointer"
                  />
                </div>

                <span>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-3 relative">
                {/* Playback Speed dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu((s) => !s)}
                    className="flex items-center gap-1 hover:text-white font-semibold px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    {playbackSpeed}x
                  </button>

                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 glass rounded-xl border border-white/10 p-1 space-y-1 z-30 min-w-[70px]">
                      {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => changeSpeed(s)}
                          className={`w-full text-center px-2 py-1 text-xs rounded-lg transition-colors ${
                            playbackSpeed === s ? 'bg-primary-600 text-white font-bold' : 'hover:bg-white/10 text-slate-300'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={toggleFullScreen}
                  className="hover:text-white transition-colors"
                  aria-label="Fullscreen"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
