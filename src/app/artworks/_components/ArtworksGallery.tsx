'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils/utils'

interface Artwork {
	src: string
	isPortrait: boolean
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

	const allArtworks = sections.flatMap((section) => section.items.map((item) => item.src))

	useEffect(() => setMounted(true), [])

	const closeLightbox = () => setSelectedIndex(null)
	const showPrevious = () => {
		if (selectedIndex === null) {
			return
		}
		setDirection(-1)
		setSelectedIndex((selectedIndex - 1 + allArtworks.length) % allArtworks.length)
	}
	const showNext = () => {
		if (selectedIndex === null) {
			return
		}
		setDirection(1)
		setSelectedIndex((selectedIndex + 1) % allArtworks.length)
	}

	useEffect(() => {
		if (selectedIndex === null) {
			return
		}

		const handleKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				closeLightbox()
			}

			if (event.key === 'ArrowLeft') {
				showPrevious()
			}

			if (event.key === 'ArrowRight') {
				showNext()
			}
		}

		document.body.style.overflow = 'hidden'
		window.addEventListener('keydown', handleKey)

		return () => {
			document.body.style.overflow = ''
			window.removeEventListener('keydown', handleKey)
		}
	}, [selectedIndex])

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
							return (
								<button
									type="button"
									key={item.src}
									onClick={() => {
										setDirection(1)
										setSelectedIndex(currentIndex)
									}}
									className={cn(
										'group mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500/40',
										cardClassName
									)}
								>
									<Image
										src={item.src}
										alt={imageAlt}
										width={1600}
										height={2000}
										priority={currentIndex === 0}
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
										className={cn(
											'h-auto w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]',
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
								'fixed inset-0 z-[99999] flex items-center justify-center bg-black/85',
								lightboxBackdropClassName
							)}
							onClick={closeLightbox}
						>
							<button
								type="button"
								aria-label="Close lightbox backdrop"
								className="absolute inset-0 z-[100]"
								onClick={closeLightbox}
							/>

							<button
								type="button"
								aria-label="Close"
								className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[120] rounded-md bg-black/40 text-white p-2 hover:bg-black/60 transition-colors"
								onClick={closeLightbox}
							>
								<X size={20} />
							</button>

							<button
								type="button"
								aria-label="Previous artwork"
								className="absolute top-1/2 left-4 sm:left-6 -translate-y-1/2 z-[120] rounded-md bg-black/40 text-white p-2 hover:bg-black/60 transition-colors"
								onClick={(event) => {
									event.stopPropagation()
									showPrevious()
								}}
							>
								<ChevronLeft size={24} />
							</button>

							<button
								type="button"
								aria-label="Next artwork"
								className="absolute top-1/2 right-4 sm:right-6 -translate-y-1/2 z-[120] rounded-md bg-black/40 text-white p-2 hover:bg-black/60 transition-colors"
								onClick={(event) => {
									event.stopPropagation()
									showNext()
								}}
							>
								<ChevronRight size={24} />
							</button>

							<div
								className="absolute inset-0 z-[110] flex items-center justify-center pointer-events-none"
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
										className="relative flex items-center justify-center"
									>
										<Image
											src={allArtworks[selectedIndex]}
											alt={enlargedImageAlt}
											width={2400}
											height={2400}
											sizes="100vw"
											className="max-h-[88dvh] max-w-[92vw] h-auto w-auto object-contain pointer-events-auto shadow-2xl"
											priority
											onClick={(event) => event.stopPropagation()}
										/>
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
