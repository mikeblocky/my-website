'use client'

import { useMemo, useState, useEffect } from 'react'
import { PillTabs } from '@/components/ui/tabs/PillTabs'
import { useUrlPersistedTab } from '@/components/ui/tabs/useUrlPersistedTab'
import { cn } from '@/lib/utils/utils'
import { sansFont } from '@/styles/fonts/fonts'
import { LayoutGrid, LayoutList } from 'lucide-react'
import { recommendationGroups, type RecommendationTab } from '../_data/recommendations'
import { RecommendationCard } from './RecommendationCard'

function isRecommendationTab(value: string): value is RecommendationTab {
	return value in recommendationGroups
}

export function RecommendationsClient() {
	const [activeTab, setActiveTab] = useUrlPersistedTab<RecommendationTab>('mikeblocky:recommendations-tab', 'manga', isRecommendationTab)
	const activeGroup = recommendationGroups[activeTab]
	const [viewMode, setViewMode] = useState<'detailed' | 'simplified'>('detailed')

	// Load viewMode from localStorage on mount
	useEffect(() => {
		const stored = localStorage.getItem('mikeblocky:recommendations-view')
		if (stored === 'detailed' || stored === 'simplified') {
			setViewMode(stored)
		}
	}, [])

	// Save viewMode to localStorage when changed
	const handleViewModeChange = (mode: 'detailed' | 'simplified') => {
		setViewMode(mode)
		localStorage.setItem('mikeblocky:recommendations-view', mode)
	}

	const tabs = useMemo(() => (
		Object.entries(recommendationGroups).map(([id, group]) => ({
			id: id as RecommendationTab,
			label: group.label,
			count: group.items.length,
		}))
	), [])

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
				<PillTabs
					tabs={tabs}
					activeTab={activeTab}
					onTabChange={setActiveTab}
					className="pb-0"
				/>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => handleViewModeChange('detailed')}
						className={cn(
							sansFont.className,
							'pride-ring flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-2.5 py-1 text-[10px] lowercase tracking-wider font-semibold focus:outline-none transition-colors duration-200 cursor-pointer',
							viewMode === 'detailed'
								? 'text-[hsl(var(--pride-glow-val))] border-[hsl(var(--pride-glow-val))]/45 bg-[hsl(var(--pride-glow-val))]/10 shadow-none'
								: 'border-slate-200 bg-transparent text-slate-500 hover:border-slate-350 hover:text-slate-800 dark:border-slate-850 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
						)}
					>
						<LayoutList className="h-3 w-3" />
						detailed
					</button>
					<button
						type="button"
						onClick={() => handleViewModeChange('simplified')}
						className={cn(
							sansFont.className,
							'pride-ring flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-2.5 py-1 text-[10px] lowercase tracking-wider font-semibold focus:outline-none transition-colors duration-200 cursor-pointer',
							viewMode === 'simplified'
								? 'text-[hsl(var(--pride-glow-val))] border-[hsl(var(--pride-glow-val))]/45 bg-[hsl(var(--pride-glow-val))]/10 shadow-none'
								: 'border-slate-200 bg-transparent text-slate-500 hover:border-slate-350 hover:text-slate-800 dark:border-slate-850 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
						)}
					>
						<LayoutGrid className="h-3 w-3" />
						simplified
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{activeGroup.items.map((item) => (
					<RecommendationCard
						key={`${activeTab}-${item.title}`}
						item={item}
						viewMode={viewMode}
					/>
				))}
			</div>
		</div>
	)
}
