'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { DynamicBreadcrumb } from '@/components/ui/primitives/breadcrumb'
import { ThemeToggle } from '@/components/ui/theme/theme-toggle'
import type { ArtworkItem } from '../../_data/artworks'
import { createPortal } from 'react-dom'

/* ─────── types ─────── */
interface Props { items: ArtworkItem[] }

/* ─────── seeded PRNG ─────── */
function seededRandom(seed: number) {
	let s = seed
	return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

/* ─────── page CSS ─────── */
const pageStyles = `
@keyframes twinkle {
	0%, 100% { opacity: var(--star-min); }
	50%      { opacity: var(--star-max); }
}
@keyframes sand-grain {
	0%   { opacity: .03; }
	50%  { opacity: .07; }
	100% { opacity: .03; }
}
`

/* ═══════════════════════════════════
   STARRY NIGHT SKY — canvas sparkles
   ═══════════════════════════════════ */
function StarrySky() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const animRef = useRef<number>(0)

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		let dpr = 1
		const resize = () => {
			dpr = Math.min(window.devicePixelRatio || 1, 2)
			const r = canvas.getBoundingClientRect()
			canvas.width = r.width * dpr
			canvas.height = r.height * dpr
		}
		resize()
		window.addEventListener('resize', resize)

		/* generate stars once */
		const rand = seededRandom(77)
		const stars = Array.from({ length: 180 }, () => ({
			x: rand(),
			y: rand(),
			r: 0.4 + rand() * 1.6,
			speed: 0.3 + rand() * 1.2,      // twinkle speed
			phase: rand() * Math.PI * 2,
			minA: 0.15 + rand() * 0.2,
			maxA: 0.55 + rand() * 0.45
		}))

		let t = 0
		const draw = () => {
			const r = canvas.getBoundingClientRect()
			const w = r.width, h = r.height
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
			ctx.clearRect(0, 0, w, h)
			t += 0.016

			for (const s of stars) {
				const alpha = s.minA + (s.maxA - s.minA) * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase))
				ctx.beginPath()
				ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2)
				ctx.fillStyle = `rgba(255,255,255,${alpha})`
				ctx.fill()
			}
			animRef.current = requestAnimationFrame(draw)
		}
		animRef.current = requestAnimationFrame(draw)
		return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize) }
	}, [])

	return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
}

/* ══════════════════════════════════════════════
   ORGANIC WAVES — canvas, layered sines + surge
   Waves wash far onto the sand and pull back
   ══════════════════════════════════════════════ */
