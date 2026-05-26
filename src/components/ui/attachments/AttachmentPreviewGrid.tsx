'use client'

import { X } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils/utils'

interface AttachmentPreviewGridProps {
	urls: string[]
	onRemove: (index: number) => void
	alt?: string
	className?: string
	compact?: boolean
}

export function AttachmentPreviewGrid({
	urls,
	onRemove,
	alt = 'Attachment thumbnail',
	className,
	compact = false,
}: AttachmentPreviewGridProps) {
	if (urls.length === 0) return null

	return (
		<div className={cn('flex flex-wrap gap-2.5', className)}>
			{urls.map((url, index) => (
				<div
					key={`${url}-${index}`}
					className={cn(
						'group/thumb relative overflow-hidden rounded-xl border border-gray-200/80 bg-gray-50/50 p-1 dark:border-gray-800/80 dark:bg-gray-900/50',
						'animate-in fade-in-0 zoom-in-95 duration-150',
						compact && 'rounded-lg p-0.5'
					)}
				>
					<Image
						src={url}
						alt={alt}
						width={96}
						height={64}
						unoptimized
						className={cn('h-16 w-24 rounded-lg object-cover', compact && 'rounded')}
					/>
					<button
						type="button"
						onClick={() => onRemove(index)}
						className="absolute right-1.5 top-1.5 rounded-full bg-rose-500 p-1 text-white shadow-md transition-colors hover:bg-rose-600"
						title="Remove image"
					>
						<X size={10} strokeWidth={3} />
					</button>
				</div>
			))}
		</div>
	)
}
