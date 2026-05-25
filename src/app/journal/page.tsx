import type { Metadata } from 'next'
import BaseContainer from '@/components/layout/container/base-container'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { SectionFooter } from '@/components/layout/footer/SectionFooter'
import { SectionPageHeader } from '@/components/layout/page-header/SectionPageHeader'
import { getSearchablePosts } from '@/app/blog/page'
import { JournalClient } from './_components/JournalClient'

export const metadata: Metadata = {
	title: 'Journal | mikeblocky.com',
	description: 'Explore my essays, daily gratitude logs, and stationery setups.'
}

export default async function JournalPage() {
	const searchablePosts = getSearchablePosts()

	return (
		<BaseContainer size="md" paddingX="md" paddingY="lg">
			<StackVertical gap="lg">
				<SectionPageHeader
					title="Journal"
					description="A collection of my thoughts: long-form essays, tech reflections, and daily journal pages."
					currentLabel="Journal"
				/>

				<JournalClient posts={searchablePosts} />
			</StackVertical>

			<SectionFooter showToTop={false} />
		</BaseContainer>
	)
}
