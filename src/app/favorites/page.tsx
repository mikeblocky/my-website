import type { Metadata } from 'next'
import { SectionPageShell } from '@/components/layout/page-shell/SectionPageShell'
import { RecommendationsClient } from './_components/RecommendationsClient'

export const metadata: Metadata = {
  title: 'Favorites | mikeblocky.com',
  description: 'A personal list of favorite manga, anime, games, and music.'
}

export default function FavoritesPage() {
  return (
    <SectionPageShell
      title="Favorites"
      description="A personal shelf of favorite media I keep returning to: manga, anime, books, games, and music."
      currentLabel="Favorites"
      footerColor="teal"
    >
      <RecommendationsClient />
    </SectionPageShell>
  )
}
