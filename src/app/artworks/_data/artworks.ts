import fs from 'fs'
import path from 'path'
import { imageSize } from 'image-size'

export type ArtworkItem = {
	src: string
	isPortrait: boolean
}

export type ArtworkSectionConfig = {
	title: string
	folder: string
}

export const artworkSectionsConfig: ArtworkSectionConfig[] = [
	{ title: 'Kemutai Hanashi', folder: 'kemutai-hanashi' },
	{ title: 'Skip and Loafer', folder: 'skip-and-loafer' }
]

export function getArtworkItems(folder: string): ArtworkItem[] {
	const folderPath = path.join(process.cwd(), 'public', 'artworks', folder)

	if (!fs.existsSync(folderPath)) {
		return []
	}

	const fileNames = fs
		.readdirSync(folderPath)
		.filter((fileName) => /\.(png|jpe?g|webp|avif)$/i.test(fileName))
		.sort((a, b) => a.localeCompare(b, 'ja', { numeric: true }))

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

export function getArtworkSections() {
	return artworkSectionsConfig.map((section) => ({
		title: section.title,
		items: getArtworkItems(section.folder)
	}))
}
