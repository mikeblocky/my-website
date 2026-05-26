'use client'

import type { ReactNode } from 'react'

interface SmoothPanelProps {
	children: ReactNode
	panelKey: string
	className?: string
}

export function SmoothPanel({ children, panelKey, className }: SmoothPanelProps) {
	return (
		<div
			key={panelKey}
			className={[
				'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200',
				className,
			].filter(Boolean).join(' ')}
		>
			{children}
		</div>
	)
}
