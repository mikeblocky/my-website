import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { SectionPageShell } from '@/components/layout/page-shell/SectionPageShell'
import { LoadingSurface } from '@/components/ui/loading/LoadingSurface'
import { getZines } from './_data/zines'

const ZineLibrary = dynamic(
	() => import('./_components/ZineLibrary').then((mod) => mod.ZineLibrary),
	{ loading: () => <LoadingSurface label="Loading zines..." /> }
)

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
