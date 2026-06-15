type BoardOgCardProps = {
  accent: string
  accentSoft: string
  border: string
  label: string
  body: string
  title?: string
  author?: string
  date: string
  imageUrl?: string
}

export function boardOgCard({
  accent, accentSoft, border, label, body, title, author, date, imageUrl,
}: BoardOgCardProps) {
  const hasImage = !!imageUrl
  const hasTitle = !!title && title.trim().length > 0
  const bodyLen = body.length
  const bodyFontSize = hasImage
    ? (bodyLen > 220 ? 24 : bodyLen > 140 ? 28 : 32)
    : (bodyLen > 280 ? 26 : bodyLen > 180 ? 32 : 40)

  const textColumn: any = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        flexGrow: 1,
        paddingRight: hasImage ? 48 : 0,
        overflow: 'hidden',
      },
      children: [
        ...(hasTitle ? [{
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: 34,
              fontWeight: 700,
              color: '#0f172a',
              lineHeight: 1.3,
              marginBottom: 16,
            },
            children: title,
          },
        }] : []),
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: bodyFontSize,
              fontWeight: 400,
              color: '#334155',
              lineHeight: 1.5,
              overflow: 'hidden',
            },
            children: `"${body}"`,
          },
        },
      ],
    },
  }

  const imageBox: any = hasImage
    ? {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            width: 280,
            height: 280,
            borderRadius: 16,
            overflow: 'hidden',
            borderWidth: 4,
            borderStyle: 'solid',
            borderColor: border,
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
            borderWidth: 12,
            borderStyle: 'solid',
            borderColor: accent,
            borderRadius: 32,
            overflow: 'hidden',
            paddingTop: 44,
            paddingBottom: 44,
            paddingLeft: 60,
            paddingRight: 60,
          },
          children: [
            // Badge row
            {
              type: 'div',
              props: {
                style: { display: 'flex', alignItems: 'center', flexShrink: 0 },
                children: {
                  type: 'div',
                  props: {
                    style: {
                      paddingTop: 8,
                      paddingBottom: 8,
                      paddingLeft: 26,
                      paddingRight: 26,
                      borderRadius: 999,
                      background: accentSoft,
                      borderWidth: 2,
                      borderStyle: 'solid',
                      borderColor: border,
                      color: accent,
                      fontSize: 24,
                      fontWeight: 700,
                    },
                    children: label,
                  },
                },
              },
            },
            // Middle row (capped so footer always shows)
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 28,
                  marginBottom: 28,
                  width: '100%',
                  overflow: 'hidden',
                  flexGrow: 1,
                },
                children: hasImage ? [textColumn, imageBox] : [textColumn],
              },
            },
            // Footer row
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  flexShrink: 0,
                  borderTopWidth: 2,
                  borderTopStyle: 'solid',
                  borderTopColor: '#f1f5f9',
                  paddingTop: 20,
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', flexDirection: 'column' },
                      children: [
                        {
                          type: 'div',
                          props: { style: { fontSize: 24, fontWeight: 700, color: accent }, children: 'mikeblocky.com/interact' },
                        },
                        ...(author ? [{
                          type: 'div',
                          props: { style: { fontSize: 20, fontWeight: 400, color: '#94a3b8', marginTop: 4 }, children: `by ${author}` },
                        }] : []),
                      ],
                    },
                  },
                  {
                    type: 'div',
                    props: { style: { fontSize: 22, fontWeight: 400, color: '#94a3b8' }, children: date },
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
