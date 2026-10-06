import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  ShoppingBag,
  Check,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { Product, Currency } from '../types';
import { formatPrice } from '../data/currencies';
import { FashionReelPlayer } from './FashionReelPlayer';

interface VideoReelModalProps {
  product: Product | null;
  allProducts?: Product[];
  currency: Currency;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onChangeProduct?: (product: Product) => void;
}

export const VideoReelModal: React.FC<VideoReelModalProps> = ({
  product,
  allProducts = [],
  currency,
  isOpen,
  onClose,
  onAddToCart,
  onSelectProduct,
  onChangeProduct,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likes, setLikes] = useState(184);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPlayIconAnim, setShowPlayIconAnim] = useState(false);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
    setShowPlayIconAnim(true);
    setTimeout(() => setShowPlayIconAnim(false), 600);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product) return;
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Next / Previous Reel
  const currentIndex = allProducts.findIndex((p) => p.id === product?.id);
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allProducts.length === 0 || currentIndex === -1) return;
    const prevIdx = (currentIndex - 1 + allProducts.length) % allProducts.length;
    if (onChangeProduct) onChangeProduct(allProducts[prevIdx]);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allProducts.length === 0 || currentIndex === -1) return;
    const nextIdx = (currentIndex + 1) % allProducts.length;
    if (onChangeProduct) onChangeProduct(allProducts[nextIdx]);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4">
      {/* Close button top right */}
      <button
        onClick={onClose}
        aria-label="Close video reel"
        className="absolute top-4 right-4 z-50 text-white/80 hover:text-white p-2.5 rounded-full bg-black/50 backdrop-blur-xs transition-colors cursor-pointer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev / Next Buttons (Desktop) */}
      {allProducts.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous outfit reel"
            className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition-all cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next outfit reel"
            className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition-all cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Reel Phone Container (9:16 aspect ratio) */}
      <div
        onClick={togglePlayPause}
        className="relative w-full max-w-[390px] h-[86vh] max-h-[740px] bg-black rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between select-none cursor-pointer"
      >
        {/* Progress Bar Header */}
        <div className="absolute top-0 inset-x-0 z-30 p-3 pt-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Progress bar */}
          <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden mb-3">
            <div
              className="bg-white h-full transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#E2D1B3] text-stone-950 font-serif-luxury font-bold text-xs flex items-center justify-center">
                A
              </div>
              <span className="font-serif-luxury tracking-widest font-semibold uppercase">
                AHMAD&apos;S REELS
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                title={isMuted ? 'Unmute sound' : 'Mute sound'}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={handleFullscreen}
                title="Fullscreen"
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer hidden sm:block"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Player Component */}
        <div className="relative w-full h-full flex items-center justify-center bg-stone-950">
          <FashionReelPlayer
            product={product}
            isPlaying={isPlaying}
            isMuted={isMuted}
            onTimeUpdate={(currentTime, duration) => {
              if (duration > 0) {
                setProgress((currentTime / duration) * 100);
              }
            }}
          />

          {/* Central Play / Pause transient flash */}
          {showPlayIconAnim && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center animate-ping">
                {isPlaying ? <Play className="w-8 h-8 fill-white ml-1" /> : <Pause className="w-8 h-8 fill-white" />}
              </div>
            </div>
          )}

          {!isPlaying && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Play className="w-8 h-8 fill-white text-white ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Right Floating Actions (Like, Share, Sound) */}
        <div className="absolute right-3 bottom-28 z-30 flex flex-col items-center gap-3.5 text-white">
          {/* Like */}
          <button
            onClick={handleToggleLike}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? 'fill-[#C82944] text-[#C82944]' : 'text-white'
                }`}
              />
            </div>
            <span className="text-[11px] font-medium drop-shadow">{likes}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-1 group cursor-pointer"
            title="Share Reel"
          >
            <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center group-hover:scale-110 transition-transform">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] font-medium drop-shadow">
              {copied ? 'Copied' : 'Share'}
            </span>
          </button>
        </div>

        {/* Bottom Product Overlay Card */}
        <div className="absolute bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-black via-black/85 to-transparent">
          <div className="bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl p-3 flex items-center justify-between gap-3 text-white">
            <div
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                onSelectProduct(product);
              }}
            >
              <img
                src={product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-12 h-14 object-cover rounded shrink-0 border border-stone-700"
              />
              <div className="truncate">
                <p className="text-xs font-semibold uppercase tracking-wider truncate">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 text-xs mt-0.5">
                  <span className="text-white font-semibold">
                    {formatPrice(product.salePrice, currency)}
                  </span>
                  {product.originalPrice > product.salePrice && (
                    <span className="text-stone-400 line-through text-[11px]">
                      {formatPrice(product.originalPrice, currency)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-stone-400 underline">Tap for details &amp; sizes</span>
              </div>
            </div>

            <button
              onClick={handleQuickAdd}
              className="px-3.5 py-2.5 bg-white text-stone-950 text-xs font-semibold uppercase tracking-wider rounded-lg shrink-0 hover:bg-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Buy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
