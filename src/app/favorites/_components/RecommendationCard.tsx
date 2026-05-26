import { ExternalLink } from 'lucide-react'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { cn } from '@/lib/utils/utils'
import { monoFont, sansFont } from '@/styles/fonts/fonts'
import type { Recommendation } from '../_data/recommendations'

interface RecommendationCardProps {
	item: Recommendation
}

export function RecommendationCard({ item }: RecommendationCardProps) {
	return (
		<article className="group overflow-hidden rounded-xl bg-slate-50 shadow-none transition-colors duration-150 hover:bg-slate-100/70 dark:bg-slate-900/60 dark:hover:bg-slate-900/80">
			{item.imageUrl && (
				<div className="relative h-48 w-full bg-white sm:h-64 dark:bg-slate-950">
					<img
						src={item.imageUrl}
						alt=""
						className="h-full w-full object-cover object-center"
						loading="lazy"
					/>
				</div>
			)}

			<div className="p-5 sm:p-6">
				<StackVertical gap="sm" className="min-w-0">
					{!item.imageUrl && (
						<div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-lg bg-white text-lg font-black text-blue-700 dark:bg-slate-950 dark:text-blue-300">
							<div className="flex h-full w-full items-center justify-center">
								{item.medium.slice(0, 1)}
							</div>
						</div>
					)}

					<div className="flex flex-wrap items-center gap-2">
						<span className={cn(sansFont.className, 'rounded-md border border-blue-200/50 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800/40 dark:bg-blue-950/40 dark:text-blue-300')}>
							{item.medium}
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
						<div className="flex flex-wrap gap-2 pt-1">
							{item.links.map((link) => (
								<a
									key={link.url}
									href={link.url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-600 transition-colors hover:border-blue-200 hover:text-blue-800 dark:border-slate-800 dark:bg-slate-950/40 dark:text-blue-400 dark:hover:border-blue-500/40 dark:hover:text-blue-300"
								>
									{link.label}
									<ExternalLink size={13} />
								</a>
							))}
						</div>
					)}
				</StackVertical>
			</div>
		</article>
	)
}
