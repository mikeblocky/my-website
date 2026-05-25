'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/utils'
import { ArtworksGallery } from './ArtworksGallery'
import { StatsClient } from '../../stats/StatsClient'
import { StatItem } from "@/lib/stats/types"
import { ArtworkItem } from '../_data/artworks'

interface ArtworkSection {
	title: string
	items: ArtworkItem[]
}

interface GalleryClientProps {
	sections: ArtworkSection[]
	statsData: StatItem[]
}

type Tab = 'illustrations' | 'stats'

export function GalleryClient({ sections, statsData }: GalleryClientProps) {
	const [activeTab, setActiveTab] = useState<Tab>('illustrations')

	const tabs = [
		{ id: 'illustrations' as Tab, label: 'Illustrations' },
		{ id: 'stats' as Tab, label: 'Theme breakdown & stats' }
	]

	return (
		<div className="space-y-8">
			{/* Sub-navigation Tabs - flat categories pill styles */}
			<div className="flex flex-wrap gap-2 pb-1">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						onClick={() => setActiveTab(tab.id)}
						className={cn(
							"px-5 py-2.5 text-sm font-semibold rounded-full border transition-all duration-200 focus:outline-none",
							activeTab === tab.id
								? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/20"
								: "border-slate-300 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-300"
						)}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Tab Contents with clean borderless transitions */}
			<motion.div
				key={activeTab}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.15 }}
			>
				{activeTab === 'illustrations' ? (
					<ArtworksGallery sections={sections} />
				) : (
					<StatsClient data={statsData} />
				)}
			</motion.div>
		</div>
	)
}
