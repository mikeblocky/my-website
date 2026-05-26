import type { Metadata } from 'next'
import { SectionPageShell } from '@/components/layout/page-shell/SectionPageShell'
import { SuggestionsBoard } from './_components/SuggestionsBoard'

export const metadata: Metadata = {
  title: 'Suggestions | mikeblocky.com',
  description: 'Suggest books, manga, movies, series, music, games, or anything else for me to try.'
}

export default function SuggestionsPage() {
  return (
    <SectionPageShell
      title="Suggestions"
      description="Suggest something I should read, watch, listen to, or try, with the best part I should look forward to."
      currentLabel="Suggestions"
    >
      <SuggestionsBoard />
    </SectionPageShell>
  )
}
