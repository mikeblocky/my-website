import type { Metadata } from 'next'
import { getArtworkSections } from './_data/artworks'
import { getDrawingStats } from '@/lib/stats/drawing-stats'
import { SectionPageShell } from '@/components/layout/page-shell/SectionPageShell'
import { GalleryClient } from './_components/GalleryClient'

export const metadata: Metadata = {
	title: 'Gallery | mikeblocky.com',
	description: 'A small gallery of my artworks and their statistical themes breakdown.'
}

export default async function ArtworksPage() {
	const sections = getArtworkSections()
	const statsData = getDrawingStats()

	return (
		<SectionPageShell
			title="Gallery"
			description="A gallery of my drawings and illustrations, alongside theme distributions."
			currentLabel="Gallery"
			containerSize="lg"
		>
			<GalleryClient sections={sections} statsData={statsData} />
		</SectionPageShell>
	)
}
