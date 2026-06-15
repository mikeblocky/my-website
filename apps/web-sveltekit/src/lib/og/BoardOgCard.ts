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
  const hasImage = !!imageUrl
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
        flexGrow: 1,
        paddingRight: hasImage ? 48 : 0,
      },
      children: [
        ...(hasTitle ? [{
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: 36,
              fontWeight: 700,
              color: '#0f172a',
              lineHeight: 1.35,
              marginBottom: 20,
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
            width: 300,
            height: 300,
            borderRadius: 20,
            overflow: 'hidden',
            borderWidth: 6,
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
            paddingTop: 50,
            paddingBottom: 50,
            paddingLeft: 60,
            paddingRight: 60,
          },
          children: [
            // Badge row
            {
              type: 'div',
              props: {
                style: { display: 'flex', alignItems: 'center', width: '100%' },
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
            // Middle row
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
                  borderTopWidth: 2,
                  borderTopStyle: 'solid',
                  borderTopColor: '#f1f5f9',
                  paddingTop: 25,
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
