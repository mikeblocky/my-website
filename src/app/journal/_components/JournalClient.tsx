'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/utils'
import { BlogSearchPanel } from '@/app/blog/_components/BlogSearchPanel'
import { getDaysByMonth } from '@/app/diary/daily-notes/_data/days'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion/accordion"
import Link from 'next/link'
import { monoFont } from '@/styles/fonts/fonts'
import type { BlogPost } from '@/app/blog/_types/blog'
import { Keyboard, MousePointer, Book, PenTool } from 'lucide-react'

interface JournalClientProps {
	posts: BlogPost[]
}

type Tab = 'essays' | 'notes' | 'utensils'

export function JournalClient({ posts }: JournalClientProps) {
	const [activeTab, setActiveTab] = useState<Tab>('essays')
	const monthGroups = getDaysByMonth()
	const mostRecentMonth = monthGroups[0]?.month

	const tabs = [
		{ id: 'essays' as Tab, label: 'Essays & articles' },
		{ id: 'notes' as Tab, label: 'Daily notes' },
		{ id: 'utensils' as Tab, label: 'Stationery setup' }
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
							"px-5 py-2.5 text-sm font-semibold rounded-full border transition-all duration-200 focus:outline-none whitespace-nowrap",
							activeTab === tab.id
								? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/20"
								: "border-slate-300 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-300"
						)}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Tab Contents */}
			<motion.div
				key={activeTab}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.15 }}
			>
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
						
						{monthGroups.length > 0 ? (
							<Accordion type="single" defaultValue={mostRecentMonth} className="space-y-4">
								{monthGroups.map((group) => (
									<AccordionItem key={group.month} value={group.month} className="border-none">
										<AccordionTrigger className={cn(
											"p-0 hover:no-underline",
											"group flex items-center gap-3",
											"transition-all duration-200",
											"data-[state=open]:text-blue-600 dark:data-[state=open]:text-blue-300"
										)}>
											<span className={cn(
												monoFont.className,
												"relative tracking-wider text-sm text-foreground dark:text-white font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400"
											)}>
												{group.month}
											</span>
										</AccordionTrigger>
										<AccordionContent>
											<div className="pt-2 pl-2">
												<div className="flex flex-col">
													{group.days.map((day) => (
														<div key={day.href} className="group relative border-l-2 border-slate-200 dark:border-slate-800">
															<Link 
																href={day.href}
																className={cn(
																	monoFont.className,
																	"block py-2 pl-4 -ml-[2px]",
																	"text-xs sm:text-sm",
																	"text-slate-600 dark:text-slate-400",
																	"border-l-2 border-transparent",
																	"hover:border-blue-500 dark:hover:border-blue-400",
																	"hover:text-blue-600 dark:hover:text-blue-400",
																	"transition-all duration-150"
																)}
															>
																{day.title}
															</Link>
														</div>
													))}
												</div>
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
					<div className="space-y-6">
						<div className="mb-6">
							<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Journaling stationery</h3>
							<p className="text-sm text-muted-foreground leading-relaxed mt-1">
								The physical and digital tools, supplies, and layout configurations behind my notes and diary pages.
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{/* Utensil Card 1 */}
							<div className="p-4 rounded-lg bg-slate-100/50 dark:bg-slate-950/40">
								<div className="flex items-center gap-3 mb-2">
									<div className="p-1.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350">
										<Keyboard className="w-4 h-4" />
									</div>
									<h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Mechanical keyboard</h4>
								</div>
								<p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
									Used for rapid typing, drafting essays, and digital records.
								</p>
								<Link 
									href="https://www.logitech.com/en-us/products/keyboards/pop-keys-wireless-mechanical.920-010708.html"
									target="_blank"
									rel="noopener noreferrer"
									className="text-xs font-semibold text-blue-500 hover:underline"
								>
									Logitech POP Keys →
								</Link>
							</div>

							{/* Utensil Card 2 */}
							<div className="p-4 rounded-lg bg-slate-100/50 dark:bg-slate-950/40">
								<div className="flex items-center gap-3 mb-2">
									<div className="p-1.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350">
										<MousePointer className="w-4 h-4" />
									</div>
									<h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Workspace mouse</h4>
								</div>
								<p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
									Smooth navigating across files, tabs, and vector design sketches.
								</p>
								<Link 
									href="https://www.logitech.com/en-us/products/mice/pop-wireless-mouse.html"
									target="_blank"
									rel="noopener noreferrer"
									className="text-xs font-semibold text-blue-500 hover:underline"
								>
									Logitech POP Mouse →
								</Link>
							</div>

							{/* Utensil Card 3 */}
							<div className="p-4 rounded-lg bg-slate-100/50 dark:bg-slate-950/40">
								<div className="flex items-center gap-3 mb-2">
									<div className="p-1.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350">
										<Book className="w-4 h-4" />
									</div>
									<h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Physical diary</h4>
								</div>
								<p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
									A traditional, high-grade lined paper notebook sourced from Muji Japan for offline scripting.
								</p>
							</div>

							{/* Utensil Card 4 */}
							<div className="p-4 rounded-lg bg-slate-100/50 dark:bg-slate-950/40">
								<div className="flex items-center gap-3 mb-2">
									<div className="p-1.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350">
										<PenTool className="w-4 h-4" />
									</div>
									<h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Writing instrument</h4>
								</div>
								<p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
									A standard 0.5mm black ink ballpoint gel pen from Muji for precise note taking.
								</p>
							</div>
						</div>
					</div>
				)}
			</motion.div>
		</div>
	)
}
