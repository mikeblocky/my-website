type ArtworkOgCardProps = {
  imageUrl: string
  caption?: string
  author?: string
  date: string
}

export function artworkOgCard({ imageUrl, caption, author, date }: ArtworkOgCardProps) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: '#f8f4ef',
      },
      children: [
        // Ghost card (rotated behind)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              width: 520,
              background: '#ffffff',
              borderRadius: 8,
              boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
              transform: 'rotate(-4deg)',
              padding: 16,
              paddingBottom: 70,
            },
            children: '',
          },
        },
        // Main polaroid card
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              width: 520,
              background: '#ffffff',
              borderRadius: 8,
              boxShadow: '0 12px 48px rgba(0,0,0,0.22)',
              padding: 16,
              zIndex: 1,
            },
            children: [
              // Image area
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    width: '100%',
                    height: 390,
                    background: '#f1f5f9',
                    overflow: 'hidden',
                    borderRadius: 4,
                  },
                  children: {
                    type: 'img',
                    props: {
                      src: imageUrl,
                      style: { width: '100%', height: '100%', objectFit: 'contain' },
                    },
                  },
                },
              },
              // Caption strip
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '18px 12px 8px',
                    gap: 6,
                  },
                  children: [
                    caption && {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 22,
                          fontWeight: 400,
                          color: '#334155',
                          textAlign: 'center',
                          lineHeight: 1.4,
                        },
                        children: `"${caption}"`,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 18,
                          fontWeight: 700,
                          color: '#94a3b8',
                          textAlign: 'center',
                        },
                        children: author ? `— ${author} · ${date}` : date,
                      },
                    },
                  ].filter(Boolean),
                },
              },
            ],
          },
        },
      ],
    },
  }
}
