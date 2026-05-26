'use client'

import { useMemo, useState } from 'react'
import { PillTabs } from '@/components/ui/tabs/PillTabs'
import { buddingFriends, developedFriends, growingFriends, upcomingFriends } from '../_data/friends'
import { FriendCard } from './FriendCard'

export type FriendTab = 'developed' | 'budding' | 'growing' | 'upcoming'

const friendGroups = {
	developed: {
		label: 'Mutuals & close friends',
		tag: 'Mutual',
		friends: developedFriends,
	},
	budding: {
		label: 'Budding connections',
		tag: 'Budding',
		friends: buddingFriends,
	},
	growing: {
		label: 'Growing bonds',
		tag: 'Growing',
		friends: growingFriends,
	},
	upcoming: {
		label: 'Future plans to connect',
		tag: 'Upcoming',
		friends: upcomingFriends,
	},
} satisfies Record<FriendTab, { label: string; tag: string; friends: typeof developedFriends }>

export function FriendsClient() {
	const [activeFriendTab, setActiveFriendTab] = useState<FriendTab>('developed')
	const activeGroup = friendGroups[activeFriendTab]
	const friendTabs = useMemo(() => (
		Object.entries(friendGroups).map(([id, group]) => ({
			id: id as FriendTab,
			label: group.label,
			count: group.friends.length,
		}))
	), [])

	return (
		<div className="space-y-6">
			<PillTabs
				tabs={friendTabs}
				activeTab={activeFriendTab}
				onTabChange={setActiveFriendTab}
				className="pb-4"
			/>

			<div className="grid grid-cols-1 gap-4">
				{activeGroup.friends.map((friend) => (
					<FriendCard key={friend.username} friend={friend} tag={activeGroup.tag} />
				))}
			</div>
		</div>
	)
}
