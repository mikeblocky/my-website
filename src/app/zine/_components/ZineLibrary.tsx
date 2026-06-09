'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils/utils'
import { monoFont } from '@/styles/fonts/fonts'
import type { Zine } from '../_data/zines'
import { FlipBook } from './FlipBook'

type ZineLibraryProps = {
	zines: Zine[]
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
				<p className={cn(monoFont.className, "text-[10px] tracking-wider lowercase text-muted-foreground")}>
					bookshelf
				</p>
				<div className="grid gap-2">
					{zines.map((zine) => (
						<button
							key={zine.slug}
							type="button"
							onClick={() => setSelectedSlug(zine.slug)}
							className={cn(
								'w-full py-2.5 px-3 text-left transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] rounded-md border',
								selectedZine.slug === zine.slug
									? 'border-[hsl(var(--pride-glow-val))]/45 bg-[hsl(var(--pride-glow-val))]/5 text-foreground font-semibold shadow-none'
									: 'border-transparent text-muted-foreground hover:bg-slate-100/30 dark:hover:bg-slate-900/10'
							)}
						>
							<div className="flex flex-col gap-0.5">
								<span className="text-sm font-semibold text-foreground leading-tight">
									{zine.title}
								</span>
								<span className={cn(monoFont.className, "text-[9px] tracking-wider lowercase text-muted-foreground")}>
									{zine.orientation.substring(0, 3)} · {zine.pages.length}p · {zine.year}
								</span>
							</div>
						</button>
					))}
				</div>
			</aside>

			<section className="space-y-5">
				<div className="flex flex-col gap-4 pb-4 md:flex-row md:items-start md:justify-between">
					<div className="space-y-1">
						<p className={cn(monoFont.className, "text-[10px] tracking-wider lowercase text-[hsl(var(--pride-glow-val))] font-semibold")}>
							{selectedZine.year} · {selectedZine.orientation}
						</p>
						<h2 className="text-2xl font-bold tracking-tight text-foreground">
							{selectedZine.title}
						</h2>
						<p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
							{selectedZine.subtitle}
						</p>
					</div>
				</div>

				<FlipBook zine={selectedZine} />
			</section>
		</div>
	)
}
