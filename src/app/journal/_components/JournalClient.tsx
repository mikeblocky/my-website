'use client'

import { cn } from '@/lib/utils/utils'
import { BlogSearchPanel } from '@/app/blog/_components/BlogSearchPanel'
import { getDaysByMonth, readingSeries } from '@/app/diary/daily-notes/_data/days'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion/accordion"
import Link from 'next/link'
import { monoFont } from '@/styles/fonts/fonts'
import type { BlogPost } from '@/app/blog/_types/blog'
import { PillTabs } from '@/components/ui/tabs/PillTabs'
import { useUrlPersistedTab } from '@/components/ui/tabs/useUrlPersistedTab'
import { SmoothPanel } from '@/components/ui/transition/SmoothPanel'
import { StationeryUtensils } from './StationeryUtensils'
import { ListeningActivity } from './ListeningActivity'

interface JournalClientProps {
	posts: BlogPost[]
}

type Tab = 'essays' | 'notes' | 'utensils' | 'activity'

const JOURNAL_CLIENT_VERSION = 'journal-client-2026-06-08-modular'

function isJournalTab(value: string): value is Tab {
	return value === 'essays' || value === 'notes' || value === 'utensils' || value === 'activity'
}

export function JournalClient({ posts }: JournalClientProps) {
	const [activeTab, setActiveTab] = useUrlPersistedTab<Tab>('mikeblocky:journal-tab', 'essays', isJournalTab)
	const monthGroups = getDaysByMonth()
	const mostRecentMonth = monthGroups[0]?.month

	const tabs = [
		{ id: 'essays' as Tab, label: 'Essays & articles' },
		{ id: 'notes' as Tab, label: 'Daily notes' },
		{ id: 'utensils' as Tab, label: 'Stationery setup' },
		{ id: 'activity' as Tab, label: 'Activity' }
	]

	return (
		<div className="space-y-8" data-journal-client-version={JOURNAL_CLIENT_VERSION}>
			<PillTabs
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				className="pb-1"
				showCounts={false}
			/>

			{/* Tab Contents */}
			<SmoothPanel panelKey={activeTab}>
				{activeTab === 'essays' && (
					<div className="space-y-6">
						<BlogSearchPanel posts={posts} />
					</div>
				)}

				{activeTab === 'notes' && (
					<div className="space-y-6">
						<div className="mb-4">
							<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Daily journal logs</h3>
							<p className="text-sm text-muted-foreground leading-relaxed mt-1">
								Short entries, gratitude notes, and snapshots of what I document and learn each day.
							</p>
						</div>

						{readingSeries.length > 0 && (
							<section className="space-y-3">
								<h4 className={cn(
									monoFont.className,
									"relative tracking-wider text-sm text-foreground dark:text-white font-semibold"
								)}>
									Reading notes
								</h4>
								<div className="pt-2 flex flex-col gap-1">
									{readingSeries.map((note) => (
										<div key={note.href}>
											<Link
												href={note.href}
												className={cn(
													monoFont.className,
													"block py-1.5 px-3 rounded-md border border-transparent",
													"text-xs sm:text-sm",
													"text-slate-655 dark:text-slate-400",
													"hover:border-[hsl(var(--pride-glow-val))]/20 hover:bg-[hsl(var(--pride-glow-val))]/5 hover:pride-text",
													"transition-all duration-150"
												)}
											>
												{note.title}
											</Link>
										</div>
									))}
								</div>
							</section>
						)}
						
						{monthGroups.length > 0 ? (
							<Accordion type="single" defaultValue={mostRecentMonth} className="space-y-4">
								{monthGroups.map((group) => (
									<AccordionItem key={group.month} value={group.month} className="border-none">
										<AccordionTrigger className={cn(
											"p-0 hover:no-underline",
											"group flex items-center gap-3",
											"transition-all duration-200",
											"data-[state=open]:pride-text"
										)}>
											<span className={cn(
												monoFont.className,
												"relative tracking-wider text-sm text-foreground dark:text-white font-semibold group-hover:pride-text"
											)}>
												{group.month}
											</span>
										</AccordionTrigger>
										<AccordionContent>
											<div className="pt-2 flex flex-col gap-1">
												{group.days.map((day) => (
													<div key={day.href}>
														<Link 
															href={day.href}
															className={cn(
																monoFont.className,
																"block py-1.5 px-3 rounded-md border border-transparent",
																"text-xs sm:text-sm",
																"text-slate-655 dark:text-slate-400",
																"hover:border-[hsl(var(--pride-glow-val))]/20 hover:bg-[hsl(var(--pride-glow-val))]/5 hover:pride-text",
																"transition-all duration-150"
															)}
														>
															{day.title}
														</Link>
													</div>
												))}
											</div>
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						) : (
							<p className="text-xs text-muted-foreground">No notes archived yet.</p>
						)}
					</div>
				)}

				{activeTab === 'utensils' && (
					<StationeryUtensils />
				)}

				{activeTab === 'activity' && (
					<ListeningActivity />
				)}
			</SmoothPanel>
		</div>
	)
}
