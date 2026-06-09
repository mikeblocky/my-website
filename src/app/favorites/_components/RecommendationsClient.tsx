'use client'

import { useMemo } from 'react'
import { PillTabs } from '@/components/ui/tabs/PillTabs'
import { useUrlPersistedTab } from '@/components/ui/tabs/useUrlPersistedTab'
import { cn } from '@/lib/utils/utils'
import { recommendationGroups, type RecommendationTab } from '../_data/recommendations'
import { RecommendationCard } from './RecommendationCard'

function isRecommendationTab(value: string): value is RecommendationTab {
	return value in recommendationGroups
}

export function RecommendationsClient() {
	const [activeTab, setActiveTab] = useUrlPersistedTab<RecommendationTab>('mikeblocky:recommendations-tab', 'manga', isRecommendationTab)
	const activeGroup = recommendationGroups[activeTab]
	const tabs = useMemo(() => (
		Object.entries(recommendationGroups).map(([id, group]) => ({
			id: id as RecommendationTab,
			label: group.label,
			count: group.items.length,
		}))
	), [])

	return (
		<div className="space-y-6">
			<PillTabs
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				className="pb-4"
			/>

			<div className="grid grid-cols-1 gap-6">
				{activeGroup.items.map((item) => (
					<RecommendationCard key={`${activeTab}-${item.title}`} item={item} />
				))}
			</div>
		</div>
	)
}
