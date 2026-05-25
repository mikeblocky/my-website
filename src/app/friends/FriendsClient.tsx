'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/utils'
import { developedFriends, buddingFriends, growingFriends, upcomingFriends, type Friend } from './_data/friends'
import Image from 'next/image'
import { sansFont } from '@/styles/fonts/fonts'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'

type FriendTab = 'developed' | 'budding' | 'growing' | 'upcoming'

function FriendCard({ friend, tag }: { friend: Friend; tag: string }) {
	return (
		<div className="group rounded-xl bg-slate-50 dark:bg-slate-900/60 p-5 transition-colors duration-150 hover:bg-slate-100/70 dark:hover:bg-slate-900/80 shadow-none">
			<div className="flex flex-col items-start gap-4 md:flex-row">
				<div className="relative shrink-0 self-center md:self-start">
					<div className="relative h-16 w-16 overflow-hidden rounded-lg bg-slate-200/50 dark:bg-slate-800 border-0">
						<Image 
							src={`https://unavatar.io/twitter/${friend.username}`}
							alt={friend.username}
							fill
							className="object-cover"
							unoptimized
						/>
					</div>
				</div>
				
				<StackVertical gap="xs" className="flex-1">
					<div className="flex items-center gap-2 flex-wrap">
						<span className={cn(sansFont.className, "rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40")}>
							@{friend.username}
						</span>
						<span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">{tag}</span>
					</div>
					
					<p className={cn(sansFont.className, "text-sm leading-relaxed text-slate-700 dark:text-slate-300")}>
						"{friend.description}"
					</p>
					
					<div className="pt-1">
						<a 
							href={`https://twitter.com/${friend.username}`}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
						>
							View profile →
						</a>
					</div>
				</StackVertical>
			</div>
		</div>
	)
}

export function FriendsClient() {
	const [activeFriendTab, setActiveFriendTab] = useState<FriendTab>('developed')

	const friendTabs = [
		{ id: 'developed', label: 'Mutuals & close friends', count: developedFriends.length },
		{ id: 'budding', label: 'Budding connections', count: buddingFriends.length },
		{ id: 'growing', label: 'Growing bonds', count: growingFriends.length },
		{ id: 'upcoming', label: 'Future plans to connect', count: upcomingFriends.length }
	]

	return (
		<div className="space-y-6">
			{/* Sub-tabs for Friend Groups - borderless categories pill styles */}
			<div className="flex flex-wrap gap-2 pb-4">
				{friendTabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveFriendTab(tab.id as FriendTab)}
						className={cn(
							"flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none",
							activeFriendTab === tab.id
								? "border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-500/20"
								: "border-slate-300 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-300"
						)}
					>
						<span>{tab.label}</span>
						<span className={cn(
							"rounded-full px-2 py-0.5 text-xs font-bold",
							activeFriendTab === tab.id 
								? "bg-white/20 text-white" 
								: "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
						)}>
							{tab.count}
						</span>
					</button>
				))}
			</div>

			<div className="grid grid-cols-1 gap-4">
				{activeFriendTab === 'developed' ? (
					developedFriends.map((friend) => (
						<FriendCard key={friend.username} friend={friend} tag="Mutual" />
					))
				) : activeFriendTab === 'budding' ? (
					buddingFriends.map((friend) => (
						<FriendCard key={friend.username} friend={friend} tag="Budding" />
					))
				) : activeFriendTab === 'growing' ? (
					growingFriends.map((friend) => (
						<FriendCard key={friend.username} friend={friend} tag="Growing" />
					))
				) : (
					upcomingFriends.map((friend) => (
						<FriendCard key={friend.username} friend={friend} tag="Upcoming" />
					))
				)}
			</div>
		</div>
	)
}
