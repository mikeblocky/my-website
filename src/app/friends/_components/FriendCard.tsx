import Image from 'next/image'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { cn } from '@/lib/utils/utils'
import { monoFont, sansFont } from '@/styles/fonts/fonts'
import type { Friend } from '../_data/friends'

interface FriendCardProps {
	friend: Friend
	tag: string
}

export function FriendCard({ friend, tag }: FriendCardProps) {
	return (
		<div className="group rounded-md border border-slate-200/60 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-900/30 p-5 hover:bg-slate-100/40 dark:hover:bg-slate-900/50 transition-colors duration-150 shadow-none">
			<div className="flex flex-col items-start gap-4 md:flex-row">
				<div className="relative shrink-0 self-center md:self-start">
					<div className="relative h-16 w-16 overflow-hidden rounded-md bg-slate-200/50 dark:bg-slate-800">
						<Image
							src={`https://unavatar.io/twitter/${friend.username}`}
							alt={friend.username}
							fill
							className="object-cover"
						/>
					</div>
				</div>

				<StackVertical gap="xs" className="flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<span className={cn(monoFont.className, 'text-xs text-slate-700 dark:text-slate-300')}>
							@{friend.username.toLowerCase()}
						</span>
						<span className={cn(monoFont.className, "text-[10px] tracking-wider pride-text")}>
							{tag.toLowerCase()}
						</span>
					</div>

					<p className={cn(sansFont.className, 'text-sm leading-relaxed text-slate-700 dark:text-slate-300')}>
						&quot;{friend.description}&quot;
					</p>

					<div className="pt-1">
						<a
							href={`https://twitter.com/${friend.username}`}
							target="_blank"
							rel="noopener noreferrer"
							className={cn(monoFont.className, 'inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:pride-text transition-colors duration-150')}
						>
							view profile →
						</a>
					</div>
				</StackVertical>
			</div>
		</div>
	)
}

