import Image from 'next/image'
import { cn } from '@/lib/utils/utils'
import type { Zine } from '../_data/zines'

interface BookPageProps {
	zine: Zine
	pageIndex: number
	side: 'left' | 'right'
	showFold?: boolean
}

export function BookPage({ zine, pageIndex, side, showFold = true }: BookPageProps) {
	const page = zine.pages[pageIndex]

	if (!page) {
		return (
			<div className="flex h-full items-center justify-center bg-white text-xs text-stone-300 dark:bg-zinc-950 dark:text-stone-700">
				Blank
			</div>
		)
	}

	return (
		<div className="relative h-full w-full overflow-hidden bg-white dark:bg-zinc-950">
			<Image
				src={page.src}
				alt={page.alt}
				fill
				sizes="(max-width: 768px) 86vw, 42vw"
				priority={pageIndex < 2}
				className="object-contain p-2 sm:p-3"
			/>
			{showFold && (
				<div
					className={cn(
						'pointer-events-none absolute inset-y-0 w-12',
						side === 'left'
							? 'right-0 bg-gradient-to-l from-black/10 to-transparent'
							: 'left-0 bg-gradient-to-r from-black/12 to-transparent'
					)}
				/>
			)}
		</div>
	)
}
