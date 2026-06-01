'use client'

import { cn } from '@/lib/utils/utils'

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
							'pride-ring flex items-center gap-2.5 whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2',
							isActive
								? 'pride-button shadow-md'
								: 'pride-outline-hover border-slate-300 bg-transparent text-slate-600 dark:border-slate-800 dark:text-slate-400'
						)}
					>
						<span>{tab.label}</span>
						{showCount && (
							<span className={cn(
								'rounded-full px-2 py-0.5 text-xs font-bold',
								isActive
									? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
									: 'bg-slate-50 text-slate-500 dark:bg-slate-900/50 dark:text-slate-400'
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
