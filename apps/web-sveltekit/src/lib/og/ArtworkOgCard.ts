type ArtworkOgCardProps = {
  imageUrl: string
  caption?: string
  author?: string
  date: string
}

function clampText(text: string, max: number) {
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}

function wrapText(text: string, charsPerLine: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length <= charsPerLine) {
      current = next
      continue
    }

    if (current) lines.push(current)

    if (word.length > charsPerLine) {
      for (let i = 0; i < word.length; i += charsPerLine) {
        lines.push(word.slice(i, i + charsPerLine))
      }
      current = ''
    } else {
      current = word
    }
  }

  if (current) lines.push(current)

  if (lines.length <= maxLines) return lines

  const visible = lines.slice(0, maxLines)
  visible[maxLines - 1] = clampText(visible[maxLines - 1], Math.max(2, charsPerLine - 1))
  return visible
}

export function artworkOgCard({ imageUrl, caption, author, date }: ArtworkOgCardProps) {
  const accent = '#d97706'
  const accentSoft = '#fffbeb'
  const border = '#fcd34d'

  const rawCaption = caption?.trim() || null
  const safeCaption = rawCaption ? clampText(rawCaption, 320) : null
  const captionLen = safeCaption?.length ?? 0

  const captionFontSize = safeCaption
    ? (captionLen > 240 ? 18 : captionLen > 170 ? 20 : captionLen > 110 ? 23 : captionLen > 60 ? 27 : 34)
    : 26
  const captionLineHeight = safeCaption
    ? (captionLen > 170 ? 1.32 : captionLen > 90 ? 1.36 : 1.4)
    : 1.4
  const captionLines = safeCaption
    ? wrapText(safeCaption, captionLen > 240 ? 44 : captionLen > 170 ? 40 : captionLen > 110 ? 35 : 28, 8)
    : ['A sketch sent!']

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
                  width: 510,
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
                        minWidth: 0,
                      },
                      children: {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            maxHeight: 252,
                            fontSize: captionFontSize,
                            fontWeight: 400,
                            color: safeCaption ? '#334155' : '#94a3b8',
                            lineHeight: captionLineHeight,
                            overflow: 'hidden',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                          },
                          children: captionLines.map((line, index) => ({
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                width: '100%',
                              },
                              children:
                                safeCaption && captionLines.length === 1
                                  ? `"${line}"`
                                  : safeCaption && index === 0
                                    ? `"${line}`
                                    : safeCaption && index === captionLines.length - 1
                                      ? `${line}"`
                                      : line,
                            },
                          })),
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
                        width: 420,
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: {
                              display: 'flex',
                              width: 420,
                              height: 2,
                              background: '#f1f5f9',
                              marginBottom: 18,
                            },
                          },
                        },
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
