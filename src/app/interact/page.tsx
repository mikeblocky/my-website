import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SectionPageShell } from '@/components/layout/page-shell/SectionPageShell'
import { InteractClient } from './_components/InteractClient'

export const metadata: Metadata = {
	title: 'Interact | mikeblocky.com',
	description: 'A space to connect: send messages, draw something in the sketchbook, suggest books or music, or leave drawing prompts.'
}

// Cache-buster comment to force a fresh chunk hash and bypass stale local browser caches on other devices
export default function InteractPage() {
	return (
		<SectionPageShell
			title="Interact"
			description="A space to send messages, draw something in the sketchbook, suggest books or music, or leave drawing prompts."
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
