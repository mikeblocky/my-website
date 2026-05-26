import type { Metadata } from 'next'
import { SectionPageShell } from '@/components/layout/page-shell/SectionPageShell'
import { FriendsClient } from './_components/FriendsClient'

export const metadata: Metadata = {
	title: 'Friends | mikeblocky.com',
	description: 'A directory of creators, mutual friends, and connections built along the way.'
}

export default function FriendsListPage() {
	return (
		<SectionPageShell
			title="Friends"
			description="A directory of wonderful people, creators, and mutual friends I've built connections with along the way."
			currentLabel="Friends"
		>
			<FriendsClient />
		</SectionPageShell>
	)
}
