import { ImageResponse } from 'next/og'
import { getQuestionById } from '@/lib/kv/ask'

export const runtime = 'nodejs'

export const alt = 'Anonymous question'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const question = await getQuestionById(id)

  if (!question) {
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
          Question not found
        </div>
      ),
      { ...size }
    )
  }

  const hasImage = !!question.imageUrl

  return new ImageResponse(
    (
      <div
        style={{
          background: '#dbeafe',
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
            border: '12px solid #3b82f6',
            borderRadius: '32px',
            padding: '50px 60px',
            boxSizing: 'border-box',
            justifyContent: 'space-between',
          }}
        >
          {/* Header block */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                padding: '10px 28px',
                borderRadius: '999px',
                background: '#eff6ff',
                border: '2px solid #bfdbfe',
                color: '#1e3a8a',
                fontSize: '26px',
                fontWeight: 'bold',
              }}
            >
              Question from {question.author || 'anonymous'}
            </div>
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
                color: '#1e293b',
                lineHeight: 1.4,
                paddingRight: hasImage ? '40px' : '0px',
              }}
            >
              &ldquo;{question.body.length > 160 ? question.body.slice(0, 160) + '...' : question.body}&rdquo;
            </div>

            {hasImage && (
              <div
                style={{
                  display: 'flex',
                  width: '320px',
                  height: '320px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  border: '6px solid #bfdbfe',
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={question.imageUrl}
                  alt="Question attachment"
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
              borderTop: '2px solid #f1f5f9',
              paddingTop: '25px',
            }}
          >
            <div
              style={{
                fontSize: '26px',
                fontWeight: 'bold',
                color: '#3b82f6',
              }}
            >
              mikeblocky.com/ask
            </div>
            <div
              style={{
                fontSize: '26px',
                color: '#94a3b8',
              }}
            >
              {new Date(question.createdAt).toLocaleDateString('en-US', {
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
