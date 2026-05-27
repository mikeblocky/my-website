import { ImageResponse } from 'next/og'
import { getTalkById } from '@/lib/kv/talk'
import { BoardOgCard, boardOgSize } from '@/components/og/BoardOgCard'

export const runtime = 'nodejs'

export const alt = 'Talk board post'
export const size = {
  ...boardOgSize,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const talk = await getTalkById(id)

  if (!talk) {
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
          Post not found
        </div>
      ),
      { ...size }
    )
  }

  return new ImageResponse(
    <BoardOgCard
      accent="#3b82f6"
      accentSoft="#dbeafe"
      border="#bfdbfe"
      footer="mikeblocky.com/talk"
      label={`Post from ${talk.author || 'anonymous'}`}
      title=""
      body={talk.body}
      date={new Date(talk.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}
      imageUrl={talk.imageUrl}
    />,
    {
      ...size,
    }
  )
}
