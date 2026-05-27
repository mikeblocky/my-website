import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils/utils';

interface ImageGalleryProps {
  urls: string[];
  theme?: 'blue' | 'violet' | 'teal' | 'amber';
}

// Flat Skeleton and smooth fade-in image wrapper to avoid layout shift
const GalleryImage: React.FC<{ 
  src: string; 
  alt: string; 
  className?: string; 
  loading?: "lazy" | "eager";
  fill?: boolean;
}> = ({ src, alt, className, loading = "eager", fill = true }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, [src]);

  if (!fill) {
    return (
      <div className={cn(
        "relative w-full overflow-hidden rounded-xl flex items-center justify-center min-h-[140px] transition-colors duration-300",
        loaded ? "bg-transparent" : "bg-slate-100 dark:bg-slate-900/60"
      )}>
        {!loaded && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest font-mono">
              loading...
            </span>
          </div>
        )}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            className, 
            "transition-opacity duration-300 ease-out", 
            loaded ? "opacity-100" : "opacity-0"
          )}
          loading={loading}
          onLoad={() => setLoaded(true)}
        />
      </div>
    );
  }

  return (
    <div className={cn(
      "relative w-full h-full overflow-hidden min-h-[140px] flex items-center justify-center transition-colors duration-300",
      loaded ? "bg-transparent" : "bg-slate-100 dark:bg-slate-900/60"
    )}>
      {!loaded && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse flex items-center justify-center">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest font-mono">
            loading...
          </span>
        </div>
      )}
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, 420px"
        unoptimized
        className={cn(
          className, 
          "transition-opacity duration-300 ease-out", 
          loaded ? "opacity-100" : "opacity-0"
        )}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

