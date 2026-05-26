import { cn } from '@/lib/utils/utils'

interface LoadingSurfaceProps {
	label?: string
	className?: string
}

export function LoadingSurface({ label = 'Loading...', className }: LoadingSurfaceProps) {
	return (
		<div
			className={cn(
				'rounded-2xl border border-slate-200/70 bg-slate-50/70 p-6 text-center text-sm text-muted-foreground dark:border-slate-800/70 dark:bg-slate-900/50',
				'animate-in fade-in-0 zoom-in-95 duration-200',
				className
			)}
		>
			<div className="mx-auto mb-3 h-1.5 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
				<div className="h-full w-1/2 rounded-full bg-blue-500/70 motion-safe:animate-pulse" />
			</div>
			{label}
		</div>
	)
}
