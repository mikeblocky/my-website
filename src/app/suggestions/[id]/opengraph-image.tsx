import { ImageResponse } from 'next/og'
import { BoardOgCard, boardOgSize } from '@/components/og/BoardOgCard'
import { getHighQualitySuggestionImageUrl } from '../_components/suggestion-image-url'
import { getSuggestionById } from '@/lib/kv/suggestions'

export const runtime = 'nodejs'

export const alt = 'Media suggestion'
export const size = {
  ...boardOgSize,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const suggestion = await getSuggestionById(id)

  if (!suggestion) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Suggestion not found
        </div>
      ),
      { ...size }
    )
  }

  const body = suggestion.note || suggestion.bestPart || suggestion.reference?.description || suggestion.title

  return new ImageResponse(
    <BoardOgCard
      accent="#14b8a6"
      accentSoft="#ccfbf1"
      border="#99f6e4"
      footer="mikeblocky.com/suggestions"
      label={`${suggestion.category.toUpperCase()} from ${suggestion.author || 'anonymous'}`}
      title={suggestion.title}
      body={body}
      date={new Date(suggestion.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}
      imageUrl={getHighQualitySuggestionImageUrl(suggestion.reference?.image || suggestion.imageUrl)}
    />,
    {
      ...size,
    }
  )
}
