import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { cn } from '@/lib/utils/utils'
import { monoFont, sansFont } from '@/styles/fonts/fonts'
import type { Recommendation } from '../_data/recommendations'

interface RecommendationCardProps {
	item: Recommendation
}

export function RecommendationCard({ item }: RecommendationCardProps) {
	const isTopThumbnail = true

	return (
		<article className={cn(
			"group overflow-hidden rounded-md border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/40 dark:hover:bg-slate-900/50 transition-colors duration-150 shadow-none flex flex-col h-full",
			!isTopThumbnail && "sm:flex-row min-h-[220px]"
		)}>
			{item.imageUrl && (
				<div className={cn(
					"relative bg-white dark:bg-slate-950 shrink-0 border-slate-200/60 dark:border-slate-800/60",
					isTopThumbnail
						? "h-48 sm:h-64 w-full border-b"
						: "h-48 w-full sm:h-auto sm:w-44 lg:w-36 border-b sm:border-b-0 sm:border-r"
				)}>
					<img
						src={item.imageUrl}
						alt=""
						className="h-full w-full object-cover object-center"
						loading="lazy"
					/>
				</div>
			)}

			<div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
				<StackVertical gap="sm" className="min-w-0">
					{!item.imageUrl && (
						<div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-md bg-white text-lg font-black text-slate-700 dark:bg-slate-950 dark:text-slate-300 border border-slate-200/50 dark:border-slate-850/50">
							<div className="flex h-full w-full items-center justify-center">
								{item.medium.slice(0, 1)}
							</div>
						</div>
					)}

					<div className="flex flex-wrap items-center gap-2">
						<span className={cn(monoFont.className, 'text-[10px] tracking-wider pride-text')}>
							{item.medium.toLowerCase()}
						</span>
					</div>

					<div>
						<h2 className={cn(sansFont.className, 'break-words text-lg font-bold text-slate-950 dark:text-slate-50')}>
							{item.title}
						</h2>
						<p className={cn(monoFont.className, 'text-xs text-muted-foreground')}>
							{item.creator}
						</p>
					</div>

					<p className={cn(sansFont.className, 'text-sm leading-relaxed text-slate-700 dark:text-slate-300')}>
						{item.thought}
					</p>

					{item.links.length > 0 && (
						<div className="flex flex-wrap gap-3 pt-1">
							{item.links.map((link) => (
								<a
									key={link.url}
									href={link.url}
									target="_blank"
									rel="noopener noreferrer"
									className={cn(monoFont.className, 'inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:pride-text transition-colors duration-150')}
								>
									{link.label.toLowerCase()} →
								</a>
							))}
						</div>
					)}
				</StackVertical>
			</div>
		</article>
	)
}

