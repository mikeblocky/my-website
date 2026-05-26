import type { Metadata } from 'next'
import BaseContainer from '@/components/layout/container/base-container'
import { SectionFooter } from '@/components/layout/footer/SectionFooter'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { SectionPageHeader } from '@/components/layout/page-header/SectionPageHeader'
import { SuggestionsBoard } from './_components/SuggestionsBoard'

export const metadata: Metadata = {
  title: 'Suggestions | mikeblocky.com',
  description: 'Suggest books, manga, movies, series, music, games, or anything else for me to try.'
}

export default function SuggestionsPage() {
  return (
    <BaseContainer size="md" paddingX="md" paddingY="lg">
      <StackVertical gap="lg">
        <SectionPageHeader
          title="Suggestions"
          description="Suggest something I should read, watch, listen to, or try, with the best part I should look forward to."
          currentLabel="Suggestions"
        />

        <SuggestionsBoard />
      </StackVertical>

      <SectionFooter showToTop={false} />
    </BaseContainer>
  )
}
