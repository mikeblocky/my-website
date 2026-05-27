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
  const hasTitle = !!title && title.trim().length > 0

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
        }}
      >
        {/* Top: Pill Badge */}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <div
            style={{
              padding: '8px 26px',
              borderRadius: '999px',
              background: accentSoft,
              border: `2px solid ${border}`,
              color: accent,
              fontSize: '24px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {label}
          </div>
        </div>

        {/* Middle Content: Title and Body */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '36px',
            marginBottom: '36px',
            width: '100%',
            flex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              paddingRight: hasImage ? '48px' : '0px',
              justifyContent: 'center',
            }}
          >
            {/* Conditional Title (only if present) */}
            {hasTitle && (
              <div
                style={{
                  display: 'flex',
                  fontSize: '36px',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.35,
                  letterSpacing: '-0.02em',
                  marginBottom: '28px', // Space between title and quote body!
                }}
              >
                {title}
              </div>
            )}

            {/* Quote Body */}
            <div
              style={{
                display: 'flex',
                fontSize: hasImage ? '34px' : '44px',
                fontWeight: 500, // Modern medium font-weight looks much neater than blocky heavy bold!
                color: '#334155',
                lineHeight: 1.5, // Generous line height makes text very clean and easy to look at
                fontStyle: 'italic', // Italics for quotes look extremely elegant and premium!
                letterSpacing: '-0.015em',
              }}
            >
              &ldquo;{body.length > 170 ? `${body.slice(0, 170)}...` : body}&rdquo;
            </div>
          </div>

          {/* Optional Right-side Image */}
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
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
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

        {/* Bottom: Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            borderTop: '2px solid #f1f5f9',
            paddingTop: '25px',
            marginTop: 'auto',
          }}
        >
          <div style={{ fontSize: '26px', fontWeight: 800, color: accent, letterSpacing: '-0.01em' }}>
            {footer}
          </div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#94a3b8' }}>
            {date}
          </div>
        </div>
      </div>
    </div>
  )
}
