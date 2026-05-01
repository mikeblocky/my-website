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

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              padding: '10px 24px',
              borderRadius: '999px',
              background: 'white',
              border: '2px solid #bfdbfe',
              color: '#2563eb',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            {question.author || 'anonymous'} asked
          </div>
        </div>

        <div
          style={{
            fontSize: '60px',
            fontWeight: 'bold',
            color: '#1e293b',
            lineHeight: 1.2,
            marginBottom: '40px',
            display: 'flex',
          }}
        >
          &ldquo;{question.body.length > 200 ? question.body.slice(0, 200) + '...' : question.body}&rdquo;
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
              color: '#64748b',
            }}
          >
            mikeblocky.com/ask
          </div>
          <div
            style={{
              marginLeft: 'auto',
              fontSize: '24px',
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
    ),
    {
      ...size,
    }
  )
}
