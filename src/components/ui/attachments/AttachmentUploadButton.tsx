'use client'

import type { ChangeEvent, ReactNode } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils/utils'

type AttachmentAccent = 'blue' | 'violet' | 'teal' | 'emerald'

interface AttachmentUploadButtonProps {
	onFiles: (files: File[]) => void
	children?: ReactNode
	iconSize?: number
	className?: string
	accent?: AttachmentAccent
}

const accentClasses: Record<AttachmentAccent, string> = {
	blue: 'hover:text-blue-500',
	violet: 'hover:text-violet-500',
	teal: 'hover:text-teal-600 dark:hover:text-teal-300',
	emerald: 'hover:text-emerald-500',
}

export function AttachmentUploadButton({
	onFiles,
	children = 'Attach images',
	iconSize = 12,
	className,
	accent = 'blue',
}: AttachmentUploadButtonProps) {
	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		const files = event.target.files
		if (files) {
			onFiles(Array.from(files))
		}
		event.target.value = ''
	}

	return (
		<label
			className={cn(
				'flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-500 transition-colors select-none',
				accentClasses[accent],
				className
			)}
		>
			<input
				type="file"
				accept="image/*"
				multiple
				onChange={handleChange}
				className="hidden"
			/>
			<ImageIcon size={iconSize} />
			{children}
		</label>
	)
}
