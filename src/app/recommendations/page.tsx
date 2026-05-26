import type { Metadata } from 'next'
import { SectionPageShell } from '@/components/layout/page-shell/SectionPageShell'
import { RecommendationsClient } from './_components/RecommendationsClient'

export const metadata: Metadata = {
  title: 'Recommendations | mikeblocky.com',
  description: 'A personal list of favorite manga, anime, books, games, and music.'
}

export default function RecommendationsPage() {
  return (
    <SectionPageShell
      title="Recommendations"
      description="A personal shelf of favorite media I keep returning to: manga, anime, books, games, and music."
      currentLabel="Recommendations"
      footerColor="teal"
    >
      <RecommendationsClient />
    </SectionPageShell>
  )
}
