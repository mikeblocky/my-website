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
          background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Left content block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            flex: 1,
            height: '100%',
            paddingRight: hasImage ? '40px' : '0px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                padding: '10px 24px',
                borderRadius: '999px',
                background: 'white',
                border: '2px solid #ddd6fe',
                color: '#7c3aed',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              {prompt.author || 'anonymous'} suggested
            </div>
          </div>

          {/* Character and Media labels in OG image */}
          {(prompt.character || prompt.media) && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              {prompt.character && (
                <div
                  style={{
                    padding: '6px 16px',
                    borderRadius: '999px',
                    background: '#f3e8ff',
                    border: '1px solid #e9d5ff',
                    color: '#6b21a8',
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}
                >
                  👤 {prompt.character}
                </div>
              )}
              {prompt.media && (
                <div
                  style={{
                    padding: '6px 16px',
                    borderRadius: '999px',
                    background: '#e0e7ff',
                    border: '1px solid #c7d2fe',
                    color: '#3730a3',
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}
                >
                  🎬 {prompt.media}
                </div>
              )}
            </div>
          )}

          <div
            style={{
              fontSize: hasImage ? '44px' : '56px',
              fontWeight: 'bold',
              color: '#2e1065',
              lineHeight: 1.3,
              marginBottom: '30px',
              display: 'flex',
            }}
          >
            &ldquo;{prompt.body.length > 180 ? prompt.body.slice(0, 180) + '...' : prompt.body}&rdquo;
          </div>

          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                color: '#6b21a8',
                opacity: 0.7,
              }}
            >
              mikeblocky.com/draw
            </div>
            <div
              style={{
                marginLeft: 'auto',
                fontSize: '24px',
                color: '#a78bfa',
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

        {/* Right image block if prompt has imageUrl */}
        {hasImage && (
          <div
            style={{
              display: 'flex',
              width: '380px',
              height: '380px',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '6px solid white',
              boxShadow: '0 20px 40px rgba(124, 58, 237, 0.1)',
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
    ),
    {
      ...size,
    }
  )
}
