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
	return zineConfigs.flatMap((zine) => {
		const pages = getZinePages(zine.folder, zine.title)
		const verticalPages = pages.filter((page) => page.height >= page.width)
		const horizontalPages = pages.filter((page) => page.width > page.height)

		return [
			{
				...zine,
				slug: `${zine.slug}-vertical`,
				title: `${zine.title}: Vertical`,
				parentTitle: zine.title,
				orientation: 'vertical' as const,
				pages: verticalPages
			},
			{
				...zine,
				slug: `${zine.slug}-horizontal`,
				title: `${zine.title}: Horizontal`,
				parentTitle: zine.title,
				orientation: 'horizontal' as const,
				pages: horizontalPages
			}
		].filter((book) => book.pages.length > 0)
	})
}
