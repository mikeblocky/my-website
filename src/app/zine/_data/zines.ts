import fs from 'fs'
import path from 'path'
import { imageSize } from 'image-size'

export type ZinePage = {
	src: string
	width: number
	height: number
	alt: string
}

export type ZineOrientation = 'vertical' | 'horizontal'

export type Zine = {
	slug: string
	title: string
	subtitle: string
	year: string
	description: string
	folder: string
	orientation: ZineOrientation
	parentTitle: string
	pages: ZinePage[]
}

const zineConfigs = [
	{
		slug: 'kemutai-hanashi',
		title: 'Kemutai Hanashi',
		subtitle: 'A collected book of drawings, studies, and small scenes',
		year: '2026',
		description:
			'A first zine collecting the Kemutai Hanashi works into a page-turning book.',
		folder: 'kemutai-hanashi'
	},
	{
		slug: 'skip-and-loafer',
		title: 'Skip and Loafer',
		subtitle: 'A collected book of drawings, motion stills, and color studies',
		year: '2026',
		description:
			'A zine collecting the Skip and Loafer works into a separate page-turning book.',
		folder: 'skip-and-loafer'
	}
]

function getZinePages(folder: string, title: string): ZinePage[] {
	const folderPath = path.join(process.cwd(), 'public', 'artworks', folder)

	if (!fs.existsSync(folderPath)) {
		return []
	}

	const fileNames = fs
		.readdirSync(folderPath)
		.filter((fileName) => /\.(png|jpe?g|webp|avif|gif)$/i.test(fileName))
		.sort((a, b) => a.localeCompare(b, 'ja', { numeric: true }))

	return fileNames.map((fileName, index) => {
		const absolutePath = path.join(folderPath, fileName)
		const buffer = fs.readFileSync(absolutePath)
		const dimensions = imageSize(buffer)
		const encodedFileName = encodeURIComponent(fileName)

		return {
			src: `/artworks/${folder}/${encodedFileName}`,
			width: dimensions.width ?? 1200,
			height: dimensions.height ?? 1600,
			alt: `${title} zine page ${index + 1}`
		}
	})
}

export function getZines(): Zine[] {
	return zineConfigs.map((zine) => {
		const pages = getZinePages(zine.folder, zine.title)
		const verticalCount = pages.filter((page) => page.height >= page.width).length
		const horizontalCount = pages.length - verticalCount
		const orientation = verticalCount >= horizontalCount ? ('vertical' as const) : ('horizontal' as const)

		return {
			...zine,
			parentTitle: zine.title,
			orientation,
			pages
		}
	}).filter((zine) => zine.pages.length > 0)
}
