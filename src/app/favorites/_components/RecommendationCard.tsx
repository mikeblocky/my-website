'use client'

import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { cn } from '@/lib/utils/utils'
import { monoFont, sansFont } from '@/styles/fonts/fonts'
import type { Recommendation } from '../_data/recommendations'

interface RecommendationCardProps {
	item: Recommendation
	viewMode?: 'detailed' | 'simplified'
	compact?: boolean
}

export function RecommendationCard({ item, viewMode = 'detailed', compact = false }: RecommendationCardProps) {
	return (
		<article className="group overflow-hidden rounded-md border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/40 dark:hover:bg-slate-900/50 transition-colors duration-150 shadow-none flex flex-col h-full">
			{item.imageUrl && (
				<div className={cn(
					"relative bg-slate-100/50 dark:bg-slate-950/20 shrink-0 border-b border-slate-200/60 dark:border-slate-800/60 overflow-hidden w-full rounded-t-md",
					compact ? "h-24 sm:h-24" : "h-48 sm:h-64"
				)}>
					<img
						src={item.imageUrl}
						alt=""
						className="h-full w-full object-cover object-center rounded-t-md"
						loading="lazy"
					/>
				</div>
			)}

			<div className={cn("flex flex-col justify-between flex-1", compact ? "p-3.5" : "p-5 sm:p-6")}>
				<StackVertical gap={compact ? "xs" : "sm"} className="min-w-0">
					{!item.imageUrl && (
						<div className={cn(
							"relative w-full shrink-0 overflow-hidden rounded-md bg-white font-black text-slate-700 dark:bg-slate-950 dark:text-slate-300 border border-slate-200/50 dark:border-slate-850/50",
							compact ? "aspect-[2/1] text-sm" : "aspect-[3/4] text-lg"
						)}>
							<div className="flex h-full w-full items-center justify-center">
								{item.medium.slice(0, 1)}
							</div>
						</div>
					)}

					<div className="flex flex-wrap items-center gap-2">
						<span className={cn(monoFont.className, 'tracking-wider pride-text', compact ? "text-[8px]" : "text-[10px]")}>
							{item.medium.toLowerCase()}
						</span>
					</div>

					<div>
						<h2 className={cn(sansFont.className, 'break-words font-bold text-slate-950 dark:text-slate-50', compact ? "text-sm" : "text-lg")}>
							{item.title}
						</h2>
						<p className={cn(monoFont.className, 'text-muted-foreground', compact ? "text-[10px]" : "text-xs")}>
							{item.creator}
						</p>
					</div>

					{viewMode === 'detailed' && (
						<>
							<p className={cn(sansFont.className, 'leading-relaxed text-slate-700 dark:text-slate-300', compact ? "text-[11px]" : "text-sm")}>
								{item.thought}
							</p>

							{item.links.length > 0 && (
								<div className="flex flex-wrap gap-2.5 pt-0.5">
									{item.links.map((link) => (
										<a
											key={link.url}
											href={link.url}
											target="_blank"
											rel="noopener noreferrer"
											className={cn(monoFont.className, 'inline-flex items-center gap-1 text-muted-foreground hover:pride-text transition-colors duration-150', compact ? "text-[10px]" : "text-[11px]")}
										>
											{link.label.toLowerCase()} →
										</a>
									))}
								</div>
							)}
						</>
					)}
				</StackVertical>
			</div>
		</article>
	)
}
