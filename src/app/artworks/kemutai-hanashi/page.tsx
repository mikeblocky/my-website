import type { Metadata } from 'next'
import { getArtworkItems } from '../_data/artworks'
import { KemutaiHanashiClient } from './_components/KemutaiHanashiClient'

export const metadata: Metadata = {
	title: 'Kemutai Hanashi Gallery | mikeblocky.com',
	description:
		'A special Kemutai Hanashi image gallery shaped by shoreline light, cigarette haze, and quiet ink sketches.'
}

export default function KemutaiHanashiGalleryPage() {
	const items = getArtworkItems('kemutai-hanashi')
	return <KemutaiHanashiClient items={items} />
}
