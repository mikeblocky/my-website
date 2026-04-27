import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import BaseContainer from '@/components/layout/container/base-container'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { DynamicBreadcrumb } from '@/components/ui/primitives/breadcrumb'
import { Button } from '@/components/ui/primitives/button'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { ThemeToggle } from '@/components/ui/theme/theme-toggle'
import { SectionFooter } from '@/components/layout/footer/SectionFooter'
import { ArtworksGallery } from './_components/ArtworksGallery'
import { getArtworkSections } from './_data/artworks'

export const metadata: Metadata = {
	title: 'Artworks | mikeblocky.com',
	description: 'A small gallery of my artworks.'
}

export default function ArtworksPage() {
	const sections = getArtworkSections()

	return (
		<BaseContainer size="lg" paddingX="md" paddingY="lg">
			<StackVertical gap="lg">
				<div className="flex items-center justify-between">
					<DynamicBreadcrumb
						items={[
							{ href: '/', label: 'Home', emoji: '🐶' },
							{ label: 'Artworks' }
						]}
					/>
					<ThemeToggle />
				</div>

				<div>
					<TextHeading as="h1" weight="bold">
						Artworks
					</TextHeading>
					<Text variant="muted" size="sm" className="mt-2">
						A gallery of my drawings and illustrations.
					</Text>
				</div>

				{/* Temporarily hidden 
				<div className="overflow-hidden rounded-[2rem] border border-sky-200/60 bg-[linear-gradient(135deg,rgba(14,116,144,0.96),rgba(15,23,42,0.94)_55%,rgba(245,158,11,0.68))] px-6 py-6 text-white shadow-[0_24px_80px_-40px_rgba(8,47,73,0.95)]">
					<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
						<div className="max-w-2xl">
							<p className="font-mono text-xs uppercase tracking-[0.32em] text-sky-100/70">
								Special Gallery
							</p>
							<TextHeading as="h2" weight="bold" className="mt-3 text-white">
								Kemutai Hanashi, staged with shoreline haze
							</TextHeading>
							<p className="mt-3 max-w-xl text-sm leading-6 text-sky-50/82">
								A dedicated page built around sea air, drifting smoke, and a calmer editorial layout for the full Kemutai Hanashi set.
							</p>
						</div>

						<Button
							asChild
							variant="secondary"
							className="border border-white/15 bg-white/12 text-white shadow-none hover:bg-white/20 hover:text-white"
						>
							<Link href="/artworks/kemutai-hanashi">
								Open the gallery
								<ArrowUpRight className="size-4" />
							</Link>
						</Button>
					</div>
				</div>
				*/}

				<ArtworksGallery sections={sections} />
			</StackVertical>

			<SectionFooter showToTop={false} />
		</BaseContainer>
	)
}

