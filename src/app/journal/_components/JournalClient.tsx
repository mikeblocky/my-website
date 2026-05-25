'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/utils'
import { BlogSearchPanel } from '@/app/blog/_components/BlogSearchPanel'
import { getDaysByMonth } from '@/app/diary/daily-notes/_data/days'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion/accordion"
import Link from 'next/link'
import { monoFont } from '@/styles/fonts/fonts'
import type { BlogPost } from '@/app/blog/_types/blog'
import { Keyboard, MousePointer, Book, PenTool } from 'lucide-react'

const SpotifyIcon = () => (
	<svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
		<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.744-.47-.077-.337.135-.668.47-.745 3.856-.88 7.15-.506 9.822 1.13.295.178.387.563.205.86zm1.224-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.183-.412.125-.845-.107-.97-.52-.124-.412.108-.846.52-.97 3.668-1.112 8.248-.567 11.374 1.354.366.226.486.707.226 1.074zm.107-2.846C14.403 8.8 8.442 8.6 4.992 9.65c-.53.16-1.09-.14-1.25-.67-.16-.53.14-1.09.67-1.25 3.96-1.202 10.55-.974 14.61 1.44.477.284.63.9.347 1.378-.283.477-.9.63-1.377.347z"/>
	</svg>
)

const AppleMusicIcon = () => (
	<svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
		<path d="M19.004 3c-.11 0-.22.024-.32.072l-9.98 4.77C8.28 8.046 8 8.472 8 8.943v8.303C7.24 16.545 6.162 16 5 16c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V11.272l9-4.303v5.277c-.76-.702-1.838-1.246-3-1.246-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V3.943c0-.47-.28-.897-.7-.99-.1-.02-.2-.03-.3-.03z"/>
	</svg>
)

const YouTubeIcon = () => (
	<svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
		<path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.387.51A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.862.51 9.387.51 9.387.51s7.525 0 9.387-.51a3.003 3.003 0 0 0 2.11-2.108c.502-1.907.502-5.837.502-5.837s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
	</svg>
)

interface JournalClientProps {
	posts: BlogPost[]
}

type Tab = 'essays' | 'notes' | 'utensils' | 'activity'

