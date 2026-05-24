import { ImageResponse } from 'next/og'
import { getPromptById } from '@/lib/kv/draw'

export const runtime = 'nodejs'

export const alt = 'Drawing prompt'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const prompt = await getPromptById(id)

  if (!prompt) {
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
          Prompt not found
        </div>
      ),
      { ...size }
    )
  }

  const hasImage = !!prompt.imageUrl

  return new ImageResponse(
    (
      <div
        style={{
          background: '#f3e8ff',
          width: '100%',
          height: '100%',
          display: 'flex',
          padding: '40px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: '#ffffff',
            border: '12px solid #8b5cf6',
            borderRadius: '32px',
            padding: '50px 60px',
            boxSizing: 'border-box',
            justifyContent: 'space-between',
          }}
        >
          {/* Header block with Character and Media tags */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                padding: '10px 28px',
                borderRadius: '999px',
                background: '#faf5ff',
                border: '2px solid #ddd6fe',
                color: '#4c1d95',
                fontSize: '26px',
                fontWeight: 'bold',
                marginRight: '16px',
              }}
            >
              Suggestion from {prompt.author || 'anonymous'}
            </div>
            
            {prompt.character && (
              <div
                style={{
                  padding: '8px 22px',
                  borderRadius: '999px',
                  background: '#f3e8ff',
                  border: '1.5px solid #e9d5ff',
                  color: '#6b21a8',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  display: 'flex',
                  marginRight: '12px',
                }}
              >
                👤 {prompt.character}
              </div>
            )}
            
            {prompt.media && (
              <div
                style={{
                  padding: '8px 22px',
                  borderRadius: '999px',
                  background: '#e0e7ff',
                  border: '1.5px solid #c7d2fe',
                  color: '#3730a3',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  display: 'flex',
                }}
              >
                🎬 {prompt.media}
              </div>
            )}
          </div>

          {/* Middle Body block (side-by-side if hasImage) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '20px 0',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                flex: 1,
                fontSize: hasImage ? '40px' : '52px',
                fontWeight: 'bold',
                color: '#2e1065',
                lineHeight: 1.4,
                paddingRight: hasImage ? '40px' : '0px',
              }}
            >
              &ldquo;{prompt.body.length > 160 ? prompt.body.slice(0, 160) + '...' : prompt.body}&rdquo;
            </div>

            {hasImage && (
              <div
                style={{
                  display: 'flex',
                  width: '320px',
                  height: '320px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: '6px solid #ddd6fe',
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prompt.imageUrl}
                  alt="Prompt attachment"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}
          </div>

          {/* Footer block */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              borderTop: '2px solid #f3f4f6',
              paddingTop: '25px',
            }}
          >
            <div
              style={{
                fontSize: '26px',
                fontWeight: 'bold',
                color: '#8b5cf6',
              }}
            >
              mikeblocky.com/draw
            </div>
            <div
              style={{
                fontSize: '26px',
                color: '#c084fc',
              }}
            >
              {new Date(prompt.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
