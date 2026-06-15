import type { Metadata } from 'next'
import { SectionPageShell } from '@/components/layout/page-shell/SectionPageShell'
import { RecommendationsClient } from './_components/RecommendationsClient'

export const metadata: Metadata = {
  title: 'Favorites | mikeblocky.com',
  description: 'A collection of manga, anime, music, and games that have resonated with me.'
}

export default function FavoritesPage() {
  return (
    <SectionPageShell
      title="Favorites"
      description="A shelf of favorite manga, anime, games, and music I keep returning to."
      currentLabel="Favorites"
      footerColor="teal"
    >
      <RecommendationsClient />
    </SectionPageShell>
  )
}
