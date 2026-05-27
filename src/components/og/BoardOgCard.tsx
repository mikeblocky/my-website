type BoardOgCardProps = {
  accent: string
  accentSoft: string
  border: string
  footer: string
  label: string
  title: string
  body: string
  date: string
  imageUrl?: string
}

export const boardOgSize = {
  width: 1200,
  height: 630,
}

export function BoardOgCard({
  accent,
  accentSoft,
  border,
  footer,
  label,
  title,
  body,
  date,
  imageUrl,
}: BoardOgCardProps) {
  const hasImage = !!imageUrl && !imageUrl.includes('image/webp')

  return (
    <div
      style={{
        background: accentSoft,
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
          border: `12px solid ${accent}`,
          borderRadius: '32px',
          padding: '50px 60px',
          boxSizing: 'border-box',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <div
            style={{
              padding: '10px 28px',
              borderRadius: '999px',
              background: accentSoft,
              border: `2px solid ${border}`,
              color: footer,
              fontSize: '26px',
              fontWeight: 'bold',
            }}
          >
            {label}
          </div>
        </div>

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
              flexDirection: 'column',
              flex: 1,
              paddingRight: hasImage ? '40px' : '0px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '32px',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.2,
                marginBottom: '20px',
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: hasImage ? '34px' : '46px',
                fontWeight: 700,
                color: '#334155',
                lineHeight: 1.35,
              }}
            >
              &ldquo;{body.length > 170 ? `${body.slice(0, 170)}...` : body}&rdquo;
            </div>
          </div>

          {hasImage && (
            <div
              style={{
                display: 'flex',
                width: '320px',
                height: '320px',
                borderRadius: '24px',
                overflow: 'hidden',
                border: `6px solid ${border}`,
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}
        </div>

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
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: accent }}>
            {footer}
          </div>
          <div style={{ fontSize: '26px', color: '#94a3b8' }}>
            {date}
          </div>
        </div>
      </div>
    </div>
  )
}
