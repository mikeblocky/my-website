import type { Metadata } from 'next'
import BaseContainer from '@/components/layout/container/base-container'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { SectionFooter } from '@/components/layout/footer/SectionFooter'
import { getArtworkSections } from './_data/artworks'
import { getDrawingStats } from '@/lib/stats/drawing-stats'
import { SectionPageHeader } from '@/components/layout/page-header/SectionPageHeader'
import { GalleryClient } from './_components/GalleryClient'

export const metadata: Metadata = {
	title: 'Gallery | mikeblocky.com',
	description: 'A small gallery of my artworks and their statistical themes breakdown.'
}

export default async function ArtworksPage() {
	const sections = getArtworkSections()
	const statsData = getDrawingStats()

	return (
		<BaseContainer size="lg" paddingX="md" paddingY="lg">
			<StackVertical gap="lg">
				<SectionPageHeader
					title="Gallery"
					description="A gallery of my drawings and illustrations, alongside theme distributions."
					currentLabel="Gallery"
				/>

				<GalleryClient sections={sections} statsData={statsData} />
			</StackVertical>

			<SectionFooter showToTop={false} />
		</BaseContainer>
	)
}