export const ImageGallery: React.FC<ImageGalleryProps> = ({ urls = [], theme = 'violet' }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isLightboxLoading, setIsLightboxLoading] = useState(true);

  // Zoom & Pan states
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const imageRef = useRef<HTMLDivElement>(null);

  // Filter out empty or invalid urls
  const cleanUrls = urls.filter(url => typeof url === 'string' && url.trim().length > 0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  }, []);

  const openLightbox = useCallback((idx: number) => {
    setDirection(1);
    setIsLightboxLoading(true);
    resetZoom();
    setActiveIdx(idx);
  }, [resetZoom]);

  const closeLightbox = useCallback(() => {
    setActiveIdx(null);
    resetZoom();
  }, [resetZoom]);

  const showPrevious = useCallback(() => {
    setActiveIdx((prev) => {
      if (prev === null) return prev;
      setDirection(-1);
      setIsLightboxLoading(true);
      resetZoom();
      return (prev - 1 + cleanUrls.length) % cleanUrls.length;
    });
  }, [cleanUrls.length, resetZoom]);

  const showNext = useCallback(() => {
    setActiveIdx((prev) => {
      if (prev === null) return prev;
      setDirection(1);
      setIsLightboxLoading(true);
      resetZoom();
      return (prev + 1) % cleanUrls.length;
    });
  }, [cleanUrls.length, resetZoom]);

  // Drag & Pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (scale === 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - translateX, y: e.clientY - translateY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || scale === 1) return;
    e.preventDefault();
    const nextX = e.clientX - dragStart.x;
    const nextY = e.clientY - dragStart.y;

    const maxTx = (scale - 1) * 350;
    const maxTy = (scale - 1) * 350;
    setTranslateX(Math.max(-maxTx, Math.min(maxTx, nextX)));
    setTranslateY(Math.max(-maxTy, Math.min(maxTy, nextY)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (scale === 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - translateX, y: touch.clientY - translateY });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || scale === 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const nextX = touch.clientX - dragStart.x;
    const nextY = touch.clientY - dragStart.y;

    const maxTx = (scale - 1) * 350;
    const maxTy = (scale - 1) * 350;
    setTranslateX(Math.max(-maxTx, Math.min(maxTx, nextX)));
    setTranslateY(Math.max(-maxTy, Math.min(maxTy, nextY)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left - rect.width / 2;
      const clickY = e.clientY - rect.top - rect.height / 2;
      setTranslateX(-clickX * 1.5);
      setTranslateY(-clickY * 1.5);
    }
  };

  // Mouse Wheel Zoom
  useEffect(() => {
    const element = imageRef.current;
    if (!element || activeIdx === null) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.005;
      setScale((prev) => {
        const nextScale = Math.max(1, Math.min(4, prev + delta));
        if (nextScale === 1) {
          setTranslateX(0);
          setTranslateY(0);
        }
        return nextScale;
      });
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [activeIdx]);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (activeIdx === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      }

      if (scale > 1) {
        const panStep = 40;
        const maxTx = (scale - 1) * 350;
        const maxTy = (scale - 1) * 350;

        if (e.key === 'ArrowLeft') {
          setTranslateX((prev) => Math.min(maxTx, prev + panStep));
        }
        if (e.key === 'ArrowRight') {
          setTranslateX((prev) => Math.max(-maxTx, prev - panStep));
        }
        if (e.key === 'ArrowUp') {
          setTranslateY((prev) => Math.min(maxTy, prev + panStep));
        }
        if (e.key === 'ArrowDown') {
          setTranslateY((prev) => Math.max(-maxTy, prev - panStep));
        }
        if (e.key === '=' || e.key === '+') {
          setScale((prev) => Math.min(4, prev + 0.5));
        }
        if (e.key === '-') {
          setScale((prev) => {
            const nextScale = Math.max(1, prev - 0.5);
            if (nextScale === 1) {
              setTranslateX(0);
              setTranslateY(0);
            }
            return nextScale;
          });
        }
      } else {
        if (e.key === 'ArrowRight') showNext();
        else if (e.key === 'ArrowLeft') showPrevious();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIdx, closeLightbox, showNext, showPrevious, scale]);

  const toggleZoomButton = () => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
    }
  };

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
          onClick={() => openLightbox(0)}
          className="group relative cursor-zoom-in overflow-hidden rounded-xl transition-all duration-300 flex items-center justify-center shadow-none border-0 w-full"
        >
          <GalleryImage 
            src={cleanUrls[0]} 
            alt="Attachment" 
            fill={false}
            className="w-full h-auto max-h-[550px] object-contain rounded-xl transition-transform duration-500 group-hover:scale-[1.01]"
          />
          <div className="gallery-zoom-overlay absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5 flex items-center justify-center pointer-events-none">
            <span className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 shadow-none">
              <ZoomIn className="h-5 w-5" />
            </span>
          </div>
        </div>
      );
    }

    // For 2 or more images, we use a CSS Columns layout (Masonry) which fits them perfectly!
    const colClass = total === 2 ? 'columns-2 gap-3.5' : 'columns-2 sm:columns-3 gap-3';
    const displayCount = Math.min(total, 5);
    const hasMore = total > 5;

    return (
      <div className={cn(colClass, "w-full [column-fill:balance]")}>
        {cleanUrls.slice(0, displayCount).map((url, idx) => {
          const isLastSlot = idx === displayCount - 1;
          const showOverlay = isLastSlot && hasMore;

          return (
            <div 
              key={url}
              onClick={() => openLightbox(idx)}
              className="group relative break-inside-avoid mb-3.5 cursor-zoom-in overflow-hidden rounded-xl transition-all duration-300 border-0 shadow-none"
            >
              <GalleryImage 
                src={url} 
                alt={`Attachment ${idx + 1}`} 
                fill={false}
                className="w-full h-auto rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
              />
              
              {showOverlay ? (
                <div className="gallery-more-overlay absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[1px] transition-all duration-300 hover:bg-black/45">
                  <span className="text-lg font-semibold text-white tracking-wide">
                    +...
                  </span>
                </div>
              ) : (
                <div className="gallery-zoom-overlay absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5 flex items-center justify-center pointer-events-none">
                  <span className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 shadow-none">
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
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95"
              onClick={closeLightbox}
            >
              {/* Invisible full-area close target (active only when scale is 1) */}
              <button
                type="button"
                aria-label="Close lightbox backdrop"
                className="absolute inset-0 z-[100]"
                onClick={scale === 1 ? closeLightbox : undefined}
              />

              {/* Toolbar Panel */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[120] flex items-center gap-2">
                {scale > 1 && (
                  <span className="text-[10px] sm:text-xs text-white/60 font-semibold uppercase tracking-widest font-mono mr-2 bg-black/40 px-2.5 py-1.5 rounded border border-white/5 pointer-events-none">
                    {scale.toFixed(1)}x Zoom
                  </span>
                )}

                {/* Zoom toggle button */}
                <button
                  type="button"
                  aria-label={scale > 1 ? "Zoom Out" : "Zoom In"}
                  className="rounded-lg bg-black/40 text-white p-2.5 hover:bg-black/60 transition-colors border border-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleZoomButton();
                  }}
                >
                  {scale > 1 ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                </button>

                {/* Close button */}
                <button
                  type="button"
                  aria-label="Close"
                  className="rounded-lg bg-black/40 text-white p-2.5 hover:bg-black/60 transition-colors border border-white/10"
                  onClick={closeLightbox}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Previous button (active when scale is 1) */}
              {scale === 1 && (
                <button
                  type="button"
                  aria-label="Previous image"
                  className="absolute top-1/2 left-4 sm:left-6 -translate-y-1/2 z-[120] rounded-lg bg-black/40 text-white p-2.5 hover:bg-black/60 transition-colors border border-white/10"
                  onClick={(e) => { e.stopPropagation(); showPrevious(); }}
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Next button (active when scale is 1) */}
              {scale === 1 && (
                <button
                  type="button"
                  aria-label="Next image"
                  className="absolute top-1/2 right-4 sm:right-6 -translate-y-1/2 z-[120] rounded-lg bg-black/40 text-white p-2.5 hover:bg-black/60 transition-colors border border-white/10"
                  onClick={(e) => { e.stopPropagation(); showNext(); }}
                >
                  <ChevronRight size={24} />
                </button>
              )}

              {/* Background adjacent prefetching for instant loads */}
              <div className="hidden" aria-hidden="true">
                <Image src={cleanUrls[(activeIdx + 1) % cleanUrls.length]} alt="" width={1} height={1} unoptimized priority />
                <Image src={cleanUrls[(activeIdx - 1 + cleanUrls.length) % cleanUrls.length]} alt="" width={1} height={1} unoptimized priority />
              </div>

              {/* Image container with direction-aware animation */}
              <div className="absolute inset-0 z-[110] flex items-center justify-center pointer-events-none overflow-hidden">
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.div
                    key={activeIdx}
                    custom={direction}
                    variants={imageMotionVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="relative flex flex-col items-center justify-center w-full h-full"
                  >
                    {/* Flat Lightbox Loader */}
                    {isLightboxLoading && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <span className="text-xs font-semibold text-white/55 uppercase tracking-widest font-mono animate-pulse">
                          loading...
                        </span>
                      </div>
                    )}

                    {/* Interactive Zoom/Pan container wrapper */}
                    <div
                      ref={imageRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      onDoubleClick={handleDoubleClick}
                      style={{
                        transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
                        cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                        transition: isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                      className="relative max-h-[86dvh] max-w-[90vw] flex items-center justify-center pointer-events-auto select-none"
                    >
                      <Image
                        src={cleanUrls[activeIdx]} 
                        alt={`Expanded Attachment ${activeIdx + 1}`} 
                        width={1600}
                        height={1200}
                        unoptimized
                        priority
                        className={cn(
                          "max-h-[86dvh] max-w-[90vw] h-auto w-auto object-contain pointer-events-none transition-opacity duration-300 ease-out shadow-none",
                          isLightboxLoading ? "opacity-0" : "opacity-100"
                        )}
                        onLoad={() => setIsLightboxLoading(false)}
                      />
                    </div>
                    
                    {/* Counter */}
                    {scale === 1 && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs font-bold tracking-widest font-mono pointer-events-none uppercase">
                        {activeIdx + 1} / {cleanUrls.length}
                      </div>
                    )}
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
