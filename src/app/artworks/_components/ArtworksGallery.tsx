'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react'
import { useCallback, useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils/utils'

interface Artwork {
	src: string
	isPortrait: boolean
	width: number
	height: number
}

interface ArtworkSection {
	title: string
	items: Artwork[]
}

interface ArtworksGalleryProps {
	sections: ArtworkSection[]
	className?: string
	sectionClassName?: string
	sectionTitleClassName?: string
	gridClassName?: string
	cardClassName?: string
	imageClassName?: string
	lightboxBackdropClassName?: string
	imageAlt?: string
	enlargedImageAlt?: string
}

export function ArtworksGallery({
	sections,
	className,
	sectionClassName,
	sectionTitleClassName,
	gridClassName,
	cardClassName,
	imageClassName,
	lightboxBackdropClassName,
	imageAlt = 'Artwork',
	enlargedImageAlt = 'Artwork enlarged'
}: ArtworksGalleryProps) {
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
	const [mounted, setMounted] = useState(false)
	const [direction, setDirection] = useState<1 | -1>(1)
	const [loadedThumbnails, setLoadedThumbnails] = useState<Record<string, boolean>>({})
	const [isLightboxLoading, setIsLightboxLoading] = useState(true)

	// Transform zoom & pan states
	const [scale, setScale] = useState(1)
	const [translateX, setTranslateX] = useState(0)
	const [translateY, setTranslateY] = useState(0)
	const [isDragging, setIsDragging] = useState(false)
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

	const imageRef = useRef<HTMLDivElement>(null)

	const allArtworks = sections.flatMap((section) =>
		section.items.map((item) => ({
			src: item.src,
			width: item.width,
			height: item.height
		}))
	)

	useEffect(() => setMounted(true), [])

	const resetZoom = useCallback(() => {
		setScale(1)
		setTranslateX(0)
		setTranslateY(0)
	}, [])

	// Reset lightbox states when changing images or closing
	useEffect(() => {
		if (selectedIndex !== null) {
			setIsLightboxLoading(true)
		}
		resetZoom()
	}, [selectedIndex, resetZoom])

	const closeLightbox = useCallback(() => {
		setSelectedIndex(null)
		resetZoom()
	}, [resetZoom])

	const showPrevious = useCallback(() => {
		setSelectedIndex((currentIndex) => {
			if (currentIndex === null) {
				return currentIndex
			}
			setDirection(-1)
			return (currentIndex - 1 + allArtworks.length) % allArtworks.length
		})
	}, [allArtworks.length])

	const showNext = useCallback(() => {
		setSelectedIndex((currentIndex) => {
			if (currentIndex === null) {
				return currentIndex
			}
			setDirection(1)
			return (currentIndex + 1) % allArtworks.length
		})
	}, [allArtworks.length])

	// Drag & Pan handlers
	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		if (scale === 1) return
		e.preventDefault()
		setIsDragging(true)
		setDragStart({ x: e.clientX - translateX, y: e.clientY - translateY })
	}

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!isDragging || scale === 1) return
		e.preventDefault()
		const nextX = e.clientX - dragStart.x
		const nextY = e.clientY - dragStart.y

		// Bounded translation
		const maxTx = (scale - 1) * 350
		const maxTy = (scale - 1) * 350
		setTranslateX(Math.max(-maxTx, Math.min(maxTx, nextX)))
		setTranslateY(Math.max(-maxTy, Math.min(maxTy, nextY)))
	}

	const handleMouseUp = () => {
		setIsDragging(false)
	}

	const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		if (scale === 1 || e.touches.length !== 1) return
		const touch = e.touches[0]
		setIsDragging(true)
		setDragStart({ x: touch.clientX - translateX, y: touch.clientY - translateY })
	}

	const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
		if (!isDragging || scale === 1 || e.touches.length !== 1) return
		const touch = e.touches[0]
		const nextX = touch.clientX - dragStart.x
		const nextY = touch.clientY - dragStart.y

		const maxTx = (scale - 1) * 350
		const maxTy = (scale - 1) * 350
		setTranslateX(Math.max(-maxTx, Math.min(maxTx, nextX)))
		setTranslateY(Math.max(-maxTy, Math.min(maxTy, nextY)))
	}

	const handleTouchEnd = () => {
		setIsDragging(false)
	}

	const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault()
		if (scale > 1) {
			resetZoom()
		} else {
			setScale(2.5)
			const rect = e.currentTarget.getBoundingClientRect()
			const clickX = e.clientX - rect.left - rect.width / 2
			const clickY = e.clientY - rect.top - rect.height / 2
			setTranslateX(-clickX * 1.5)
			setTranslateY(-clickY * 1.5)
		}
	}

	// Mouse Wheel zoom listener with passive option disabled to allow preventDefault
	useEffect(() => {
		const element = imageRef.current
		if (!element || selectedIndex === null) return

		const handleWheel = (e: WheelEvent) => {
			e.preventDefault()
			const delta = -e.deltaY * 0.005
			setScale((prev) => {
				const nextScale = Math.max(1, Math.min(4, prev + delta))
				if (nextScale === 1) {
					setTranslateX(0)
					setTranslateY(0)
				}
				return nextScale
			})
		}

		element.addEventListener('wheel', handleWheel, { passive: false })
		return () => {
			element.removeEventListener('wheel', handleWheel)
		}
	}, [selectedIndex])

	// Keyboard event listener
	useEffect(() => {
		if (selectedIndex === null) {
			return
		}

		const handleKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closeLightbox()
			}

			if (scale > 1) {
				const panStep = 40
				const maxTx = (scale - 1) * 350
				const maxTy = (scale - 1) * 350

				if (event.key === 'ArrowLeft') {
					setTranslateX((prev) => Math.min(maxTx, prev + panStep))
				}
				if (event.key === 'ArrowRight') {
					setTranslateX((prev) => Math.max(-maxTx, prev - panStep))
				}
				if (event.key === 'ArrowUp') {
					setTranslateY((prev) => Math.min(maxTy, prev + panStep))
				}
				if (event.key === 'ArrowDown') {
					setTranslateY((prev) => Math.max(-maxTy, prev - panStep))
				}
				if (event.key === '=' || event.key === '+') {
					setScale((prev) => Math.min(4, prev + 0.5))
				}
				if (event.key === '-') {
					setScale((prev) => {
						const nextScale = Math.max(1, prev - 0.5)
						if (nextScale === 1) {
							setTranslateX(0)
							setTranslateY(0)
						}
						return nextScale
					})
				}
			} else {
				if (event.key === 'ArrowLeft') {
					showPrevious()
				}
				if (event.key === 'ArrowRight') {
					showNext()
				}
			}
		}

		document.body.style.overflow = 'hidden'
		window.addEventListener('keydown', handleKey)

		return () => {
			document.body.style.overflow = ''
			window.removeEventListener('keydown', handleKey)
		}
	}, [closeLightbox, selectedIndex, showNext, showPrevious, scale])

	const toggleZoomButton = () => {
		if (scale > 1) {
			resetZoom()
		} else {
			setScale(2.5)
		}
	}

	let absoluteIndex = 0

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
	}

	return (
		<div className={cn('flex flex-col gap-12', className)}>
			{sections.map((section) => (
				<div key={section.title} className={cn('flex flex-col gap-6', sectionClassName)}>
					<h2 className={cn(
						'border-b border-border/50 pb-2 text-xl font-semibold tracking-tight text-foreground/80',
						sectionTitleClassName
					)}>
						{section.title}
					</h2>
					<div className={cn('columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3', gridClassName)}>
						{section.items.map((item) => {
							const currentIndex = absoluteIndex++
							const isThumbLoaded = loadedThumbnails[item.src] === true

							// Derive exact inline aspect ratio mapping to guarantee zero Cumulative Layout Shift (CLS)
							const aspectRatio = item.width / item.height

							return (
								<button
									type="button"
									key={item.src}
									onClick={() => {
										setDirection(1)
										setSelectedIndex(currentIndex)
									}}
									style={{ aspectRatio: `${aspectRatio}` }}
									className={cn(
										'group mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-blue-500/40 relative border-0 shadow-none hover:bg-slate-100/50 dark:hover:bg-slate-900/80',
										cardClassName
									)}
								>
									{/* Flat pulse skeleton loader */}
									{!isThumbLoaded && (
										<div className="absolute inset-0 bg-slate-100 dark:bg-slate-900/60 animate-pulse flex items-center justify-center z-10 pointer-events-none">
											<span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest font-mono">
												loading...
											</span>
										</div>
									)}

									<Image
										src={item.src}
										alt={imageAlt}
										width={item.width}
										height={item.height}
										priority={currentIndex === 0}
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
										onLoad={() => setLoadedThumbnails(prev => ({ ...prev, [item.src]: true }))}
										className={cn(
											'h-auto w-full object-contain transition-all duration-300 group-hover:scale-[1.01]',
											isThumbLoaded ? 'opacity-100' : 'opacity-0',
											imageClassName
										)}
									/>
								</button>
							)
						})}
					</div>
				</div>
			))}

			{mounted && createPortal(
				<AnimatePresence>
					{selectedIndex !== null && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2, ease: 'easeOut' }}
							className={cn(
								'fixed inset-0 z-[99999] flex items-center justify-center bg-black/95',
								lightboxBackdropClassName
							)}
							onClick={closeLightbox}
						>
							{/* Background invisible close trigger (active only when not zoomed) */}
							<button
								type="button"
								aria-label="Close lightbox backdrop"
								className="absolute inset-0 z-[100]"
								onClick={scale === 1 ? closeLightbox : undefined}
							/>

							{/* Toolbar Panel (Zoom status + controls) */}
							<div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[120] flex items-center gap-2">
								{/* Zoom level label */}
								{scale > 1 && (
									<span className="text-[10px] sm:text-xs text-white/60 font-semibold uppercase tracking-widest font-mono mr-2 bg-black/40 px-2.5 py-1.5 rounded border border-white/5 pointer-events-none">
										{scale.toFixed(1)}x Zoom
									</span>
								)}

								{/* Zoom in/out toggle button */}
								<button
									type="button"
									aria-label={scale > 1 ? "Zoom Out" : "Zoom In"}
									className="rounded-lg bg-black/40 text-white p-2.5 hover:bg-black/60 transition-colors border border-white/10"
									onClick={(e) => {
										e.stopPropagation()
										toggleZoomButton()
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

							{/* Previous button (rendered only when scale is 1 for stability) */}
							{scale === 1 && (
								<button
									type="button"
									aria-label="Previous artwork"
									className="absolute top-1/2 left-4 sm:left-6 -translate-y-1/2 z-[120] rounded-lg bg-black/40 text-white p-2.5 hover:bg-black/60 transition-colors border border-white/10"
									onClick={(event) => {
										event.stopPropagation()
										showPrevious()
									}}
								>
									<ChevronLeft size={24} />
								</button>
							)}

							{/* Next button (rendered only when scale is 1 for stability) */}
							{scale === 1 && (
								<button
									type="button"
									aria-label="Next artwork"
									className="absolute top-1/2 right-4 sm:right-6 -translate-y-1/2 z-[120] rounded-lg bg-black/40 text-white p-2.5 hover:bg-black/60 transition-colors border border-white/10"
									onClick={(event) => {
										event.stopPropagation()
										showNext()
									}}
								>
									<ChevronRight size={24} />
								</button>
							)}

							{/* Prefetch adjacent images in the background for instant sliding */}
							<div className="hidden" aria-hidden="true">
								<img src={allArtworks[(selectedIndex + 1) % allArtworks.length].src} />
								<img src={allArtworks[(selectedIndex - 1 + allArtworks.length) % allArtworks.length].src} />
							</div>

							<div
								className="absolute inset-0 z-[110] flex items-center justify-center pointer-events-none w-full h-full overflow-hidden"
							>
								<AnimatePresence mode="wait" initial={false} custom={direction}>
									<motion.div
										key={selectedIndex}
										custom={direction}
										variants={imageMotionVariants}
										initial="enter"
										animate="center"
										exit="exit"
										transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
										className="relative flex flex-col items-center justify-center w-full h-full"
									>
										{/* Flat Enlarged Lightbox Loader */}
										{isLightboxLoading && (
											<div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
												<span className="text-xs font-semibold text-white/55 uppercase tracking-widest font-mono animate-pulse">
													loading...
												</span>
											</div>
										)}

										{/* Zoom/Pan wrapper container */}
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
												src={allArtworks[selectedIndex].src}
												alt={enlargedImageAlt}
												width={allArtworks[selectedIndex].width}
												height={allArtworks[selectedIndex].height}
												sizes="100vw"
												onLoad={() => setIsLightboxLoading(false)}
												className={cn(
													"max-h-[86dvh] max-w-[90vw] h-auto w-auto object-contain pointer-events-none transition-opacity duration-300 ease-out shadow-none",
													isLightboxLoading ? "opacity-0" : "opacity-100"
												)}
												priority
												onClick={(event) => event.stopPropagation()}
											/>
										</div>

										{/* Counter */}
										{scale === 1 && (
											<div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs font-bold tracking-widest font-mono pointer-events-none uppercase">
												{selectedIndex + 1} / {allArtworks.length}
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
	)
}
