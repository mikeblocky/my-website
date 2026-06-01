'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, RectangleHorizontal, RectangleVertical, Maximize2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/utils'
import type { Zine } from '../_data/zines'

type ZineLibraryProps = {
	zines: Zine[]
}

function clampPage(page: number, total: number) {
	return Math.max(0, Math.min(page, Math.max(total - 1, 0)))
}

function BookPage({
	zine,
	pageIndex,
	side
}: {
	zine: Zine
	pageIndex: number
	side: 'left' | 'right'
}) {
	const page = zine.pages[pageIndex]

	if (!page) {
		return (
			<div className="flex h-full items-center justify-center bg-white text-xs text-stone-300 dark:bg-zinc-950 dark:text-stone-700">
				Blank
			</div>
		)
	}

	return (
		<div className="relative h-full w-full overflow-hidden bg-white dark:bg-zinc-950">
			<Image
				src={page.src}
				alt={page.alt}
				fill
				sizes="(max-width: 768px) 86vw, 42vw"
				priority={pageIndex < 2}
				className="object-contain p-2 sm:p-3"
			/>
			<div
				className={cn(
					'pointer-events-none absolute inset-y-0 w-12',
					side === 'left'
						? 'right-0 bg-gradient-to-l from-black/10 to-transparent'
						: 'left-0 bg-gradient-to-r from-black/12 to-transparent'
				)}
			/>
		</div>
	)
}

/* Desktop page spread transition variants */
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

