import type { Metadata } from 'next'
import { getArtworkSections } from './_data/artworks'
import { getDrawingStats } from '@/lib/stats/drawing-stats'
import { SectionPageShell } from '@/components/layout/page-shell/SectionPageShell'
import { GalleryClient } from './_components/GalleryClient'

export const metadata: Metadata = {
	title: 'Gallery | mikeblocky.com',
	description: 'A quiet gallery archiving my character illustrations, sketches, and drawings.'
}

export default async function ArtworksPage() {
	const sections = getArtworkSections()
	const statsData = getDrawingStats()

	return (
		<SectionPageShell
			title="Gallery"
			description="A personal archive of drawings, digital sketches, and character illustrations."
			currentLabel="Gallery"
			containerSize="lg"
		>
			<GalleryClient sections={sections} statsData={statsData} />
		</SectionPageShell>
	)
}
