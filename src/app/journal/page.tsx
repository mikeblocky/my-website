import type { Metadata } from 'next'
import { SectionPageShell } from '@/components/layout/page-shell/SectionPageShell'
import { getSearchablePosts } from '@/lib/blog/search'
import { JournalClient } from './_components/JournalClient'


export const metadata: Metadata = {
	title: 'Journal | mikeblocky.com',
	description: 'Explore my essays, daily gratitude logs, and stationery setups.'
}

export default async function JournalPage() {
	const searchablePosts = getSearchablePosts()

	return (
		<SectionPageShell
			title="Journal"
			description="A collection of my thoughts: long-form essays, tech reflections, and daily journal pages."
			currentLabel="Journal"
		>
			<JournalClient posts={searchablePosts} />
		</SectionPageShell>
	)
}
