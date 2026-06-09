'use client'

import Link from 'next/link'
import { useState, useMemo, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { DynamicBreadcrumb } from '@/components/ui/primitives/breadcrumb'
import { ThemeToggle } from '@/components/ui/theme/theme-toggle'
import type { ArtworkItem } from '../../_data/artworks'

import { StarrySky } from './StarrySky'
import { OrganicWaves } from './OrganicWaves'
import { ShoreCard } from './ShoreCard'
import { Lightbox } from './Lightbox'

interface Props { items: ArtworkItem[] }

/* ─────── seeded PRNG ─────── */
function seededRandom(seed: number) {
	let s = seed
	return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

const pageStyles = `
@keyframes sand-grain {
	0%   { opacity: .03; }
	50%  { opacity: .07; }
	100% { opacity: .03; }
}
`

export function KemutaiHanashiClient({ items }: Props) {
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
	const [scatterSeed] = useState(() => Math.floor(Math.random() * 100000))
	const allSrcs = items.map((i) => i.src)

	const oceanRef = useRef<HTMLDivElement>(null)
	const { scrollYProgress } = useScroll({ target: oceanRef, offset: ['start start', 'end start'] })
	const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
	const textY = useTransform(scrollYProgress, [0, 0.6], [0, -50])

	/* ── truly random scatter: no grid logic, pure chaos ── */
	const scatterData = useMemo(() => {
		const rand = seededRandom(scatterSeed)
		return items.map(() => {
			const left = 2 + rand() * 72            // 2-74% from left
			const rotation = (rand() - 0.5) * 20    // -10 to +10 degrees
			const width = 150 + rand() * 130         // 150-280px
			const zIndex = Math.floor(rand() * 20)
			return { left, rotation, width, zIndex }
		})
	}, [items, scatterSeed])

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
							{ href: '/', label: 'Home', emoji: '🐶' },
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
