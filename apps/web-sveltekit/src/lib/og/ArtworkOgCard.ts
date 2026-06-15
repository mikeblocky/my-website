type ArtworkOgCardProps = {
  imageUrl: string
  caption?: string
  author?: string
  date: string
}

export function artworkOgCard({ imageUrl, caption, author, date }: ArtworkOgCardProps) {
  const accent = '#d97706'
  const accentSoft = '#fffbeb'
  const border = '#fcd34d'
  const captionText = caption && caption.trim() ? caption.trim() : null
  const captionLen = captionText?.length ?? 0

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
            // Left: artwork image (fills its column, no gap at boundary)
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  width: 530,
                  flexShrink: 0,
                  background: '#f8f4ef',
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
                            paddingTop: 8,
                            paddingBottom: 8,
                            paddingLeft: 24,
                            paddingRight: 24,
                            borderRadius: 999,
                            background: accentSoft,
                            borderWidth: 2,
                            borderStyle: 'solid',
                            borderColor: border,
                            color: accent,
                            fontSize: 22,
                            fontWeight: 700,
                          },
                          children: 'Sketchbook',
                        },
                      },
                    },
                  },
                  // Caption area
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        flexGrow: 1,
                        alignItems: 'center',
                        overflow: 'hidden',
                      },
                      children: {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: captionText
                              ? (captionLen > 80 ? 26 : captionLen > 40 ? 30 : 36)
                              : 28,
                            fontWeight: captionText ? 400 : 400,
                            color: captionText ? '#334155' : '#94a3b8',
                            lineHeight: 1.5,
                            overflow: 'hidden',
                          },
                          children: captionText ? `"${captionText}"` : 'A sketch sent!',
                        },
                      },
                    },
                  },
                  // Footer
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
                        paddingTop: 20,
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: { fontSize: 22, fontWeight: 700, color: accent },
                            children: 'mikeblocky.com/interact',
                          },
                        },
                        {
                          type: 'div',
                          props: {
                            style: { fontSize: 18, fontWeight: 400, color: '#94a3b8', marginTop: 4 },
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
