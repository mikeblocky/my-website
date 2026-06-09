'use client'

import { cn } from '@/lib/utils/utils'
import { sansFont } from '@/styles/fonts/fonts'

export interface PillTabItem<TId extends string> {
	id: TId
	label: string
	count?: number
}

interface PillTabsProps<TId extends string> {
	tabs: PillTabItem<TId>[]
	activeTab: TId
	onTabChange: (tab: TId) => void
	className?: string
	showCounts?: boolean
}

export function PillTabs<TId extends string>({
	tabs,
	activeTab,
	onTabChange,
	className,
	showCounts = true,
}: PillTabsProps<TId>) {
	return (
		<div className={cn('flex flex-wrap gap-2', className)}>
			{tabs.map((tab) => {
				const isActive = activeTab === tab.id
				const showCount = showCounts && typeof tab.count === 'number'

				return (
					<button
						key={tab.id}
						type="button"
						onClick={() => onTabChange(tab.id)}
						className={cn(
							sansFont.className,
							'pride-ring flex items-center gap-2.5 whitespace-nowrap rounded-sm border px-3 py-1.5 text-[10px] lowercase tracking-wider font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2',
							isActive
								? 'bg-[hsl(var(--pride-glow-val))]/10 text-[hsl(var(--pride-glow-val))] border-[hsl(var(--pride-glow-val))]/45 shadow-none'
								: 'pride-outline-hover border-slate-200 bg-transparent text-slate-500 hover:border-slate-350 hover:text-slate-800 dark:border-slate-850 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
						)}
					>
						<span>{tab.label}</span>
						{showCount && (
							<span className={cn(
								'rounded-sm px-1.5 py-0.5 text-[9px] font-bold',
								isActive
									? 'bg-[hsl(var(--pride-glow-val))]/20 text-[hsl(var(--pride-glow-val))] dark:bg-[hsl(var(--pride-glow-val))]/30'
									: 'bg-slate-100 text-slate-500 dark:bg-slate-900/50 dark:text-slate-400'
							)}>
								{tab.count}
							</span>
						)}
					</button>
				)
			})}
		</div>
	)
}
