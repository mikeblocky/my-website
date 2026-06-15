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

  const byline = [author, date].filter(Boolean).join(' · ')

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
            // Left: artwork image
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  width: 550,
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
                  paddingTop: 50,
                  paddingBottom: 50,
                  paddingLeft: 50,
                  paddingRight: 50,
                },
                children: [
                  // Badge
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', alignItems: 'center' },
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
                      },
                      children: caption
                        ? {
                            type: 'div',
                            props: {
                              style: {
                                fontSize: caption.length > 80 ? 28 : caption.length > 40 ? 34 : 40,
                                fontWeight: 400,
                                color: '#334155',
                                lineHeight: 1.5,
                              },
                              children: `"${caption}"`,
                            },
                          }
                        : {
                            type: 'div',
                            props: {
                              style: { fontSize: 34, fontWeight: 400, color: '#94a3b8', lineHeight: 1.5 },
                              children: 'A sketchbook drawing',
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
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTopWidth: 2,
                        borderTopStyle: 'solid',
                        borderTopColor: '#f1f5f9',
                        paddingTop: 25,
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: { fontSize: 26, fontWeight: 700, color: accent },
                            children: 'mikeblocky.com/interact',
                          },
                        },
                        {
                          type: 'div',
                          props: {
                            style: { fontSize: 22, fontWeight: 400, color: '#94a3b8' },
                            children: byline,
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
