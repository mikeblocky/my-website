'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import type { ArtworkItem } from '../../_data/artworks'

interface ShoreCardProps {
	item: ArtworkItem
	index: number
	rotation: number
	onOpen: () => void
}

export function ShoreCard({ item, index, rotation, onOpen }: ShoreCardProps) {
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
				className="group relative block overflow-hidden rounded-md border border-stone-200 bg-white p-1.5 transition-all duration-500 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-sky-400/30 sm:p-2 dark:border-slate-800 dark:bg-slate-900"
				style={{ transform: `rotate(${rotation}deg)` }}>
				<Image src={item.src} alt="Kemutai Hanashi artwork" width={1600} height={2000}
					priority={index < 3} sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
					className="h-auto w-full rounded-md object-contain transition duration-700 group-hover:scale-[1.02]" />
			</button>
		</motion.div>
	)
}
