import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

import bannerNoirLuxury from '../assets/images/hero_banner_noir_luxury.jpg';
import bannerAarzu from '../assets/images/hero_banner_aarzu.jpg';
import bannerBekhudi from '../assets/images/hero_banner_bekhudi.jpg';

interface HeroSlide {
  id: string;
  image: string;
  title: string;
  label: string;
  collectionKey: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'banner-noir-luxury',
    image: bannerNoirLuxury,
    title: 'NOIR LUXURY',
    label: '01 / NOIR LUXURY',
    collectionKey: 'noir-luxury',
  },
  {
    id: 'banner-aarzu',
    image: bannerAarzu,
    title: 'AARZU',
    label: '02 / AARZU',
    collectionKey: 'noir-luxury',
  },
  {
    id: 'banner-bekhudi',
    image: bannerBekhudi,
    title: 'BEKHUDI',
    label: '03 / BEKHUDI',
    collectionKey: 'luxury-formals',
  },
];

interface HeroSliderProps {
  onSelectCollection: (col: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onSelectCollection }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [direction, setDirection] = useState<-1 | 1>(1); // 1 = slide right-to-left, -1 = left-to-right
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const DURATION_MS = 5000; // 5 seconds per slide

  // Auto-play timer with live progress bar
  useEffect(() => {
    if (isAutoPlayPaused) return;

    setProgress(0);
    const intervalTime = 50; // update progress every 50ms
    const step = (intervalTime / DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setDirection(1);
          setCurrentSlideIndex((oldIndex) => (oldIndex + 1) % HERO_SLIDES.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentSlideIndex, isAutoPlayPaused]);

  const handlePrevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(-1);
    setProgress(0);
    setCurrentSlideIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(1);
    setProgress(0);
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const activeSlide = HERO_SLIDES[currentSlideIndex];

  // Slide Animation Variants (Horizontal sliding with spring physics)
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0.95,
    }),
    center: {
      x: '0%',
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0.95,
    }),
  };

  return (
    <div
      className="relative w-full aspect-[16/7] sm:aspect-[2.3/1] lg:aspect-[2400/924] min-h-[220px] sm:min-h-[340px] md:min-h-[440px] max-h-[640px] overflow-hidden bg-stone-900 select-none group"
      onMouseEnter={() => setIsAutoPlayPaused(true)}
      onMouseLeave={() => setIsAutoPlayPaused(false)}
    >
      {/* Slide Track with Horizontal Motion Animation */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={activeSlide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 220, damping: 28 },
            opacity: { duration: 0.3 },
          }}
          onClick={() => onSelectCollection(activeSlide.collectionKey)}
          className="absolute inset-0 w-full h-full cursor-pointer overflow-hidden"
          title={`Click to view ${activeSlide.title} collection`}
        >
          {/* Exact Full Resolution Banner Image */}
          <img
            src={activeSlide.image}
            alt={activeSlide.title}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.015]"
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Left Arrow */}
      <button
        onClick={handlePrevSlide}
        aria-label="Previous slide"
        className="absolute left-2.5 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-70 group-hover:opacity-100 backdrop-blur-xs cursor-pointer z-20 hover:scale-110 active:scale-90 border border-white/20 shadow-lg"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Navigation Right Arrow */}
      <button
        onClick={handleNextSlide}
        aria-label="Next slide"
        className="absolute right-2.5 sm:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-70 group-hover:opacity-100 backdrop-blur-xs cursor-pointer z-20 hover:scale-110 active:scale-90 border border-white/20 shadow-lg"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Bottom Interactive Slide Bar / Progress Indicator */}
      <div className="absolute bottom-3 sm:bottom-5 inset-x-4 sm:inset-x-8 lg:inset-x-16 z-20 flex justify-center">
        <div className="w-full max-w-xl bg-black/55 backdrop-blur-md px-3 py-1.5 sm:py-2 rounded-full border border-white/20 flex items-center gap-2 sm:gap-3 shadow-xl">
          {/* Pause / Play Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAutoPlayPaused(!isAutoPlayPaused);
            }}
            className="p-1 sm:p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title={isAutoPlayPaused ? 'Resume slideshow' : 'Pause slideshow'}
          >
            {isAutoPlayPaused ? (
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
            ) : (
              <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
            )}
          </button>

          {/* 3 Interactive Slide Bar Tracks */}
          <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-3">
            {HERO_SLIDES.map((slide, idx) => {
              const isActive = idx === currentSlideIndex;

              return (
                <button
                  key={slide.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDirection(idx > currentSlideIndex ? 1 : -1);
                    setProgress(0);
                    setCurrentSlideIndex(idx);
                  }}
                  className="relative group/bar flex flex-col gap-1 text-left cursor-pointer overflow-hidden py-0.5 px-1 rounded"
                >
                  <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-mono tracking-wider text-white/75 group-hover/bar:text-white transition-colors">
                    <span className="truncate font-semibold uppercase">{slide.title}</span>
                    <span className="text-[8px] sm:text-[9px] text-[#E2D1B3] hidden sm:inline">0{idx + 1}</span>
                  </div>

                  {/* Progress Bar Track */}
                  <div className="w-full h-1 sm:h-1.5 bg-white/25 rounded-full overflow-hidden">
                    {isActive ? (
                      <div
                        className="h-full bg-white transition-all duration-75 ease-linear rounded-full shadow-sm"
                        style={{ width: `${progress}%` }}
                      />
                    ) : (
                      <div className="h-full bg-transparent group-hover/bar:bg-white/50 transition-colors" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
