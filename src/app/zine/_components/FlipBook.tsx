'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/utils'
import { monoFont } from '@/styles/fonts/fonts'
import type { Zine } from '../_data/zines'
import { BookPage } from './BookPage'

interface FlipBookProps {
	zine: Zine
}

function clampPage(page: number, total: number) {
	return Math.max(0, Math.min(page, Math.max(total - 1, 0)))
}

const spreadVariants = {
	enter: (dir: number) => ({
		opacity: 0,
		scale: 0.985,
		x: dir > 0 ? 20 : -20,
	}),
	center: {
		opacity: 1,
		scale: 1,
		x: 0,
	},
	exit: (dir: number) => ({
		opacity: 0,
		scale: 0.985,
		x: dir > 0 ? -20 : 20,
	}),
}

export function FlipBook({ zine }: FlipBookProps) {
	const [spreadStart, setSpreadStart] = useState(0)
	const [direction, setDirection] = useState<1 | -1>(1)
	const [isDesktop, setIsDesktop] = useState(false)
	const [isFullScreen, setIsFullScreen] = useState(false)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	const total = zine.pages.length
	const canGoPrevious = spreadStart > 0
	const showSpread = isDesktop && zine.orientation === 'vertical'
	const pageStep = showSpread ? 2 : 1
	const canGoNext = spreadStart + pageStep < total
	const currentSpread = showSpread ? Math.floor(spreadStart / 2) + 1 : spreadStart + 1
	const spreadCount = showSpread ? Math.max(1, Math.ceil(total / 2)) : Math.max(1, total)
	const isHorizontal = zine.orientation === 'horizontal'
	const currentPage = zine.pages[spreadStart]
	const nextPage = zine.pages[spreadStart + 1]
	const currentPageRatio = currentPage ? currentPage.width / currentPage.height : 0.72
	const nextPageRatio = nextPage ? nextPage.width / nextPage.height : currentPageRatio
	const bookAspectRatio = showSpread ? currentPageRatio + nextPageRatio : currentPageRatio

	useEffect(() => {
		setSpreadStart(0)
		setDirection(1)
	}, [zine.slug])

	useEffect(() => {
		const query = window.matchMedia('(min-width: 768px)')
		const update = () => setIsDesktop(query.matches)
		update()
		query.addEventListener('change', update)
		return () => query.removeEventListener('change', update)
	}, [])

	const goPrevious = useCallback(() => {
		if (!canGoPrevious) return
		setDirection(-1)
		setSpreadStart((page) => clampPage(page - pageStep, total))
	}, [canGoPrevious, pageStep, total])

	const goNext = useCallback(() => {
		if (!canGoNext) return
		setDirection(1)
		setSpreadStart((page) => clampPage(page + pageStep, total))
	}, [canGoNext, pageStep, total])

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'ArrowLeft') goPrevious()
			if (event.key === 'ArrowRight') goNext()
			if (event.key === 'Escape') setIsFullScreen(false)
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [goNext, goPrevious])

	useEffect(() => {
		if (isFullScreen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}
		return () => {
			document.body.style.overflow = ''
		}
	}, [isFullScreen])

	const renderBookInterior = (variant: 'inline' | 'fullscreen') => {
		const gridClasses = variant === 'inline'
			? cn(
				"grid w-full max-w-full max-h-[78vh] min-h-[220px] sm:min-h-[280px] overflow-hidden rounded-md bg-white dark:bg-zinc-950 relative",
				showSpread ? "md:grid-cols-2" : "grid-cols-1"
			  )
			: cn(
				"grid h-full w-full overflow-hidden rounded-md bg-white dark:bg-zinc-950 relative",
				showSpread ? "md:grid-cols-2" : "grid-cols-1"
			  )

		return (
			<div
				className={gridClasses}
				style={variant === 'inline' ? { aspectRatio: bookAspectRatio } : undefined}
			>
				{showSpread ? (
					<>
						{/* Desktop left page */}
						<button
							type="button"
							onClick={goPrevious}
							disabled={!canGoPrevious}
							className="group relative text-left outline-none disabled:cursor-default h-full"
							aria-label="Turn to previous spread"
						>
							<AnimatePresence mode="popLayout" custom={direction}>
								<motion.div
									key={spreadStart}
									custom={direction}
									variants={spreadVariants}
									initial="enter"
									animate="center"
									exit="exit"
									transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
									className="h-full w-full"
								>
									<BookPage zine={zine} pageIndex={spreadStart} side="left" showFold={true} />
								</motion.div>
							</AnimatePresence>
							<span className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/0 to-transparent transition group-hover:from-black/5" />
						</button>

						{/* Desktop right page */}
						<button
							type="button"
							onClick={goNext}
							disabled={!canGoNext}
							className="group relative text-left outline-none disabled:cursor-default h-full"
							aria-label="Turn to next spread"
						>
							<AnimatePresence mode="popLayout" custom={direction}>
								<motion.div
									key={spreadStart}
									custom={direction}
									variants={spreadVariants}
									initial="enter"
									animate="center"
									exit="exit"
									transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
									className="h-full w-full"
								>
									<BookPage zine={zine} pageIndex={spreadStart + 1} side="right" showFold={true} />
								</motion.div>
							</AnimatePresence>
							<span className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/0 to-transparent transition group-hover:from-black/5" />
						</button>
					</>
				) : (
					/* Single page (Mobile or Horizontal zine on Desktop) */
					<button
						type="button"
						onClick={goNext}
						disabled={!canGoNext}
						className="group relative text-left outline-none disabled:cursor-default h-full"
						aria-label="Turn to next page"
					>
						<AnimatePresence mode="popLayout" custom={direction}>
							<motion.div
								key={spreadStart}
								custom={direction}
								variants={spreadVariants}
								initial="enter"
								animate="center"
								exit="exit"
								transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
								className="h-full w-full"
							>
								<BookPage zine={zine} pageIndex={spreadStart} side="right" showFold={false} />
							</motion.div>
						</AnimatePresence>
						<span className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/0 to-transparent transition group-hover:from-black/5" />
					</button>
				)}
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<div
				className="relative mx-auto w-full"
				style={{
					maxWidth: `min(${isHorizontal ? 1500 : 1180}px, 96vw, calc(78vh * ${bookAspectRatio}))`
				}}
			>
				<div className="relative rounded-md border border-stone-200 bg-stone-100 p-2 dark:border-slate-800 dark:bg-slate-950/60 shadow-none">
					{showSpread && (
						<div className="absolute inset-y-4 left-1/2 z-20 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-stone-400/15 to-transparent md:block" />
					)}

					{renderBookInterior('inline')}
				</div>
			</div>

			<div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
				<p className={cn(monoFont.className, "text-[10px] tracking-wider lowercase text-muted-foreground")}>
					{showSpread ? 'spread' : 'page'} {currentSpread} of {spreadCount}
				</p>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setIsFullScreen(true)}
						className={cn(
							monoFont.className,
							"inline-flex h-9 px-4.5 items-center justify-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-background text-[10px] tracking-wider lowercase text-muted-foreground transition hover:border-[hsl(var(--pride-glow-val))]/40 hover:text-[hsl(var(--pride-glow-val))] cursor-pointer shadow-none"
						)}
						aria-label="View full page"
					>
						<Maximize2 className="size-3" />
						<span>full-page</span>
					</button>
					<button
						type="button"
						onClick={goPrevious}
						disabled={!canGoPrevious}
						className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-background text-muted-foreground transition hover:border-[hsl(var(--pride-glow-val))]/40 hover:text-[hsl(var(--pride-glow-val))] disabled:opacity-35 disabled:hover:border-slate-200 disabled:hover:text-muted-foreground dark:disabled:hover:border-slate-800 cursor-pointer shadow-none"
						aria-label="Previous pages"
					>
						<ChevronLeft className="size-4" />
					</button>
					<button
						type="button"
						onClick={goNext}
						disabled={!canGoNext}
						className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 bg-background text-muted-foreground transition hover:border-[hsl(var(--pride-glow-val))]/40 hover:text-[hsl(var(--pride-glow-val))] disabled:opacity-35 disabled:hover:border-slate-200 disabled:hover:text-muted-foreground dark:disabled:hover:border-slate-800 cursor-pointer shadow-none"
						aria-label="Next pages"
					>
						<ChevronRight className="size-4" />
					</button>
				</div>
			</div>

			{mounted && isFullScreen && typeof document !== 'undefined'
				? createPortal(
						<div
							className="fixed inset-0 z-50 flex items-center justify-center bg-stone-100/40 dark:bg-black/40 backdrop-blur-3xl p-2 md:p-3 text-foreground cursor-zoom-out"
							onClick={() => setIsFullScreen(false)}
						>
							{/* Floating controls */}
							<div
								className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white/95 dark:bg-zinc-950/95 px-4 py-2 rounded-md border border-stone-200 dark:border-slate-800 shadow-none text-foreground cursor-default"
								onClick={(e) => e.stopPropagation()}
							>
								<button
									type="button"
									onClick={goPrevious}
									disabled={!canGoPrevious}
									className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-500 hover:text-[hsl(var(--pride-glow-val))] hover:bg-[hsl(var(--pride-glow-val))]/5 transition disabled:opacity-35 cursor-pointer"
									aria-label="Previous pages"
								>
									<ChevronLeft className="size-4" />
								</button>
								<span className={cn(
									monoFont.className,
									"text-[10px] tracking-wider lowercase text-stone-600 dark:text-stone-300 border-r border-stone-200 dark:border-white/10 pr-4"
								)}>
									{showSpread ? 'spread' : 'page'} {currentSpread} of {spreadCount}
								</span>
								<button
									type="button"
									onClick={goNext}
									disabled={!canGoNext}
									className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-500 hover:text-[hsl(var(--pride-glow-val))] hover:bg-[hsl(var(--pride-glow-val))]/5 transition disabled:opacity-35 cursor-pointer"
									aria-label="Next pages"
								>
									<ChevronRight className="size-4" />
								</button>
								<button
									type="button"
									onClick={() => setIsFullScreen(false)}
									className={cn(
										monoFont.className,
										"inline-flex h-7 px-3 items-center justify-center gap-1.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-stone-650 dark:text-stone-300 text-[10px] tracking-wider lowercase hover:bg-[hsl(var(--pride-glow-val))]/10 hover:text-[hsl(var(--pride-glow-val))] transition cursor-pointer"
									)}
									aria-label="Minimize full page"
								>
									<X className="size-3" />
									<span>minimize</span>
								</button>
							</div>

							{/* Modal Main Area */}
							<div
								className="w-full h-full max-h-[74vh] flex items-center justify-center relative cursor-default"
								onClick={(e) => e.stopPropagation()}
							>
								<button
									type="button"
									onClick={goPrevious}
									disabled={!canGoPrevious}
									className="absolute left-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-md bg-black/10 text-white/30 opacity-0 hover:opacity-100 hover:bg-black/45 hover:text-white transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
									aria-label="Previous spread"
								>
									<ChevronLeft className="size-8" />
								</button>

								<div className="w-full h-full flex items-center justify-center p-2">
									<div
										className="w-full h-full"
										style={{
											aspectRatio: bookAspectRatio,
											maxWidth: `min(100%, calc(74vh * ${bookAspectRatio}))`
										}}
									>
										<div className="relative h-full w-full rounded-md border border-stone-200/40 dark:border-white/5 bg-stone-900/5 p-2 shadow-none">
											{showSpread && (
												<div className="absolute inset-y-4 left-1/2 z-20 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-stone-400/15 to-transparent md:block" />
											)}

											{renderBookInterior('fullscreen')}
										</div>
									</div>
								</div>

								<button
									type="button"
									onClick={goNext}
									disabled={!canGoNext}
									className="absolute right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-md bg-black/10 text-white/30 opacity-0 hover:opacity-100 hover:bg-black/45 hover:text-white transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
									aria-label="Next spread"
								>
									<ChevronRight className="size-8" />
								</button>
							</div>
						</div>,
						document.body
				  )
				: null}
		</div>
	)
}
