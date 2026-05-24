import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ImageGalleryProps {
  urls: string[];
  theme?: 'blue' | 'violet';
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ urls = [], theme = 'violet' }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Filter out empty or invalid urls
  const cleanUrls = urls.filter(url => typeof url === 'string' && url.trim().length > 0);

  useEffect(() => setMounted(true), []);

  const closeLightbox = useCallback(() => setActiveIdx(null), []);
  const showPrevious = useCallback(() => {
    setActiveIdx((prev) => {
      if (prev === null) return prev;
      setDirection(-1);
      return (prev - 1 + cleanUrls.length) % cleanUrls.length;
    });
  }, [cleanUrls.length]);
  const showNext = useCallback(() => {
    setActiveIdx((prev) => {
      if (prev === null) return prev;
      setDirection(1);
      return (prev + 1) % cleanUrls.length;
    });
  }, [cleanUrls.length]);

  // Handle keyboard navigation & body scroll lock
  useEffect(() => {
    if (activeIdx === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') showNext();
      else if (e.key === 'ArrowLeft') showPrevious();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIdx, closeLightbox, showNext, showPrevious]);

  if (cleanUrls.length === 0) return null;

  const imageMotionVariants = {
    enter: (currentDirection: 1 | -1) => ({
      opacity: 0,
      x: currentDirection * 28,
      scale: 0.985,
      filter: 'blur(6px)'
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: 'blur(0px)'
    },
    exit: (currentDirection: 1 | -1) => ({
      opacity: 0,
      x: currentDirection * -28,
      scale: 0.985,
      filter: 'blur(6px)'
    })
  };

  // Layout rendering depending on the number of images
  const renderGrid = () => {
    const total = cleanUrls.length;

    if (total === 1) {
      return (
        <div 
          onClick={() => { setDirection(1); setActiveIdx(0); }}
          className="group relative cursor-zoom-in overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-800/80 bg-gray-50 dark:bg-gray-900/40 transition-all duration-300 hover:shadow-md max-h-[360px] flex items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={cleanUrls[0]} 
            alt="Attachment" 
            className="w-full max-h-[360px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="gallery-zoom-overlay absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5 flex items-center justify-center">
            <span className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 p-2.5 rounded-full bg-white/90 dark:bg-gray-950/90 text-gray-700 dark:text-gray-300 shadow-md">
              <ZoomIn className="h-5 w-5" />
            </span>
          </div>
        </div>
      );
    }

    if (total === 2) {
      return (
        <div className="grid grid-cols-2 gap-3.5">
          {cleanUrls.map((url, idx) => (
            <div 
              key={idx}
              onClick={() => { setDirection(1); setActiveIdx(idx); }}
              className="group relative aspect-video cursor-zoom-in overflow-hidden rounded-xl border border-gray-200/60 dark:border-gray-800/80 bg-gray-50 dark:bg-gray-900/40 transition-all duration-300 hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={url} 
                alt={`Attachment ${idx + 1}`} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="gallery-zoom-overlay absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5 flex items-center justify-center">
                <span className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 p-2 rounded-full bg-white/90 dark:bg-gray-950/90 text-gray-700 dark:text-gray-300 shadow-md">
                  <ZoomIn className="h-4.5 w-4.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // 3 or more images
    const displayCount = Math.min(total, 3);
    const hasMore = total > 3;

    return (
      <div className="grid grid-cols-3 gap-3">
        {cleanUrls.slice(0, displayCount).map((url, idx) => {
          const isLastSlot = idx === displayCount - 1;
          const showOverlay = isLastSlot && hasMore;

          return (
            <div 
              key={idx}
              onClick={() => { setDirection(1); setActiveIdx(idx); }}
              className={`group relative ${idx === 0 ? 'col-span-2 aspect-video' : 'aspect-square'} cursor-zoom-in overflow-hidden rounded-xl border border-gray-200/60 dark:border-gray-800/80 bg-gray-50 dark:bg-gray-900/40 transition-all duration-300 hover:shadow-md`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={url} 
                alt={`Attachment ${idx + 1}`} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              
              {showOverlay ? (
                <div className="gallery-more-overlay absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px] transition-all duration-300 hover:bg-black/45">
                  <span className="text-xl font-semibold text-white tracking-wide">
                    +{total - 2}
                  </span>
                </div>
              ) : (
                <div className="gallery-zoom-overlay absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5 flex items-center justify-center">
                  <span className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 p-2 rounded-full bg-white/90 dark:bg-gray-950/90 text-gray-700 dark:text-gray-300 shadow-md">
                    <ZoomIn className="h-4.5 w-4.5" />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full my-3">
      {renderGrid()}

      {/* Lightbox — portaled to document.body with framer-motion */}
      {mounted && createPortal(
        <AnimatePresence>
          {activeIdx !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85"
              onClick={closeLightbox}
            >
              {/* Invisible full-area close target */}
              <button
                type="button"
                aria-label="Close lightbox backdrop"
                className="absolute inset-0 z-[100]"
                onClick={closeLightbox}
              />

              {/* Close button */}
              <button
                type="button"
                aria-label="Close"
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[120] rounded-md bg-black/40 text-white p-2 hover:bg-black/60 transition-colors"
                onClick={closeLightbox}
              >
                <X size={20} />
              </button>

              {/* Previous button */}
              <button
                type="button"
                aria-label="Previous image"
                className="absolute top-1/2 left-4 sm:left-6 -translate-y-1/2 z-[120] rounded-md bg-black/40 text-white p-2 hover:bg-black/60 transition-colors"
                onClick={(e) => { e.stopPropagation(); showPrevious(); }}
              >
                <ChevronLeft size={24} />
              </button>

              {/* Next button */}
              <button
                type="button"
                aria-label="Next image"
                className="absolute top-1/2 right-4 sm:right-6 -translate-y-1/2 z-[120] rounded-md bg-black/40 text-white p-2 hover:bg-black/60 transition-colors"
                onClick={(e) => { e.stopPropagation(); showNext(); }}
              >
                <ChevronRight size={24} />
              </button>

              {/* Image container with direction-aware animation */}
              <div className="absolute inset-0 z-[110] flex items-center justify-center pointer-events-none">
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.div
                    key={activeIdx}
                    custom={direction}
                    variants={imageMotionVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex flex-col items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={cleanUrls[activeIdx]} 
                      alt={`Expanded Attachment ${activeIdx + 1}`} 
                      className="max-h-[88dvh] max-w-[92vw] h-auto w-auto object-contain pointer-events-auto shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {/* Counter */}
                    <div className="mt-4 text-white/60 text-sm font-medium tracking-wide pointer-events-none">
                      {activeIdx + 1} / {cleanUrls.length}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};
