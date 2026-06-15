type ArtworkOgCardProps = {
  accent: string
  accentSoft: string
  border: string
  footer: string
  label: string
  body: string
  date: string
  imageUrl: string
}

export const artworkOgSize = {
  width: 1200,
  height: 630,
}

export function ArtworkOgCard({
  accent,
  accentSoft,
  border,
  footer,
  label,
  body,
  date,
  imageUrl,
}: ArtworkOgCardProps) {
  const bodyLen = body.length
  const captionFontSize = bodyLen > 160 ? '20px' : bodyLen > 90 ? '24px' : '28px'

  // Polaroid card dimensions — tall enough to show artwork prominently
  const cardW = 520
  const imageH = 390
  const captionH = 160

  return (
    <div
      style={{
        background: accentSoft,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Polaroid card */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: `${cardW}px`,
          background: '#ffffff',
          border: `10px solid ${accent}`,
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        }}
      >
        {/* Artwork image — full width, fixed height */}
        <div
          style={{
            display: 'flex',
            width: `${cardW}px`,
            height: `${imageH}px`,
            background: '#f8fafc',
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
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Caption strip */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: `${cardW}px`,
            height: `${captionH}px`,
            padding: '18px 28px',
            borderTop: `3px solid ${border}`,
            background: '#ffffff',
            boxSizing: 'border-box',
          }}
        >
          {/* Sender badge + message */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div
              style={{
                display: 'flex',
                fontSize: '16px',
                fontWeight: 800,
                color: accent,
                letterSpacing: '-0.01em',
              }}
            >
              {label}
            </div>
            {body ? (
              <div
                style={{
                  display: 'flex',
                  fontSize: captionFontSize,
                  fontWeight: 500,
                  color: '#334155',
                  lineHeight: 1.4,
                  fontStyle: 'normal',
                  letterSpacing: '-0.01em',
                  overflow: 'hidden',
                }}
              >
                &ldquo;{body}&rdquo;
              </div>
            ) : null}
          </div>

          {/* Footer: site + date */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '15px', fontWeight: 800, color: accent }}>
              {footer}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>
              {date}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative second card peeking behind */}
      <div
        style={{
          position: 'absolute',
          width: `${cardW}px`,
          height: `${imageH + captionH + 20}px`,
          background: '#ffffff',
          border: `10px solid ${border}`,
          borderRadius: '20px',
          transform: 'rotate(-4deg)',
          zIndex: -1,
          opacity: 0.6,
        }}
      />
    </div>
  )
}
