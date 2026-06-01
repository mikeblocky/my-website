import type { Metadata } from 'next'
import { SectionPageShell } from '@/components/layout/page-shell/SectionPageShell'
import { getZines } from './_data/zines'
import { ZineLibrary } from './_components/ZineLibrary'

export const metadata: Metadata = {
	title: 'Zine | mikeblocky.com',
	description: 'Collected works presented as small page-turning books.'
}

export default function ZinePage() {
	const zines = getZines()

	return (
		<SectionPageShell
			title="Zine"
			description="Collected works arranged as handmade books."
			currentLabel="Zine"
			containerSize="3xl"
			footerColor="pink"
		>
			<ZineLibrary zines={zines} />
		</SectionPageShell>
	)
}
