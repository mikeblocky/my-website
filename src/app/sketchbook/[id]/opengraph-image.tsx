import { ImageResponse } from 'next/og'
import { getDrawingById } from '@/lib/kv/sketchbook'
import { ArtworkOgCard, artworkOgSize } from '@/components/og/ArtworkOgCard'

export const runtime = 'nodejs'

export const alt = 'Sketchbook drawing'
export const size = {
  ...artworkOgSize,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const drawing = await getDrawingById(id)

  if (!drawing) {
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
          Drawing not found
        </div>
      ),
      { ...size }
    )
  }

  return new ImageResponse(
    <ArtworkOgCard
      accent="#8b5cf6"
      accentSoft="#f3e8ff"
      border="#ddd6fe"
      footer="mikeblocky.com/sketchbook"
      label={`Drawing by ${drawing.author}`}
      body={drawing.body || ''}
      date={new Date(drawing.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}
      imageUrl={drawing.imageUrl}
    />,
    {
      ...size,
    }
  )
}
