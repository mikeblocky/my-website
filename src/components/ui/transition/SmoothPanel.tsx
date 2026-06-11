'use client'

import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface SmoothPanelProps {
	children: ReactNode
	panelKey: string
	className?: string
}

export function SmoothPanel({ children, panelKey, className }: SmoothPanelProps) {
	const prefersReducedMotion = useReducedMotion()

	if (prefersReducedMotion) {
		return <div className={className}>{children}</div>
	}

	return (
		<AnimatePresence mode="wait" initial={false}>
			<motion.div
				key={panelKey}
				initial={{ opacity: 0, y: 6 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -6 }}
				transition={{
					opacity: { duration: 0.18, ease: 'linear' },
					y: { duration: 0.24, ease: [0.16, 1, 0.3, 1] }
				}}
				className={className}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	)
}

