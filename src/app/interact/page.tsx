import type { Metadata } from 'next'
import { Suspense } from 'react'
import BaseContainer from '@/components/layout/container/base-container'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { SectionFooter } from '@/components/layout/footer/SectionFooter'
import { SectionPageHeader } from '@/components/layout/page-header/SectionPageHeader'
import { InteractClient } from './_components/InteractClient'

export const metadata: Metadata = {
	title: 'Interact | mikeblocky.com',
	description: 'Connect with me: leave a message in the guestbook, suggest drawing prompts, or view my social circle.'
}

export default function InteractPage() {
	return (
		<BaseContainer size="md" paddingX="md" paddingY="lg">
			<StackVertical gap="lg">
				<SectionPageHeader
					title="Interact"
					description="A place to connect and interact: share recommendations, leave suggestions, ask questions."
					currentLabel="Interact"
				/>

				<Suspense fallback={
					<div className="py-8 text-center text-sm text-muted-foreground">
						Loading boards...
					</div>
				}>
					<InteractClient />
				</Suspense>
			</StackVertical>

			<SectionFooter showToTop={false} />
		</BaseContainer>
	)
}
