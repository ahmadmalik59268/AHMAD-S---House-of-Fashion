import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { Product } from '../types';

interface FashionReelPlayerProps {
  product: Product;
  isPlaying: boolean;
  isMuted: boolean;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

function isValidVideoUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length < 5) return false;
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('/') &&
    !trimmed.startsWith('blob:')
  ) {
    return false;
  }
  if (
    trimmed.includes('youtube.com') ||
    trimmed.includes('youtu.be') ||
    trimmed.includes('vimeo.com')
  ) {
    return false;
  }
  return true;
}

export const FashionReelPlayer: React.FC<FashionReelPlayerProps> = ({
  product,
  isPlaying,
  isMuted,
  onTimeUpdate,
  className = '',
  onClick,
}) => {
  const [videoError, setVideoError] = useState(false);
  const [, setCanvasProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const activeVideoUrl =
    product.videoReelUrl && isValidVideoUrl(product.videoReelUrl)
      ? product.videoReelUrl.trim()
      : null;

  // Reset states on product change
  useEffect(() => {
    setVideoError(false);
    setCanvasProgress(0);
  }, [product.id, product.videoReelUrl]);

  // Video element control
  useEffect(() => {
    if (videoRef.current && activeVideoUrl && !videoError) {
      if (isPlaying) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Gracefully fallback to canvas animation on any playback or source failure
            setVideoError(true);
          });
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, videoError, activeVideoUrl]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleVideoError = () => {
    setVideoError(true);
  };

  const handleNativeTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime, videoRef.current.duration || 10);
    }
  };

  // Cinematic Luxury Outfit Motion Engine (Fallback when no video URL or video error)
  useEffect(() => {
    if (activeVideoUrl && !videoError) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = product.images[0] || '/src/assets/images/hero_luxury_formal_editorial_1790851112227.jpg';
    img.onload = () => {
      imageObjRef.current = img;
    };

    const REEL_DURATION = 12; // 12 seconds per reel loop
    const startTime = Date.now();
    let pausedTimeOffset = 0;
    let lastPauseTimestamp = 0;

    const sparkles: Array<{ x: number; y: number; size: number; alpha: number; speed: number; pulse: number }> = [];
    for (let i = 0; i < 28; i++) {
      sparkles.push({
        x: Math.random(),
        y: Math.random(),
        size: 1 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.8,
        speed: 0.0003 + Math.random() * 0.0008,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;

          // Calculate elapsed time
          const elapsed = (Date.now() - startTime - pausedTimeOffset) / 1000;
          const progressRatio = (elapsed % REEL_DURATION) / REEL_DURATION;
          setCanvasProgress(progressRatio * 100);

          if (onTimeUpdate) {
            onTimeUpdate(elapsed % REEL_DURATION, REEL_DURATION);
          }

          // Clear
          ctx.fillStyle = '#100f0e';
          ctx.fillRect(0, 0, width, height);

          // Draw animated zoomed image (Cinematic slow zoom & pan)
          if (imageObjRef.current && imageObjRef.current.complete) {
            const scale = 1 + Math.sin(progressRatio * Math.PI) * 0.12;
            const panY = Math.sin(progressRatio * Math.PI * 2) * (height * 0.03);

            ctx.save();
            ctx.translate(width / 2, height / 2 + panY);
            ctx.scale(scale, scale);
            ctx.drawImage(
              imageObjRef.current,
              -width / 2,
              -height / 2,
              width,
              height
            );
            ctx.restore();
          }

          // Draw golden zardozi & crystal shimmer particles
          sparkles.forEach((s) => {
            s.pulse += 0.04;
            s.y -= s.speed;
            if (s.y < 0) s.y = 1;

            const alpha = Math.max(0.1, Math.min(0.9, s.alpha * Math.sin(s.pulse)));
            ctx.fillStyle = `rgba(226, 209, 179, ${alpha})`;
            ctx.shadowColor = '#e2d1b3';
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(s.x * width, s.y * height, s.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          });
        }
      }

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    if (isPlaying) {
      if (lastPauseTimestamp > 0) {
        pausedTimeOffset += Date.now() - lastPauseTimestamp;
        lastPauseTimestamp = 0;
      }
      animationFrameRef.current = requestAnimationFrame(render);
    } else {
      lastPauseTimestamp = Date.now();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeVideoUrl, videoError, isPlaying, product.images, onTimeUpdate]);

  return (
    <div
      onClick={onClick}
      className={`relative w-full h-full overflow-hidden bg-stone-950 select-none ${className}`}
    >
      {activeVideoUrl && !videoError ? (
        <video
          ref={videoRef}
          key={product.id}
          poster={product.images[0]}
          loop
          muted={isMuted}
          playsInline
          preload="none"
          onTimeUpdate={handleNativeTimeUpdate}
          onError={handleVideoError}
          className="w-full h-full object-cover"
        >
          <source src={activeVideoUrl} type="video/mp4" onError={handleVideoError} />
        </video>
      ) : (
        /* Cinematic Luxury Outfit Canvas Engine */
        <div className="relative w-full h-full">
          <canvas
            ref={canvasRef}
            width={720}
            height={1280}
            className="w-full h-full object-cover"
          />
          {/* Subtle Live Shimmer Badge */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-stone-950/70 backdrop-blur-md rounded-full text-white text-[10px] tracking-wider uppercase font-medium">
            <Sparkles className="w-3 h-3 text-[#E2D1B3] animate-spin" />
            <span>HD Couture Motion</span>
          </div>
        </div>
      )}
    </div>
  );
};
