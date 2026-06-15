import type { Metadata } from 'next'
import { SectionPageShell } from '@/components/layout/page-shell/SectionPageShell'
import { SuggestionsBoard } from './_components/SuggestionsBoard'

export const metadata: Metadata = {
  title: 'Suggestions | mikeblocky.com',
  description: 'A place to suggest books, manga, music, or films you think I would enjoy.'
}

export default function SuggestionsPage() {
  return (
    <SectionPageShell
      title="Suggestions"
      description="Suggest books, manga, music, or movies for me to check out next."
      currentLabel="Suggestions"
    >
      <SuggestionsBoard />
    </SectionPageShell>
  )
}
