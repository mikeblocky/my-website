'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'

interface LightboxProps {
	allSrcs: string[]
	initialIndex: number
	onClose: () => void
}

export function Lightbox({ allSrcs, initialIndex, onClose }: LightboxProps) {
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
		enter: (d: number) => ({ opacity: 0, x: d * 40, scale: 0.96 }),
		center: { opacity: 1, x: 0, scale: 1 },
		exit: (d: number) => ({ opacity: 0, x: d * -40, scale: 0.96 })
	}

	return createPortal(
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
			transition={{ duration: 0.25 }}
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/92" onClick={onClose}>
			<button type="button" aria-label="Close" onClick={onClose}
				className="absolute right-4 top-4 z-30 rounded-md bg-white/10 border border-white/10 p-2.5 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white sm:right-6 sm:top-6">
				<X size={18} /></button>
			<button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); prev() }}
				className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-md bg-white/10 border border-white/10 p-2.5 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white sm:left-6">
				<ChevronLeft size={22} /></button>
			<button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); next() }}
				className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-md bg-white/10 border border-white/10 p-2.5 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white sm:right-6">
				<ChevronRight size={22} /></button>
			<span className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 font-mono text-[10px] lowercase tracking-[0.2em] text-white/40">
				{current + 1} / {total}</span>
			<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
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