function FlipBook({ zine }: { zine: Zine }) {
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
	const pageStep = isDesktop ? 2 : 1
	const canGoNext = spreadStart + pageStep < total
	const currentSpread = isDesktop ? Math.floor(spreadStart / 2) + 1 : spreadStart + 1
	const spreadCount = isDesktop ? Math.max(1, Math.ceil(total / 2)) : Math.max(1, total)
	const isHorizontal = zine.orientation === 'horizontal'
	const currentPage = zine.pages[spreadStart]
	const nextPage = zine.pages[spreadStart + 1]
	const currentPageRatio = currentPage ? currentPage.width / currentPage.height : 0.72
	const nextPageRatio = nextPage ? nextPage.width / nextPage.height : currentPageRatio
	const bookAspectRatio = isDesktop ? currentPageRatio + nextPageRatio : currentPageRatio

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


	/* Shared book interior — used in both inline and fullscreen views */
	const renderBookInterior = (variant: 'inline' | 'fullscreen') => {
		const gridClasses = variant === 'inline'
			? 'grid w-full max-w-full max-h-[78vh] min-h-[220px] sm:min-h-[280px] overflow-hidden rounded-lg bg-white md:grid-cols-2 dark:bg-zinc-950 relative'
			: 'grid h-full w-full overflow-hidden rounded-lg bg-white dark:bg-zinc-950 md:grid-cols-2 relative'

		return (
			<div
				className={gridClasses}
				style={variant === 'inline' ? { aspectRatio: bookAspectRatio } : undefined}
			>
				{/* Desktop left page */}
				<button
					type="button"
					onClick={goPrevious}
					disabled={!canGoPrevious}
					className="group relative hidden text-left outline-none disabled:cursor-default md:block h-full"
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
							<BookPage zine={zine} pageIndex={spreadStart} side="left" />
						</motion.div>
					</AnimatePresence>
					<span className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/0 to-transparent transition group-hover:from-black/5" />
				</button>

				{/* Mobile single page */}
				<button
					type="button"
					onClick={goNext}
					disabled={!canGoNext}
					className="group relative text-left outline-none disabled:cursor-default md:hidden h-full"
					aria-label="Turn to next spread"
				>
					<motion.div
						key={spreadStart}
						initial={{ opacity: 0.8, x: direction === 1 ? 40 : -40 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.35, ease: 'easeOut' }}
						className="h-full w-full"
					>
						<BookPage zine={zine} pageIndex={spreadStart} side="right" />
					</motion.div>
					<span className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/0 to-transparent transition group-hover:from-black/5" />
				</button>

				{/* Desktop right page */}
				<button
					type="button"
					onClick={goNext}
					disabled={!canGoNext}
					className="group relative hidden text-left outline-none disabled:cursor-default md:block h-full"
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
							<BookPage zine={zine} pageIndex={spreadStart + 1} side="right" />
						</motion.div>
					</AnimatePresence>
					<span className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/0 to-transparent transition group-hover:from-black/5" />
				</button>

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
				<div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[radial-gradient(circle_at_30%_0%,rgba(226,85,102,0.14),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.12),transparent_34%)] blur-xl" />
				<div className="relative rounded-xl border border-stone-200/80 bg-stone-200/70 p-2 shadow-[0_22px_70px_-42px_rgba(41,37,36,0.7)] dark:border-white/10 dark:bg-slate-950/60">
					<div className="absolute inset-y-4 left-1/2 z-20 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-stone-400/15 to-transparent md:block" />


					{renderBookInterior('inline')}
				</div>
			</div>

			<div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
				<p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
					{isDesktop ? 'Spread' : 'Page'} {currentSpread} of {spreadCount}
				</p>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setIsFullScreen(true)}
						className="inline-flex h-10 px-4 items-center justify-center gap-2 rounded-full border border-border bg-background font-mono text-[11px] tracking-wide text-muted-foreground transition hover:border-pink-300 hover:text-pink-500 cursor-pointer"
						aria-label="View full page"
					>
						<Maximize2 className="size-3.5" />
						<span>Full-page</span>
					</button>
					<button
						type="button"
						onClick={goPrevious}
						disabled={!canGoPrevious}
						className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:border-pink-300 hover:text-pink-500 disabled:opacity-35 disabled:hover:border-border disabled:hover:text-muted-foreground cursor-pointer"
						aria-label="Previous pages"
					>
						<ChevronLeft className="size-4" />
					</button>
					<button
						type="button"
						onClick={goNext}
						disabled={!canGoNext}
						className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:border-sky-300 hover:text-sky-500 disabled:opacity-35 disabled:hover:border-border disabled:hover:text-muted-foreground cursor-pointer"
						aria-label="Next pages"
					>
						<ChevronRight className="size-4" />
					</button>
				</div>
			</div>

			{mounted && isFullScreen && typeof document !== 'undefined'
				? createPortal(
						<div
							className="fixed inset-0 z-[9999] flex items-center justify-center bg-stone-100/40 dark:bg-black/40 backdrop-blur-3xl p-2 md:p-3 text-foreground cursor-zoom-out"
							onClick={() => setIsFullScreen(false)}
						>
							{/* Floating controls */}
							<div
								className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-stone-200/50 dark:border-white/10 shadow-2xl text-foreground cursor-default"
								onClick={(e) => e.stopPropagation()}
							>
								<button
									type="button"
									onClick={goPrevious}
									disabled={!canGoPrevious}
									className="inline-flex h-8 w-8 items-center justify-center rounded-full text-stone-500 hover:text-pink-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-pink-400 dark:hover:bg-zinc-800 transition disabled:opacity-35 cursor-pointer"
									aria-label="Previous pages"
								>
									<ChevronLeft className="size-4" />
								</button>
								<span className="font-mono text-xs tracking-wider font-semibold text-stone-600 dark:text-stone-300 border-r border-stone-200 dark:border-white/10 pr-4">
									{isDesktop ? 'Spread' : 'Page'} {currentSpread} of {spreadCount}
								</span>
								<button
									type="button"
									onClick={goNext}
									disabled={!canGoNext}
									className="inline-flex h-8 w-8 items-center justify-center rounded-full text-stone-500 hover:text-sky-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-sky-400 dark:hover:bg-zinc-800 transition disabled:opacity-35 cursor-pointer pr-1"
									aria-label="Next pages"
								>
									<ChevronRight className="size-4" />
								</button>
								<button
									type="button"
									onClick={() => setIsFullScreen(false)}
									className="inline-flex h-8 px-3 items-center justify-center gap-1.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 font-mono text-[10px] tracking-wide hover:bg-pink-100 hover:text-pink-600 dark:hover:bg-pink-900/20 dark:hover:text-pink-400 transition cursor-pointer"
									aria-label="Minimize full page"
								>
									<X className="size-3" />
									<span>Minimize</span>
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
									className="absolute left-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-black/10 text-white/30 opacity-0 hover:opacity-100 hover:bg-black/45 hover:text-white transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
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
										<div className="relative h-full w-full rounded-2xl border border-stone-200/40 dark:border-white/5 bg-stone-900/5 p-2 shadow-[0_30px_90px_-25px_rgba(0,0,0,0.4)] dark:shadow-[0_30px_90px_-25px_rgba(0,0,0,0.8)]">
											<div className="absolute inset-y-4 left-1/2 z-20 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-stone-400/15 to-transparent md:block" />


											{renderBookInterior('fullscreen')}
										</div>
									</div>
								</div>

								<button
									type="button"
									onClick={goNext}
									disabled={!canGoNext}
									className="absolute right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-black/10 text-white/30 opacity-0 hover:opacity-100 hover:bg-black/45 hover:text-white transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
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

export function ZineLibrary({ zines }: ZineLibraryProps) {
	const [selectedSlug, setSelectedSlug] = useState(zines[0]?.slug ?? '')
	const selectedZine = useMemo(
		() => zines.find((zine) => zine.slug === selectedSlug) ?? zines[0],
		[selectedSlug, zines]
	)
	const groupedZines = useMemo(() => {
		return zines.reduce<Record<string, Zine[]>>((groups, zine) => {
			groups[zine.parentTitle] = groups[zine.parentTitle] ?? []
			groups[zine.parentTitle].push(zine)
			return groups
		}, {})
	}, [zines])

	if (!selectedZine) {
		return (
			<div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
				No zines are available yet.
			</div>
		)
	}

	return (
		<div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
			<aside className="space-y-3">
				<p className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground">
					Book shelf
				</p>
				<div className="grid gap-2">
					{Object.entries(groupedZines).map(([title, books]) => (
						<div key={title} className="space-y-2">
							<p className="px-1 font-mono text-[10px] tracking-[0.1em] text-muted-foreground/70">
								{title}
							</p>
							{books.map((zine) => {
								const OrientationIcon = zine.orientation === 'horizontal' ? RectangleHorizontal : RectangleVertical

								return (
									<button
										key={zine.slug}
										type="button"
										onClick={() => setSelectedSlug(zine.slug)}
										className={cn(
											'pride-soft-card w-full overflow-hidden rounded-lg border p-4 text-left transition',
											selectedZine.slug === zine.slug
												? 'border-pink-300/70 bg-white/85 shadow-sm dark:border-pink-300/25 dark:bg-white/8'
												: 'border-border bg-card/70 hover:border-pink-300/50'
										)}
									>
										<div className="flex items-start gap-3">
											<span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-md bg-pink-100 text-pink-600 dark:bg-pink-300/10 dark:text-pink-200">
												<OrientationIcon className="size-4" />
											</span>
											<span className="min-w-0">
												<span className="block text-sm font-semibold text-foreground">
													{zine.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
												</span>
												<span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
													{zine.pages.length} pages · {zine.year}
												</span>
											</span>
										</div>
									</button>
								)
							})}
						</div>
					))}
				</div>
			</aside>

			<section className="space-y-5">
				<div className="flex flex-col gap-4 pb-4 md:flex-row md:items-start md:justify-between">
					<div className="space-y-1">
						<p className="font-mono text-[11px] tracking-[0.15em] text-pink-500 font-semibold dark:text-pink-400">
							{selectedZine.year} · {selectedZine.orientation.charAt(0).toUpperCase() + selectedZine.orientation.slice(1)}
						</p>
						<h2 className="text-2xl font-bold tracking-tight text-foreground">
							{selectedZine.title}
						</h2>
						<p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
							{selectedZine.subtitle}
						</p>
					</div>
					<div className="md:max-w-xs md:text-right">
						<p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
							{selectedZine.description}
						</p>
					</div>
				</div>

				<FlipBook zine={selectedZine} />
			</section>
		</div>
	)
}