function OrganicWaves({
	className = '',
	layers = 5,
	baseColor = [26, 58, 74],
	foamColor = [255, 255, 255],
	sandColor = [196, 181, 154]
}: {
	className?: string
	layers?: number
	baseColor?: number[]
	foamColor?: number[]
	sandColor?: number[]
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const animRef = useRef<number>(0)

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		let dpr = 1
		const resize = () => {
			dpr = Math.min(window.devicePixelRatio || 1, 2)
			const r = canvas.getBoundingClientRect()
			canvas.width = r.width * dpr
			canvas.height = r.height * dpr
		}
		resize()
		window.addEventListener('resize', resize)

		const cfgs = Array.from({ length: layers }, (_, i) => ({
			amp1: 4 + i * 2, amp2: 2 + i * 1, amp3: 1 + i * 0.5,
			freq1: 0.003 + i * 0.0002, freq2: 0.007 - i * 0.0004, freq3: 0.013 + i * 0.0008,
			speed1: 0.45 + i * 0.1, speed2: -0.3 - i * 0.07, speed3: 0.18 + i * 0.05,
			phase: i * 1.4,
			/* surge — pushes wave forward (down=onto sand) and back */
			surgeAmp: 30 + i * 22,
			surgeSpeed: 0.08 + i * 0.018,
			surgePhase: i * 0.7,
			surge2Amp: 14 + i * 8,
			surge2Speed: 0.05 - i * 0.006,
			surge2Phase: i * 2.3,
			/* base y position (from top of canvas) */
			yBase: 20 + i * 28,
			/* visuals */
			opacity: 0.10 + i * 0.09,
			foamOpacity: 0.06 + i * 0.06,
			foamWidth: 1 + (layers - i) * 0.4
		}))

		let t = 0
		const draw = () => {
			const r = canvas.getBoundingClientRect()
			const w = r.width, h = r.height
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
			ctx.clearRect(0, 0, w, h)
			t += 0.016

			for (let li = 0; li < cfgs.length; li++) {
				const c = cfgs[li]
				const surge = Math.sin(t * c.surgeSpeed + c.surgePhase) * c.surgeAmp
					+ Math.sin(t * c.surge2Speed + c.surge2Phase) * c.surge2Amp

				const ys: number[] = []
				for (let x = 0; x <= w; x += 2) {
					ys.push(c.yBase + surge
						+ Math.sin(x * c.freq1 + t * c.speed1 + c.phase) * c.amp1
						+ Math.sin(x * c.freq2 + t * c.speed2 + c.phase * 0.7) * c.amp2
						+ Math.sin(x * c.freq3 + t * c.speed3 + c.phase * 1.3) * c.amp3)
				}

				/* wet sand trail when retreating */
				if (surge < 0) {
					const a = Math.min(0.14, Math.abs(surge) * 0.003)
					ctx.beginPath(); ctx.moveTo(0, h)
					for (let xi = 0; xi < ys.length; xi++) ctx.lineTo(xi * 2, ys[xi] + 8)
					ctx.lineTo(w, h); ctx.closePath()
					ctx.fillStyle = `rgba(${sandColor[0] - 30},${sandColor[1] - 30},${sandColor[2] - 30},${a})`
					ctx.fill()
				}

				/* wave body */
				ctx.beginPath(); ctx.moveTo(0, h)
				for (let xi = 0; xi < ys.length; xi++) ctx.lineTo(xi * 2, ys[xi])
				ctx.lineTo(w, h); ctx.closePath()
				ctx.fillStyle = `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},${c.opacity})`
				ctx.fill()

				/* foam crest */
				ctx.beginPath()
				for (let xi = 0; xi < ys.length; xi++) {
					if (xi === 0) ctx.moveTo(0, ys[0]); else ctx.lineTo(xi * 2, ys[xi])
				}
				ctx.strokeStyle = `rgba(${foamColor[0]},${foamColor[1]},${foamColor[2]},${c.foamOpacity})`
				ctx.lineWidth = c.foamWidth; ctx.stroke()

				/* foam specks */
				for (let x = 0; x <= w; x += 10 + Math.sin(t * 0.6 + x * 0.08) * 8) {
					const xi = Math.min(Math.floor(x / 2), ys.length - 1)
					const sz = 0.8 + Math.abs(Math.sin(x * 0.04 + t * 0.4 + li)) * 2.2
					const a = 0.06 + Math.abs(Math.sin(x * 0.02 + t * 0.5)) * 0.3
					ctx.beginPath(); ctx.arc(x, ys[xi] - 1, sz, 0, Math.PI * 2)
					ctx.fillStyle = `rgba(${foamColor[0]},${foamColor[1]},${foamColor[2]},${a})`
					ctx.fill()
				}
			}
			animRef.current = requestAnimationFrame(draw)
		}
		animRef.current = requestAnimationFrame(draw)
		return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize) }
	}, [layers, baseColor, foamColor, sandColor])

	return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-x-0 block w-full ${className}`} />
}

/* ═══════════════════════════
   SCATTERED SHORE CARD
   ═══════════════════════════ */
function ShoreCard({ item, index, rotation, onOpen }: {
	item: ArtworkItem; index: number; rotation: number; onOpen: () => void
}) {
	const ref = useRef<HTMLButtonElement>(null)
	const isInView = useInView(ref, { once: true, margin: '-40px' })

	return (
		<motion.div
			initial={{ opacity: 0, y: 60, rotate: rotation + (rotation > 0 ? 6 : -6) }}
			animate={isInView ? { opacity: 1, y: 0, rotate: rotation } : {}}
			transition={{ duration: 1.2, delay: (index % 10) * 0.08, ease: [0.16, 1, 0.3, 1] }}
			className="inline-block"
		>
			<button ref={ref} type="button" onClick={onOpen}
				className="group relative block overflow-hidden rounded-xl border border-stone-300/30 bg-white/45 p-1.5 shadow-[0_6px_30px_-10px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_14px_50px_-14px_rgba(0,0,0,0.25)] focus:outline-none focus:ring-2 focus:ring-sky-400/30 sm:p-2 dark:border-white/6 dark:bg-slate-900/35 dark:shadow-[0_6px_30px_-10px_rgba(0,0,0,0.5)]"
				style={{ transform: `rotate(${rotation}deg)` }}>
				<Image src={item.src} alt="Kemutai Hanashi artwork" width={1600} height={2000}
					priority={index < 3} sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
					className="h-auto w-full rounded-lg object-contain transition duration-700 group-hover:scale-[1.02]" />
			</button>
		</motion.div>
	)
}

/* ═══════════════════════════
   LIGHTBOX
   ═══════════════════════════ */
function Lightbox({ allSrcs, initialIndex, onClose }: {
	allSrcs: string[]; initialIndex: number; onClose: () => void
}) {
	const [current, setCurrent] = useState(initialIndex)
	const [dir, setDir] = useState<1 | -1>(1)
	const total = allSrcs.length
	const prev = useCallback(() => { setDir(-1); setCurrent((c) => (c - 1 + total) % total) }, [total])
	const next = useCallback(() => { setDir(1); setCurrent((c) => (c + 1) % total) }, [total])

	useEffect(() => {
		const h = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
			if (e.key === 'ArrowLeft') prev()
			if (e.key === 'ArrowRight') next()
		}
		document.body.style.overflow = 'hidden'
		window.addEventListener('keydown', h)
		return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', h) }
	}, [onClose, prev, next])

	const v = {
		enter: (d: number) => ({ opacity: 0, x: d * 40, scale: 0.96, filter: 'blur(8px)' }),
		center: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' },
		exit: (d: number) => ({ opacity: 0, x: d * -40, scale: 0.96, filter: 'blur(8px)' })
	}

	return createPortal(
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
			transition={{ duration: 0.25 }}
			className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/92" onClick={onClose}>
			<button type="button" aria-label="Close" onClick={onClose}
				className="absolute right-4 top-4 z-[120] rounded-full bg-white/10 p-2.5 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white sm:right-6 sm:top-6">
				<X size={18} /></button>
			<button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); prev() }}
				className="absolute left-4 top-1/2 z-[120] -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white sm:left-6">
				<ChevronLeft size={22} /></button>
			<button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); next() }}
				className="absolute right-4 top-1/2 z-[120] -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white sm:right-6">
				<ChevronRight size={22} /></button>
			<span className="absolute bottom-5 left-1/2 z-[120] -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.35em] text-white/40">
				{current + 1} / {total}</span>
			<div className="pointer-events-none absolute inset-0 z-[110] flex items-center justify-center">
				<AnimatePresence mode="wait" initial={false} custom={dir}>
					<motion.div key={current} custom={dir} variants={v}
						initial="enter" animate="center" exit="exit"
						transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
						className="relative flex items-center justify-center">
						<Image src={allSrcs[current]} alt="Kemutai Hanashi artwork enlarged"
							width={2400} height={2400} sizes="100vw" priority
							className="pointer-events-auto max-h-[88dvh] max-w-[92vw] h-auto w-auto object-contain shadow-2xl"
							onClick={(e) => e.stopPropagation()} />
					</motion.div>
				</AnimatePresence>
			</div>
		</motion.div>,
		document.body
	)
}

/* ══════════════════════════════════════════════
   MAIN — THE NIGHT SEASHORE
   ══════════════════════════════════════════════ */
export function KemutaiHanashiClient({ items }: Props) {
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
	const allSrcs = items.map((i) => i.src)

	const oceanRef = useRef<HTMLDivElement>(null)
	const { scrollYProgress } = useScroll({ target: oceanRef, offset: ['start start', 'end start'] })
	const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
	const textY = useTransform(scrollYProgress, [0, 0.6], [0, -50])

	/* ── truly random scatter: no grid logic, pure chaos ── */
	const scatterData = useMemo(() => {
		const rand = seededRandom(Date.now() % 100000) // different every load
		return items.map(() => {
			const left = 2 + rand() * 72            // 2-74% from left
			const rotation = (rand() - 0.5) * 20    // -10 to +10 degrees
			const width = 150 + rand() * 130         // 150-280px
			const zIndex = Math.floor(rand() * 20)
			return { left, rotation, width, zIndex }
		})
	}, [items])

	return (
		<div className="relative min-h-screen">
			<style dangerouslySetInnerHTML={{ __html: pageStyles }} />

			{/* ═════════════ NIGHT SKY + OCEAN ═════════════ */}
			<div ref={oceanRef} className="relative flex min-h-[92vh] flex-col overflow-visible bg-gradient-to-b from-[#0a0e1a] via-[#0f1f2e] to-[#1a3a4a] dark:from-[#050810] dark:via-[#0a1520] dark:to-[#0c1e2b]">
				{/* ── Stars ── */}
				<StarrySky />

				{/* Atmospheric depth — darker at very top */}
				<div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-black/30" />

				{/* Water surface shimmer  */}
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-40"
					style={{
						backgroundImage: 'radial-gradient(ellipse 120px 2px at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 100%)',
						backgroundSize: '200px 50px'
					}} />

				{/* Nav */}
				<div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8">
					<div className="flex items-center justify-between">
						<DynamicBreadcrumb items={[
							{ href: '/', label: 'Home', emoji: '👾' },
							{ href: '/artworks', label: 'Artworks' },
							{ label: 'Kemutai Hanashi' }
						]} />
						<ThemeToggle />
					</div>
				</div>

				{/* Title — floating on night water */}
				<motion.div style={{ opacity: textOpacity, y: textY }}
					className="relative z-10 mx-auto flex flex-1 flex-col items-center justify-center px-5 text-center">
					<motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.3 }}
						className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/25">
						Kemutai Hanashi
					</motion.p>
					<motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
						className="mt-4 max-w-xl text-3xl font-light tracking-tight text-white/80 sm:text-4xl lg:text-5xl">
						Where smoke meets the shore.
					</motion.h1>
					<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
						transition={{ duration: 0.8, delay: 0.9 }}
						className="mt-5 max-w-md text-sm leading-relaxed text-white/30">
						Scroll — the waves will bring them to you.
					</motion.p>
					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 1.2 }} className="mt-8">
						<Link href="/artworks"
							className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-white/35 backdrop-blur transition hover:bg-white/12 hover:text-white/55">
							<ArrowLeft className="size-3.5" /> All artworks
						</Link>
					</motion.div>
				</motion.div>

				{/* ── WAVES — positioned to spill far onto the sand ── */}
				<OrganicWaves
					className="-bottom-[180px] z-20 h-[360px]"
					layers={6}
					baseColor={[26, 58, 74]}
					foamColor={[255, 255, 255]}
					sandColor={[196, 181, 154]}
				/>
				<OrganicWaves
					className="-bottom-[180px] z-20 h-[360px] hidden dark:block"
					layers={6}
					baseColor={[12, 30, 43]}
					foamColor={[148, 163, 184]}
					sandColor={[42, 37, 32]}
				/>
			</div>

			{/* ═════════════ THE SHORE — scattered artworks ═════════════ */}
			<div className="relative bg-[#c4b59a] dark:bg-[#2a2520]">
				{/* wet sand darkening where water reaches */}
				<div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-black/8 dark:bg-black/12" />
				{/* sand grain texture */}
				<div className="pointer-events-none absolute inset-0"
					style={{
						backgroundImage: 'radial-gradient(circle, rgba(120,100,70,0.07) 1px, transparent 1px)',
						backgroundSize: '12px 12px',
						animation: 'sand-grain 8s ease-in-out infinite'
					}} />

				{/* Count label */}
				<div className="relative pt-48 text-center">
					<motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
						viewport={{ once: true }} transition={{ duration: 1 }}
						className="font-mono text-[10px] uppercase tracking-[0.5em] text-stone-700/40 dark:text-stone-400/30">
						{items.length} illustrations washed ashore
					</motion.p>
				</div>

				{/* ── Scattered artwork field — flow layout with random offsets ── */}
				<div className="relative mx-auto w-full max-w-6xl px-4 py-8">
					{items.map((item, i) => {
						const s = scatterData[i]
						return (
							<div key={item.src}
								className="relative my-[-20px]"
								style={{
									marginLeft: `${s.left}%`,
									width: s.width,
									maxWidth: '48%',
									zIndex: s.zIndex
								}}>
								<ShoreCard item={item} index={i} rotation={s.rotation}
									onOpen={() => setLightboxIndex(i)} />
							</div>
						)
					})}
				</div>

				<div className="h-8" />
			</div>

			{/* ═════════════ DRY SAND — footer ═════════════ */}
			<div className="relative bg-[#d4c5a9] dark:bg-[#1e1b16]">
				<div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8">
					<div className="flex flex-col items-center gap-4 text-center">
						<p className="font-mono text-[10px] uppercase tracking-[0.45em] text-stone-600/40 dark:text-stone-500/30">
							Kemutai Hanashi · mikeblocky.com
						</p>
						<Link href="/artworks"
							className="inline-flex items-center gap-2 rounded-full border border-stone-400/25 bg-white/25 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-stone-600/60 backdrop-blur transition hover:bg-white/45 hover:text-stone-800 dark:border-white/8 dark:bg-white/5 dark:text-stone-400/40 dark:hover:bg-white/10 dark:hover:text-stone-300">
							<ArrowLeft className="size-3.5" /> Back to artworks
						</Link>
					</div>
				</div>
			</div>

			{/* ═════════════ LIGHTBOX ═════════════ */}
			<AnimatePresence>
				{lightboxIndex !== null && (
					<Lightbox allSrcs={allSrcs} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
				)}
			</AnimatePresence>
		</div>
	)
}
