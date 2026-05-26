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
							'flex items-center gap-2.5 whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
							isActive
								? 'border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/20'
								: 'border-slate-300 bg-transparent text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-blue-500/50 dark:hover:text-blue-300'
						)}
					>
						<span>{tab.label}</span>
						{showCount && (
							<span className={cn(
								'rounded-full px-2 py-0.5 text-xs font-bold',
								isActive
									? 'bg-white/20 text-white'
									: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
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
