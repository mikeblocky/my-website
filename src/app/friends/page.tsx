import type { Metadata } from 'next'
import { SectionPageShell } from '@/components/layout/page-shell/SectionPageShell'
import { FriendsClient } from './_components/FriendsClient'

export const metadata: Metadata = {
	title: 'Friends | mikeblocky.com',
	description: 'A page dedicated to wonderful friends, artists, and creators I have met online.'
}

export default function FriendsListPage() {
	return (
		<SectionPageShell
			title="Friends"
			description="A page dedicated to wonderful friends, artists, and creators I have met online."
			currentLabel="Friends"
		>
			<FriendsClient />
		</SectionPageShell>
	)
}
