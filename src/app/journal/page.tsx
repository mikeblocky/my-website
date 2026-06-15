import type { Metadata } from 'next'
import { SectionPageShell } from '@/components/layout/page-shell/SectionPageShell'
import { getSearchablePosts } from '@/lib/blog/search'
import { JournalClient } from './_components/JournalClient'


export const metadata: Metadata = {
	title: 'Journal | mikeblocky.com',
	description: "A personal collection of articles, notes, and logs that I write over time."
}

export default async function JournalPage() {
	const searchablePosts = getSearchablePosts()

	return (
		<SectionPageShell
			title="Journal"
			description="A personal collection of articles, notes, and logs that I write over time."
			currentLabel="Journal"
		>
			<JournalClient posts={searchablePosts} />
		</SectionPageShell>
	)
}
