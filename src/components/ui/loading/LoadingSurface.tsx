import { cn } from '@/lib/utils/utils'

interface LoadingSurfaceProps {
	label?: string
	className?: string
}

export function LoadingSurface({ label = 'Loading...', className }: LoadingSurfaceProps) {
	return (
		<div
			className={cn(
				'rounded-md border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 p-6 text-center text-sm text-muted-foreground',
				'animate-in fade-in-0 zoom-in-95 duration-200',
				className
			)}
		>
			<div className="mx-auto mb-3 h-1.5 w-24 overflow-hidden rounded-sm bg-slate-200 dark:bg-slate-800">
				<div className="pride-gradient-line h-full w-1/2 rounded-sm motion-safe:animate-pulse" />
			</div>
			{label}
		</div>
	)
}
