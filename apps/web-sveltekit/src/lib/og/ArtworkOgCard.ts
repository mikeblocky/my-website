type ArtworkOgCardProps = {
  imageUrl: string
  caption?: string
  author?: string
  date: string
}

function clampText(text: string, max: number) {
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}

export function artworkOgCard({ imageUrl, caption, author, date }: ArtworkOgCardProps) {
  const accent = '#d97706'
  const accentSoft = '#fffbeb'
  const border = '#fcd34d'

  const rawCaption = caption?.trim() || null
  const safeCaption = rawCaption ? clampText(rawCaption, 160) : null
  const captionLen = safeCaption?.length ?? 0

  const captionFontSize = safeCaption
    ? (captionLen > 120 ? 22 : captionLen > 70 ? 26 : captionLen > 40 ? 30 : 36)
    : 26
  const captionLineHeight = safeCaption
    ? (captionLen > 120 ? 1.3 : captionLen > 70 ? 1.35 : 1.4)
    : 1.4

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
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            background: '#ffffff',
            borderWidth: 12,
            borderStyle: 'solid',
            borderColor: accent,
            borderRadius: 32,
            overflow: 'hidden',
          },
          children: [
            // Left: artwork image — flush to inner card edge, no gap
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  width: 530,
                  flexShrink: 0,
                  // Match the white card background so any sub-pixel gap is invisible
                  background: '#ffffff',
                },
                children: {
                  type: 'img',
                  props: {
                    src: imageUrl,
                    style: { width: '100%', height: '100%', objectFit: 'cover' },
                  },
                },
              },
            },
            // Right: info panel
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                  paddingTop: 44,
                  paddingBottom: 44,
                  paddingLeft: 44,
                  paddingRight: 44,
                  overflow: 'hidden',
                },
                children: [
                  // Badge
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', alignItems: 'center', flexShrink: 0 },
                      children: {
                        type: 'div',
                        props: {
                          style: {
                            paddingTop: 8, paddingBottom: 8,
                            paddingLeft: 24, paddingRight: 24,
                            borderRadius: 999,
                            background: accentSoft,
                            borderWidth: 2, borderStyle: 'solid', borderColor: border,
                            color: accent,
                            fontSize: 22, fontWeight: 700,
                          },
                          children: 'Sketchbook',
                        },
                      },
                    },
                  },
                  // Caption
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        flexGrow: 1,
                        alignItems: 'center',
                        overflow: 'hidden',
                        marginTop: 20,
                        marginBottom: 20,
                      },
                      children: {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: captionFontSize,
                            fontWeight: 400,
                            color: safeCaption ? '#334155' : '#94a3b8',
                            lineHeight: captionLineHeight,
                            overflow: 'hidden',
                          },
                          children: safeCaption ? `"${safeCaption}"` : 'A sketch sent!',
                        },
                      },
                    },
                  },
                  // Footer — stacked so URL and byline never collide
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0,
                        borderTopWidth: 2,
                        borderTopStyle: 'solid',
                        borderTopColor: '#f1f5f9',
                        paddingTop: 18,
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: { fontSize: 20, fontWeight: 700, color: accent },
                            children: 'mikeblocky.com/interact',
                          },
                        },
                        {
                          type: 'div',
                          props: {
                            style: { fontSize: 17, fontWeight: 400, color: '#94a3b8', marginTop: 4 },
                            children: author ? `by ${author} · ${date}` : date,
                          },
                        },
                      ],
                    },
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
