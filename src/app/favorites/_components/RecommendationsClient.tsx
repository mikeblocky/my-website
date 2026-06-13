'use client'

import { useMemo, useState, useEffect } from 'react'
import { PillTabs } from '@/components/ui/tabs/PillTabs'
import { useUrlPersistedTab } from '@/components/ui/tabs/useUrlPersistedTab'
import { cn } from '@/lib/utils/utils'
import { sansFont } from '@/styles/fonts/fonts'
import { LayoutGrid, LayoutList } from 'lucide-react'
import { recommendationGroups, type RecommendationTab } from '../_data/recommendations'
import { RecommendationCard } from './RecommendationCard'
import { RecommendationGenerator } from './RecommendationGenerator'

type FavoritesTab = RecommendationTab | 'generator'

function isFavoritesTab(value: string): value is FavoritesTab {
	return value === 'generator' || value in recommendationGroups
}

export function RecommendationsClient() {
	const [activeTab, setActiveTab] = useUrlPersistedTab<FavoritesTab>('mikeblocky:recommendations-tab', 'manga', isFavoritesTab)
	const activeGroup = activeTab !== 'generator' ? recommendationGroups[activeTab] : null
	const [viewMode, setViewMode] = useState<'detailed' | 'simplified'>('detailed')
	const [capturingId, setCapturingId] = useState<string | null>(null)

	const handleCapture = async (wrapperId: string, filename: string) => {
		const element = document.getElementById(wrapperId)
		if (!element) return

		setCapturingId(wrapperId)
		// Wait for React rendering to commit the styling classes to the DOM
		await new Promise((resolve) => setTimeout(resolve, 150))
		
		try {
			const { toPng } = await import('html-to-image')
			const dataUrl = await toPng(element, {
				style: {
					transform: 'none',
				},
			})

			const link = document.createElement('a')
			link.download = filename
			link.href = dataUrl
			link.click()
		} catch (error) {
			console.error('Failed to capture:', error)
		} finally {
			setCapturingId(null)
		}
	}

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

	const tabs = useMemo(() => {
		const baseTabs = Object.entries(recommendationGroups).map(([id, group]) => ({
			id: id as FavoritesTab,
			label: group.label,
			count: group.items.length,
		}))
		return [
			...baseTabs,
			{ id: 'generator' as FavoritesTab, label: 'card generator' }
		]
	}, [])

	return (
		<div className="space-y-6">
			<style dangerouslySetInnerHTML={{__html: `
				/* Official Site Background mimicking the body */
				.official-bg-preview {
					background-image:
						radial-gradient(circle at 10% 10%, hsl(350 85% 72% / 0.14), transparent 45rem),
						radial-gradient(circle at 30% 30%, hsl(52 92% 70% / 0.11), transparent 40rem),
						radial-gradient(circle at 50% 50%, hsl(142 76% 66% / 0.09), transparent 40rem),
						radial-gradient(circle at 75% 70%, hsl(206 90% 72% / 0.13), transparent 45rem),
						radial-gradient(circle at 95% 90%, hsl(272 75% 70% / 0.08), transparent 55rem),
						linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)),
						url('/distribution/2026/kemutai-hanashi/Illustration125c.webp?v=1') !important;
					background-size: cover !important;
					background-position: center !important;
					background-repeat: no-repeat !important;
				}
				.dark .official-bg-preview {
					background-image:
						radial-gradient(circle at 10% 10%, hsl(350 85% 72% / 0.09), transparent 45rem),
						radial-gradient(circle at 30% 30%, hsl(52 92% 70% / 0.07), transparent 40rem),
						radial-gradient(circle at 50% 50%, hsl(142 76% 66% / 0.06), transparent 40rem),
						radial-gradient(circle at 75% 70%, hsl(206 90% 72% / 0.09), transparent 45rem),
						radial-gradient(circle at 95% 90%, hsl(272 75% 70% / 0.05), transparent 55rem),
						linear-gradient(rgba(7, 12, 22, 0.95), rgba(7, 12, 22, 0.95)),
						url('/distribution/2026/kemutai-hanashi/Illustration125c.webp?v=1') !important;
					background-size: cover !important;
					background-position: center !important;
					background-repeat: no-repeat !important;
				}
			`}} />
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
				<PillTabs
					tabs={tabs}
					activeTab={activeTab}
					onTabChange={setActiveTab}
					className="pb-0"
				/>

				{activeTab !== 'generator' && (
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
				)}

			</div>

			{activeTab !== 'generator' && (
				<div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-900 text-xs">
					<div className="flex flex-wrap items-center gap-4">
						<div className="flex items-center gap-1.5 flex-wrap">
							<span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">capture row</span>
							{Array.from({ length: Math.ceil((activeGroup?.items?.length ?? 0) / 2) }).map((_, rIdx) => (
								<button
									key={rIdx}
									onClick={() => handleCapture(`favorites-official-row-wrapper-${rIdx}`, `favorites-${activeTab}-row-${rIdx + 1}.png`)}
									disabled={capturingId !== null}
									className={cn(
										"px-2 py-0.5 text-[9px] font-bold rounded border cursor-pointer lowercase transition-colors",
										capturingId === `favorites-official-row-wrapper-${rIdx}`
											? "text-red-500 border-red-500/35 bg-red-500/5 font-bold"
											: "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-350 hover:text-slate-800 dark:hover:border-slate-700 dark:hover:text-slate-200"
									)}
								>
									{capturingId === `favorites-official-row-wrapper-${rIdx}` ? 'saving...' : rIdx + 1}
								</button>
							))}
						</div>

						{(activeGroup?.items?.length ?? 0) > 2 && (
							<div className="flex items-center gap-1.5 flex-wrap border-l border-slate-200 dark:border-slate-800 pl-4">
								<span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">capture 2 rows</span>
								{Array.from({ length: Math.ceil((activeGroup?.items?.length ?? 0) / 4) }).map((_, bIdx) => {
									const startRow = bIdx * 2 + 1
									const endRow = Math.min(bIdx * 2 + 2, Math.ceil((activeGroup?.items?.length ?? 0) / 2))
									const label = startRow === endRow ? `${startRow}` : `${startRow}-${endRow}`
									return (
										<button
											key={bIdx}
											onClick={() => handleCapture(`favorites-official-block-wrapper-${bIdx}`, `favorites-${activeTab}-rows-${label}.png`)}
											disabled={capturingId !== null}
											className={cn(
												"px-2 py-0.5 text-[9px] font-bold rounded border cursor-pointer lowercase transition-colors",
												capturingId === `favorites-official-block-wrapper-${bIdx}`
													? "text-red-500 border-red-500/35 bg-red-500/5 font-bold"
													: "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-350 hover:text-slate-800 dark:hover:border-slate-700 dark:hover:text-slate-200"
											)}
										>
											{capturingId === `favorites-official-block-wrapper-${bIdx}` ? 'saving...' : label}
										</button>
									)
								})}
							</div>
						)}
					</div>
				</div>
			)}

			{activeTab === 'generator' ? (
				<RecommendationGenerator />
			) : (
				<div className="space-y-6">
					{/* Group items by blocks of 2 rows (4 items per block) */}
					{Array.from({ length: Math.ceil((activeGroup?.items?.length ?? 0) / 4) }).map((_, blockIdx) => (
						<div
							key={blockIdx}
							id={`favorites-official-block-wrapper-${blockIdx}`}
							className={cn(
								"w-full transition-all duration-150",
								capturingId === `favorites-official-block-wrapper-${blockIdx}`
									? "official-bg-preview rounded-xl border border-slate-200/40 dark:border-slate-850/20 shadow-md p-6"
									: "bg-transparent p-0 border-none shadow-none"
							)}
						>
							<div
								id={`favorites-official-block-${blockIdx}`}
								className="space-y-6"
							>
								{/* Each 2-row block contains up to 2 rows */}
								{Array.from({ length: 2 }).map((_, localRowIdx) => {
									const rowIdx = blockIdx * 2 + localRowIdx
									const startIdx = rowIdx * 2
									const rowItems = activeGroup?.items.slice(startIdx, startIdx + 2) || []
									if (rowItems.length === 0) return null

									return (
										<div
											key={rowIdx}
											id={`favorites-official-row-wrapper-${rowIdx}`}
											className={cn(
												"w-full transition-all duration-150",
												capturingId === `favorites-official-row-wrapper-${rowIdx}`
													? "official-bg-preview rounded-xl border border-slate-200/40 dark:border-slate-850/20 shadow-md p-6"
													: "bg-transparent p-0 border-none shadow-none"
											)}
										>
											<div
												id={`favorites-official-row-${rowIdx}`}
												className="grid grid-cols-1 lg:grid-cols-2 gap-6"
											>
												{rowItems.map((item) => (
													<RecommendationCard
														key={`${activeTab}-${item.title}`}
														item={item}
														viewMode={viewMode}
													/>
												))}
											</div>
										</div>
									)
								})}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