export function JournalClient({ posts }: JournalClientProps) {
	const [activeTab, setActiveTab] = useState<Tab>('essays')
	const monthGroups = getDaysByMonth()
	const mostRecentMonth = monthGroups[0]?.month

	const tabs = [
		{ id: 'essays' as Tab, label: 'Essays & articles' },
		{ id: 'notes' as Tab, label: 'Daily notes' },
		{ id: 'utensils' as Tab, label: 'Stationery setup' },
		{ id: 'activity' as Tab, label: 'Activity' }
	]

	const [activities, setActivities] = useState<any[]>([])
	const [currentlyPlaying, setCurrentlyPlaying] = useState<any | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [spotifyStatus, setSpotifyStatus] = useState<'success' | 'error' | null>(null)
	const [liveProgressMs, setLiveProgressMs] = useState<number>(0)
	const [activePreviewId, setActivePreviewId] = useState<string | null>(null)
	const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

	const togglePreview = (trackId: string, previewUrl: string, e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		if (!previewUrl) return

		if (activePreviewId === trackId) {
			audio?.pause()
			setActivePreviewId(null)
			return
		}

		if (audio) {
			audio.pause()
		}

		const newAudio = new Audio(previewUrl)
		newAudio.volume = 0.4
		newAudio.play()
		setAudio(newAudio)
		setActivePreviewId(trackId)

		newAudio.onended = () => {
			setActivePreviewId(null)
		}
	}

	useEffect(() => {
		return () => {
			if (audio) {
				audio.pause()
			}
		}
	}, [audio])


	const formatDuration = (ms: number) => {
		if (!ms) return '0:00'
		const totalSeconds = Math.floor(ms / 1000)
		const minutes = Math.floor(totalSeconds / 60)
		const seconds = totalSeconds % 60
		return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
	}

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const params = new URLSearchParams(window.location.search)
			if (params.get('spotify') === 'success') {
				setSpotifyStatus('success')
				window.history.replaceState({}, '', window.location.pathname)
			} else if (params.get('spotify') === 'error') {
				setSpotifyStatus('error')
				window.history.replaceState({}, '', window.location.pathname)
			}
		}

		const fetchActivities = async (showLoading = false) => {
			if (showLoading) setIsLoading(true)
			try {
				const res = await fetch('/api/activity')
				const data = await res.json()
				if (data.success) {
					setActivities(data.activities || [])
					setCurrentlyPlaying(data.currentlyPlaying || null)
				}
			} catch (err) {
				console.error('Error fetching activities:', err)
			} finally {
				if (showLoading) setIsLoading(false)
			}
		}

		fetchActivities(true)
		const interval = setInterval(() => fetchActivities(false), 5000)
		return () => clearInterval(interval)
	}, [])

	useEffect(() => {
		if (currentlyPlaying?.progressMs) {
			setLiveProgressMs(currentlyPlaying.progressMs)
		}
	}, [currentlyPlaying?.id, currentlyPlaying?.progressMs])

	useEffect(() => {
		if (!currentlyPlaying || !currentlyPlaying.isPlaying) return

		const progressInterval = setInterval(() => {
			setLiveProgressMs((prev) => {
				if (currentlyPlaying.durationMs && prev >= currentlyPlaying.durationMs) {
					return currentlyPlaying.durationMs
				}
				return prev + 1000
			})
		}, 1000)

		return () => clearInterval(progressInterval)
	}, [currentlyPlaying])

	const formatTime = (isoString: string) => {
		try {
			const date = new Date(isoString)
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		} catch {
			return ''
		}
	}

	const formatDateLabel = (isoString: string) => {
		try {
			const date = new Date(isoString)
			const today = new Date()
			const yesterday = new Date()
			yesterday.setDate(today.getDate() - 1)

			if (date.toDateString() === today.toDateString()) {
				return 'Today'
			} else if (date.toDateString() === yesterday.toDateString()) {
				return 'Yesterday'
			} else {
				return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
			}
		} catch {
			return 'Earlier'
		}
	}

	const groupActivitiesByDay = (items: any[]) => {
		const groups: { [key: string]: any[] } = {}
		items.forEach((item) => {
			const label = formatDateLabel(item.timestamp)
			if (!groups[label]) {
				groups[label] = []
			}
			groups[label].push(item)
		})
		return Object.keys(groups).map((dayLabel) => ({
			dayLabel,
			items: groups[dayLabel]
		}))
	}

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

				{activeTab === 'activity' && (
					<div className="space-y-6">
						<style dangerouslySetInnerHTML={{ __html: `
							@keyframes bounce-bar-1 { 0%, 100% { height: 4px; } 50% { height: 16px; } }
							@keyframes bounce-bar-2 { 0%, 100% { height: 12px; } 50% { height: 4px; } }
							@keyframes bounce-bar-3 { 0%, 100% { height: 6px; } 50% { height: 14px; } }
							@keyframes bounce-bar-4 { 0%, 100% { height: 14px; } 50% { height: 8px; } }
							.animate-music-bar-1 { animation: bounce-bar-1 1.0s ease-in-out infinite; }
							.animate-music-bar-2 { animation: bounce-bar-2 1.2s ease-in-out infinite; }
							.animate-music-bar-3 { animation: bounce-bar-3 0.8s ease-in-out infinite; }
							.animate-music-bar-4 { animation: bounce-bar-4 1.1s ease-in-out infinite; }
						`}} />

						<div className="mb-6">
							<h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Listening activity</h3>
							<p className="text-sm text-muted-foreground leading-relaxed mt-1">
								A live log of the music and tracks I am hearing across Spotify, Apple Music, and YouTube.
							</p>
						</div>

						{/* Success/Error Alerts */}
						{spotifyStatus === 'success' && (
							<div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 text-sm">
								<div className="flex items-center gap-2">
									<div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
									<span>Spotify account connected successfully! Real-time history is active.</span>
								</div>
								<button onClick={() => setSpotifyStatus(null)} className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-100 font-bold px-2">×</button>
							</div>
						)}
						{spotifyStatus === 'error' && (
							<div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-300 flex items-center justify-between gap-3 text-sm">
								<div className="flex items-center gap-2">
									<div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
									<span>Failed to connect Spotify. Please try again.</span>
								</div>
								<button onClick={() => setSpotifyStatus(null)} className="text-red-500 hover:text-red-700 dark:hover:text-red-100 font-bold px-2">×</button>
							</div>
						)}

						{/* Currently Playing Track */}
						{currentlyPlaying && (
							<a
								href={currentlyPlaying.songUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="block relative overflow-hidden p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50 dark:from-slate-900 dark:via-slate-950/40 dark:to-slate-900/60 shadow-md hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col sm:flex-row items-center gap-5 cursor-pointer group"
							>
								<div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
								
								<div className="relative w-24 h-24 flex-shrink-0">
									<img
										src={currentlyPlaying.artworkUrl}
										alt={currentlyPlaying.album}
										className="w-full h-full object-cover rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 group-hover:scale-105 transition-all duration-300"
									/>
									<div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
										<div className="p-2 rounded-full bg-emerald-500 text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
											<svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.744-.47-.077-.337.135-.668.47-.745 3.856-.88 7.15-.506 9.822 1.13.295.178.387.563.205.86zm1.224-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.183-.412.125-.845-.107-.97-.52-.124-.412.108-.846.52-.97 3.668-1.112 8.248-.567 11.374 1.354.366.226.486.707.226 1.074zm.107-2.846C14.403 8.8 8.442 8.6 4.992 9.65c-.53.16-1.09-.14-1.25-.67-.16-.53.14-1.09.67-1.25 3.96-1.202 10.55-.974 14.61 1.44.477.284.63.9.347 1.378-.283.477-.9.63-1.377.347z"/></svg>
										</div>
									</div>
								</div>

								<div className="flex-grow space-y-1 text-center sm:text-left min-w-0 w-full">
									<div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
										<div className="flex items-end gap-[3px] h-3 w-4">
											<span className="w-[2.5px] bg-emerald-500 rounded-full animate-music-bar-1 h-3" />
											<span className="w-[2.5px] bg-emerald-500 rounded-full animate-music-bar-2 h-1.5" />
											<span className="w-[2.5px] bg-emerald-500 rounded-full animate-music-bar-3 h-2" />
											<span className="w-[2.5px] bg-emerald-500 rounded-full animate-music-bar-4 h-1" />
										</div>
										<span>Now Playing</span>
									</div>
									<h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100 group-hover:underline truncate">
										{currentlyPlaying.song}
									</h4>
									<p className="text-xs font-semibold text-slate-600 dark:text-slate-350 truncate">
										by {currentlyPlaying.artist}
									</p>
									<p className="text-[10px] text-muted-foreground italic truncate">
										Album: {currentlyPlaying.album}
									</p>

									{/* Progress bar & Timer */}
									{currentlyPlaying.durationMs && (
										<div className="space-y-1.5 pt-1.5 max-w-md">
											<div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground select-none">
												<span>{formatDuration(liveProgressMs)}</span>
												<span>{formatDuration(currentlyPlaying.durationMs)}</span>
											</div>
											<div className="h-1.5 w-full bg-slate-200/50 dark:bg-slate-850/80 rounded-full overflow-hidden">
												<div 
													className="h-full bg-emerald-500 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-linear"
													style={{ width: `${Math.min(100, (liveProgressMs / currentlyPlaying.durationMs) * 100)}%` }}
												/>
											</div>
										</div>
									)}

									{/* Action buttons (Listen Along & Play Preview) */}
									<div className="flex flex-wrap gap-2 pt-2.5">
										<button
											onClick={(e) => {
												e.preventDefault()
												e.stopPropagation()
												const trackId = currentlyPlaying.songUrl.split('/track/')[1]?.split('?')[0]
												if (trackId) {
													window.open(`spotify:track:${trackId}`, '_blank')
												} else {
													window.open(currentlyPlaying.songUrl, '_blank')
												}
											}}
											className="px-3.5 py-1.5 text-[10px] font-bold rounded-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all duration-200 flex items-center gap-1 cursor-pointer select-none"
										>
											<span>🎧</span> Listen Along
										</button>

										{currentlyPlaying.previewUrl && (
											<button
												onClick={(e) => togglePreview(currentlyPlaying.id, currentlyPlaying.previewUrl, e)}
												className={cn(
													"px-3.5 py-1.5 text-[10px] font-bold rounded-full border transition-all duration-200 flex items-center gap-1 cursor-pointer select-none",
													activePreviewId === currentlyPlaying.id
														? "border-emerald-500 bg-emerald-500/10 text-emerald-550"
														: "border-slate-300 dark:border-slate-800 hover:border-emerald-500 hover:text-emerald-500 text-slate-650 dark:text-slate-400"
												)}
											>
												{activePreviewId === currentlyPlaying.id ? (
													<><span>⏸</span> Pause Preview</>
												) : (
													<><span>▶</span> Play Preview</>
												)}
											</button>
										)}
									</div>
								</div>

							</a>
						)}


						{/* Promo block to connect Spotify if no currently playing is found */}
						{!isLoading && !currentlyPlaying && activities.filter(a => a.source === 'spotify').length === 0 && (
							<div className="relative overflow-hidden p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50 dark:from-slate-900 dark:via-slate-950/40 dark:to-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
								<div className="space-y-1 text-center sm:text-left">
									<h4 className="font-bold text-sm text-slate-850 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-2">
										<SpotifyIcon /> Connect Spotify account
									</h4>
									<p className="text-xs text-muted-foreground leading-relaxed max-w-md">
										Link your account to display what you are listening to in real-time, side by side with your Apple Music and YouTube entries!
									</p>
								</div>
								<a
									href="/api/activity/auth"
									className="px-4 py-2 text-xs font-semibold rounded-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap self-stretch sm:self-auto justify-center"
								>
									<SpotifyIcon /> Connect Spotify
								</a>
							</div>
						)}

						{/* Loading skeleton */}
						{isLoading ? (
							<div className="space-y-6">
								{Array.from({ length: 3 }).map((_, i) => (
									<div key={i} className="space-y-3">
										<div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
										<div className="space-y-2">
											{Array.from({ length: 2 }).map((_, j) => (
												<div key={j} className="h-16 bg-slate-100/60 dark:bg-slate-900/30 rounded-xl animate-pulse" />
											))}
										</div>
									</div>
								))}
							</div>
						) : activities.length > 0 ? (
							<div className="space-y-6">
								{groupActivitiesByDay(activities).map((group) => (
									<div key={group.dayLabel} className="space-y-3">
										<h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
											{group.dayLabel}
										</h4>
										<div className="space-y-2">
											{group.items.map((item) => (
												<a
													key={item.id}
													href={item.songUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="group flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-100/50 dark:hover:bg-slate-950/30 border border-slate-100 dark:border-slate-900/40 hover:border-slate-200/50 dark:hover:border-slate-800/50 transition-all duration-200 active:scale-[0.99] min-w-0"
												>
													<div className="flex items-center gap-3 min-w-0 mr-4">
														<img
															src={item.artworkUrl}
															alt={item.album}
															className="w-10 h-10 object-cover rounded-lg shadow-sm border border-slate-200/40 dark:border-slate-800/40 flex-shrink-0"
														/>
														<div className="min-w-0">
															<h5 className="font-semibold text-xs text-slate-850 dark:text-slate-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors truncate">
																{item.song}
															</h5>
															<p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
																{item.artist} — <span className="italic">{item.album}</span>
															</p>
														</div>
													</div>
													
													<div className="flex items-center gap-2.5 flex-shrink-0">
														{item.previewUrl && (
															<button
																onClick={(e) => togglePreview(item.id, item.previewUrl, e)}
																className={cn(
																	"p-1.5 rounded-lg border flex items-center justify-center transition-all duration-200 cursor-pointer",
																	activePreviewId === item.id
																		? "bg-emerald-500/10 border-emerald-500/30 text-emerald-550 scale-105"
																		: "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-550 hover:border-emerald-500 hover:text-emerald-500 dark:hover:border-emerald-500/50"
																)}
																title={activePreviewId === item.id ? "Pause Preview" : "Play Preview"}
															>
																{activePreviewId === item.id ? (
																	<span className="text-[10px] font-bold">⏸</span>
																) : (
																	<span className="text-[10px] font-bold">▶</span>
																)}
															</button>
														)}

														<span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
															{formatTime(item.timestamp)}
														</span>
														<span className={cn(
															"p-1.5 rounded-lg border flex items-center justify-center",
															item.platform === 'spotify' && "bg-emerald-500/5 border-emerald-500/10 text-emerald-500",
															item.platform === 'apple-music' && "bg-pink-500/5 border-pink-500/10 text-pink-500",
															item.platform === 'youtube' && "bg-red-500/5 border-red-500/10 text-red-500"
														)}>
															{item.platform === 'spotify' && <SpotifyIcon />}
															{item.platform === 'apple-music' && <AppleMusicIcon />}
															{item.platform === 'youtube' && <YouTubeIcon />}
														</span>
													</div>
												</a>
											))}
										</div>
									</div>
								))}
							</div>
						) : (
							<p className="text-xs text-muted-foreground">No recent music activities found.</p>
						)}
					</div>
				)}
			</motion.div>
		</div>
	)
}
