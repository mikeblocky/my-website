import type { Metadata } from 'next'
import BaseContainer from '@/components/layout/container/base-container'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { DynamicBreadcrumb } from '@/components/ui/primitives/breadcrumb'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { ThemeToggle } from '@/components/ui/theme/theme-toggle'
import { SectionFooter } from '@/components/layout/footer/SectionFooter'
import { ArtworksGallery } from './_components/ArtworksGallery'
import fs from 'fs'
import path from 'path'
import { imageSize } from 'image-size'

export const metadata: Metadata = {
	title: 'Artworks | mikeblocky.com',
	description: 'A small gallery of my artworks.'
}

type ArtworkItem = {
	src: string
	isPortrait: boolean
}

const sectionsConfig = [
	{ title: 'Kemutai Hanashi', folder: 'kemutai-hanashi' },
	{ title: 'Skip and Loafer', folder: 'skip-and-loafer' }
]

function getArtworkItems(folder: string): ArtworkItem[] {
	const folderPath = path.join(process.cwd(), 'public', 'artworks', folder)

	if (!fs.existsSync(folderPath)) {
		return []
	}

	const fileNames = fs
		.readdirSync(folderPath)
		.filter((fileName) => /\.(png|jpe?g|webp|avif)$/i.test(fileName))
		.sort((a, b) => a.localeCompare(b, 'ja'))

	const items = fileNames.map((fileName) => {
		const absolutePath = path.join(folderPath, fileName)
		const buffer = fs.readFileSync(absolutePath)
		const dimensions = imageSize(buffer)
		const isPortrait = (dimensions.height ?? 0) > (dimensions.width ?? 0)
		const encodedFileName = encodeURIComponent(fileName)

		return {
			src: `/artworks/${folder}/${encodedFileName}`,
			isPortrait
		}
	})

	const portraits = items.filter((item) => item.isPortrait)
	const landscapes = items.filter((item) => !item.isPortrait)

	return [...portraits, ...landscapes]
}

function getSections() {
	return sectionsConfig.map((section) => ({
		title: section.title,
		items: getArtworkItems(section.folder)
	}))
}

export default function ArtworksPage() {
	const sections = getSections()

	return (
		<BaseContainer size="lg" paddingX="md" paddingY="lg">
			<StackVertical gap="lg">
				<div className="flex items-center justify-between">
					<DynamicBreadcrumb
						items={[
							{ href: '/', label: 'Home', emoji: '👾' },
							{ label: 'Artworks' }
						]}
					/>
					<ThemeToggle />
				</div>

				<div>
					<TextHeading as="h1" weight="bold">
						Artworks
					</TextHeading>
					<Text variant="muted" size="sm" className="mt-2">
						A gallery of my drawings and illustrations.
					</Text>
				</div>

				<ArtworksGallery sections={sections} />
			</StackVertical>

			<SectionFooter showToTop={false} />
		</BaseContainer>
	)
}
