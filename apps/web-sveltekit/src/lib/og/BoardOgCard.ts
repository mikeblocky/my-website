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

export function boardOgCard({
  accent, accentSoft, border, footer, label, title, body, date, imageUrl,
}: BoardOgCardProps) {
  const hasImage = !!imageUrl && !imageUrl.includes('image/webp')
  const hasTitle = !!title && title.trim().length > 0
  const bodyLen = body.length
  const bodyFontSize = hasImage
    ? (bodyLen > 220 ? 26 : bodyLen > 140 ? 30 : 34)
    : (bodyLen > 280 ? 28 : bodyLen > 180 ? 34 : 42)

  const textColumn: any = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flex: 1,
        paddingRight: hasImage ? 48 : 0,
        overflow: 'hidden',
      },
      children: [
        hasTitle && {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: 36,
              fontWeight: 700,
              color: '#0f172a',
              lineHeight: 1.35,
              letterSpacing: '-0.02em',
              marginBottom: 20,
            },
            children: title,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: bodyFontSize,
              fontWeight: 400,
              color: '#334155',
              lineHeight: 1.5,
              letterSpacing: '-0.015em',
              overflow: 'hidden',
            },
            children: `“${body}”`,
          },
        },
      ].filter(Boolean),
    },
  }

  const imageBox: any = hasImage
    ? {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            width: 320,
            height: 320,
            borderRadius: 24,
            overflow: 'hidden',
            border: `6px solid ${border}`,
            flexShrink: 0,
          },
          children: {
            type: 'img',
            props: {
              src: imageUrl,
              style: { width: '100%', height: '100%', objectFit: 'cover' },
            },
          },
        },
      }
    : null

  return {
    type: 'div',
    props: {
      style: {
        background: accentSoft,
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: 40,
      },
      children: {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: '#ffffff',
            border: `12px solid ${accent}`,
            borderRadius: 32,
            padding: '50px 60px',
          },
          children: [
            // Badge
            {
              type: 'div',
              props: {
                style: { display: 'flex', alignItems: 'center', width: '100%' },
                children: {
                  type: 'div',
                  props: {
                    style: {
                      padding: '8px 26px',
                      borderRadius: 999,
                      background: accentSoft,
                      border: `2px solid ${border}`,
                      color: accent,
                      fontSize: 24,
                      fontWeight: 700,
                    },
                    children: label,
                  },
                },
              },
            },
            // Middle
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 36,
                  marginBottom: 36,
                  width: '100%',
                  flex: 1,
                },
                children: [textColumn, imageBox].filter(Boolean),
              },
            },
            // Footer
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  borderTop: '2px solid #f1f5f9',
                  paddingTop: 25,
                  marginTop: 'auto',
                },
                children: [
                  {
                    type: 'div',
                    props: { style: { fontSize: 26, fontWeight: 700, color: accent }, children: footer },
                  },
                  {
                    type: 'div',
                    props: { style: { fontSize: 24, fontWeight: 400, color: '#94a3b8' }, children: date },
                  },
                ],
              },
            },
          ],
        },
      },
    },
  }
}
