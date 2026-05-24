import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
  urls: string[];
  theme?: 'blue' | 'violet';
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ urls = [], theme = 'violet' }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Filter out empty or invalid urls
  const cleanUrls = urls.filter(url => typeof url === 'string' && url.trim().length > 0);

  // Handle keyboard navigation for Lightbox
  useEffect(() => {
    if (activeIdx === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveIdx(null);
      } else if (e.key === 'ArrowRight') {
        setActiveIdx((prev) => (prev !== null && prev < cleanUrls.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft') {
        setActiveIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx, cleanUrls.length]);

  if (cleanUrls.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx !== null && activeIdx > 0) {
      setActiveIdx(activeIdx - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx !== null && activeIdx < cleanUrls.length - 1) {
      setActiveIdx(activeIdx + 1);
    }
  };

  const ringColor = theme === 'blue'
    ? 'focus-visible:ring-blue-500'
    : 'focus-visible:ring-violet-500';

  // Layout rendering depending on the number of images
  const renderGrid = () => {
    const total = cleanUrls.length;

    if (total === 1) {
      return (
        <div 
          onClick={() => setActiveIdx(0)}
          className="group relative cursor-zoom-in overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-800/80 bg-gray-50 dark:bg-gray-900/40 transition-all duration-300 hover:shadow-md max-h-[360px] flex items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={cleanUrls[0]} 
            alt="Attachment" 
            className="w-full max-h-[360px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5 flex items-center justify-center">
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
              onClick={() => setActiveIdx(idx)}
              className="group relative aspect-video cursor-zoom-in overflow-hidden rounded-xl border border-gray-200/60 dark:border-gray-800/80 bg-gray-50 dark:bg-gray-900/40 transition-all duration-300 hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={url} 
                alt={`Attachment ${idx + 1}`} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5 flex items-center justify-center">
                <span className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 p-2 rounded-full bg-white/90 dark:bg-gray-950/90 text-gray-700 dark:text-gray-300 shadow-md">
                  <ZoomIn className="h-4.5 w-4.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // 3 or more images: Show a stunning layout with a large left/top image and stacked right/bottom images
    // Limit main display to 3 grid spots, showing +N on the last one if total > 3
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
              onClick={() => setActiveIdx(idx)}
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px] transition-all duration-300 hover:bg-black/45">
                  <span className="text-xl font-semibold text-white tracking-wide">
                    +{total - 2}
                  </span>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5 flex items-center justify-center">
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

      {/* Lightbox Overlay */}
      {activeIdx !== null && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 transition-all duration-300 animate-in fade-in"
          onClick={() => setActiveIdx(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setActiveIdx(null)}
            className="absolute top-5 right-5 z-[10000] p-3 rounded-full bg-black/40 text-white/80 hover:bg-black/60 hover:text-white transition-all cursor-pointer border border-white/5 shadow-lg focus:outline-none"
            aria-label="Close Lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Left Arrow */}
          {activeIdx > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-5 z-[10000] p-3 rounded-full bg-black/40 text-white/80 hover:bg-black/60 hover:text-white transition-all cursor-pointer border border-white/5 shadow-lg focus:outline-none"
              aria-label="Previous Image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image Viewer */}
          <div 
            className="relative max-w-[90vw] max-h-[85vh] select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={cleanUrls[activeIdx]} 
              alt={`Expanded Attachment ${activeIdx + 1}`} 
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200"
            />
            {/* Counter */}
            <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium tracking-wide">
              {activeIdx + 1} / {cleanUrls.length}
            </div>
          </div>

          {/* Right Arrow */}
          {activeIdx < cleanUrls.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-5 z-[10000] p-3 rounded-full bg-black/40 text-white/80 hover:bg-black/60 hover:text-white transition-all cursor-pointer border border-white/5 shadow-lg focus:outline-none"
              aria-label="Next Image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
