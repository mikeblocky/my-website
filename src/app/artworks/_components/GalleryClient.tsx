'use client'

import dynamic from 'next/dynamic'
import { ArtworksGallery } from './ArtworksGallery'
import { StatItem } from "@/lib/stats/types"
import { ArtworkItem } from '../_data/artworks'
import { PillTabs } from '@/components/ui/tabs/PillTabs'
import { useUrlPersistedTab } from '@/components/ui/tabs/useUrlPersistedTab'
import { SmoothPanel } from '@/components/ui/transition/SmoothPanel'
import { LoadingSurface } from '@/components/ui/loading/LoadingSurface'

const StatsClient = dynamic(
	() => import('../../stats/StatsClient').then((mod) => mod.StatsClient),
	{ loading: () => <LoadingSurface label="Loading stats..." /> }
)

interface ArtworkSection {
	title: string
	items: ArtworkItem[]
}

interface GalleryClientProps {
	sections: ArtworkSection[]
	statsData: StatItem[]
}

type Tab = 'illustrations' | 'stats'

function isGalleryTab(value: string): value is Tab {
	return value === 'illustrations' || value === 'stats'
}

export function GalleryClient({ sections, statsData }: GalleryClientProps) {
	const [activeTab, setActiveTab] = useUrlPersistedTab<Tab>('mikeblocky:artworks-tab', 'illustrations', isGalleryTab)

	const tabs = [
		{ id: 'illustrations' as Tab, label: 'Illustrations' },
		{ id: 'stats' as Tab, label: 'Theme breakdown & stats' }
	]

	return (
		<div className="space-y-8">
			<PillTabs
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				className="pb-1"
				showCounts={false}
			/>

			{/* Tab Contents with clean borderless transitions */}
			<SmoothPanel panelKey={activeTab}>
				{activeTab === 'illustrations' ? (
					<ArtworksGallery sections={sections} />
				) : (
					<StatsClient data={statsData} />
				)}
			</SmoothPanel>
		</div>
	)
}
