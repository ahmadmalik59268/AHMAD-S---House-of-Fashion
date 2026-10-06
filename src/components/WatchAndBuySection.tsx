import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, X, Maximize2 } from 'lucide-react';
import { Product, Currency } from '../types';
import { formatPrice } from '../data/currencies';

interface WatchAndBuySectionProps {
  products: Product[];
  currency: Currency;
  onSelectProduct: (product: Product) => void;
  onWatchVideo: (product: Product) => void;
}

function isValidMediaVideo(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length < 5) return false;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/') && !trimmed.startsWith('blob:')) {
    return false;
  }
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be') || trimmed.includes('vimeo.com')) {
    return false;
  }
  return true;
}

export const WatchAndBuySection: React.FC<WatchAndBuySectionProps> = ({
  products,
  currency,
  onSelectProduct,
  onWatchVideo,
}) => {
  // Only products with real, playable video files
  const videoProducts = products
    .filter((p) => Boolean(p.videoReelUrl && isValidMediaVideo(p.videoReelUrl)))
    .slice(0, 10);

  if (videoProducts.length === 0) {
    return null;
  }

  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const handleStartPlay = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();

    // Pause any previously playing video
    if (activePlayingId && videoRefs.current[activePlayingId]) {
      videoRefs.current[activePlayingId]?.pause();
    }

    setActivePlayingId(productId);
    setIsPaused(false);

    setTimeout(() => {
      const vid = videoRefs.current[productId];
      if (vid) {
        vid.muted = isMuted;
        vid.play().catch(() => {
          if (vid) {
            vid.muted = true;
            setIsMuted(true);
            vid.play();
          }
        });
      }
    }, 50);
  };

  const handleStopPlay = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const vid = videoRefs.current[productId];
    if (vid) vid.pause();
    setActivePlayingId(null);
    setIsPaused(false);
  };

  const handleTogglePause = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const vid = videoRefs.current[productId];
    if (!vid) return;

    if (vid.paused) {
      vid.play();
      setIsPaused(false);
    } else {
      vid.pause();
      setIsPaused(true);
    }
  };

  const handleToggleMute = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    const vid = videoRefs.current[productId];
    if (vid) {
      vid.muted = nextMute;
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title matching reference video */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl tracking-[0.18em] text-stone-950 uppercase font-medium">
            WATCH &amp; BUY
          </h2>
        </div>

        {/* 5-Column Video Reels Grid / Horizontal Scroll on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
          {videoProducts.map((product) => {
            const isPlayingThis = activePlayingId === product.id;

            return (
              <div
                key={product.id}
                className="group relative aspect-[9/16] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-stone-900 shadow-md cursor-pointer select-none"
                onClick={() => onSelectProduct(product)}
              >
                {/* Poster Image */}
                {!isPlayingThis && (
                  <img
                    src={product.videoThumb || product.images[0]}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}

                {/* HTML5 Video element */}
                {isPlayingThis && product.videoReelUrl && (
                  <div
                    className="absolute inset-0 bg-black flex items-center justify-center z-10"
                    onClick={(e) => handleTogglePause(e, product.id)}
                  >
                    <video
                      ref={(el) => {
                        videoRefs.current[product.id] = el;
                      }}
                      poster={product.videoThumb || product.images[0]}
                      playsInline
                      webkit-playsinline="true"
                      preload="none"
                      loop
                      onEnded={() => setActivePlayingId(null)}
                      onError={() => setActivePlayingId(null)}
                      className="w-full h-full object-cover object-top"
                    >
                      <source
                        src={product.videoReelUrl}
                        type="video/mp4"
                        onError={() => setActivePlayingId(null)}
                      />
                    </video>

                    {/* Video Header Controls */}
                    <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-20">
                      <button
                        onClick={(e) => handleToggleMute(e, product.id)}
                        className="w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={(e) => handleStopPlay(e, product.id)}
                        className="w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Close video"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom Play/Pause & Fullscreen Button */}
                    <div className="absolute bottom-16 inset-x-2.5 flex items-center justify-between z-20">
                      <button
                        onClick={(e) => handleTogglePause(e, product.id)}
                        className="px-2.5 py-1 bg-black/50 hover:bg-black/80 rounded-full text-white text-[11px] font-medium flex items-center gap-1 backdrop-blur-xs cursor-pointer"
                      >
                        {isPaused ? <Play className="w-3 h-3 fill-white" /> : <Pause className="w-3 h-3 fill-white" />}
                        <span>{isPaused ? 'Play' : 'Pause'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStopPlay(e, product.id);
                          onWatchVideo(product);
                        }}
                        className="p-1.5 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-xs cursor-pointer"
                        title="Open Story Reel"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Circular Glass Play Button in Center (when video is not playing) */}
                {!isPlayingThis && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <button
                      onClick={(e) => handleStartPlay(e, product.id)}
                      className="w-12 h-12 rounded-full bg-white/30 group-hover:bg-white/50 backdrop-blur-md border border-white/40 flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 pointer-events-auto cursor-pointer shadow-lg"
                      aria-label={`Play reel for ${product.name}`}
                    >
                      <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                    </button>
                  </div>
                )}

                {/* Dark Vignette Overlay at bottom for readable product card */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none z-10" />

                {/* Bottom Product Info Card Overlay matching reference video */}
                <div
                  className="absolute inset-x-2.5 bottom-2.5 p-2 bg-stone-950/80 hover:bg-stone-950 backdrop-blur-md rounded-lg text-white text-center z-20 transition-colors cursor-pointer border border-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProduct(product);
                  }}
                >
                  <p className="text-[11px] sm:text-xs font-medium tracking-wide truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5 text-[10px] sm:text-[11px]">
                    {product.discountPercent ? (
                      <>
                        <span className="text-stone-400 line-through">
                          {formatPrice(product.originalPrice, currency)}
                        </span>
                        <span className="font-semibold text-[#E2D1B3]">
                          {formatPrice(product.salePrice, currency)}
                        </span>
                      </>
                    ) : (
                      <span className="font-semibold text-white">
                        {formatPrice(product.salePrice, currency)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
