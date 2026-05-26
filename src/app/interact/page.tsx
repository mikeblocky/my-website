import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SectionPageShell } from '@/components/layout/page-shell/SectionPageShell'
import { InteractClient } from './_components/InteractClient'

export const metadata: Metadata = {
	title: 'Interact | mikeblocky.com',
	description: 'Connect with me: leave a message in the guestbook, suggest drawing prompts, or view my social circle.'
}

export default function InteractPage() {
	return (
		<SectionPageShell
			title="Interact"
			description="A place to connect and interact: share recommendations, leave suggestions, ask questions."
			currentLabel="Interact"
		>
			<Suspense fallback={
				<div className="py-8 text-center text-sm text-muted-foreground">
					Loading boards...
				</div>
			}>
				<InteractClient />
			</Suspense>
		</SectionPageShell>
	)
}
