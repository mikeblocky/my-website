import Image from 'next/image'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { cn } from '@/lib/utils/utils'
import { sansFont } from '@/styles/fonts/fonts'
import type { Friend } from '../_data/friends'

interface FriendCardProps {
	friend: Friend
	tag: string
}

export function FriendCard({ friend, tag }: FriendCardProps) {
	return (
		<div className="group rounded-xl bg-slate-50 p-5 shadow-none transition-colors duration-150 hover:bg-slate-100/70 dark:bg-slate-900/60 dark:hover:bg-slate-900/80">
			<div className="flex flex-col items-start gap-4 md:flex-row">
				<div className="relative shrink-0 self-center md:self-start">
					<div className="relative h-16 w-16 overflow-hidden rounded-lg bg-slate-200/50 dark:bg-slate-800">
						<Image
							src={`https://unavatar.io/twitter/${friend.username}`}
							alt={friend.username}
							fill
							className="object-cover"
							unoptimized
						/>
					</div>
				</div>

				<StackVertical gap="xs" className="flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<span className={cn(sansFont.className, 'rounded-md border border-blue-200/50 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800/40 dark:bg-blue-950/40 dark:text-blue-300')}>
							@{friend.username}
						</span>
						<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{tag}</span>
					</div>

					<p className={cn(sansFont.className, 'text-sm leading-relaxed text-slate-700 dark:text-slate-300')}>
						&quot;{friend.description}&quot;
					</p>

					<div className="pt-1">
						<a
							href={`https://twitter.com/${friend.username}`}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
						>
							View profile
						</a>
					</div>
				</StackVertical>
			</div>
		</div>
	)
}
