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

function clampText(text: string, max: number) {
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}

function wrapText(text: string, charsPerLine: number, maxLines: number) {
  const words = text.replace(/\s+/g, ' ').trim().split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length <= charsPerLine) {
      current = next
      continue
    }

    if (current) lines.push(current)
    current = word

    if (lines.length >= maxLines) break
  }

  if (current && lines.length < maxLines) lines.push(current)

  if (lines.length === maxLines) {
    const last = lines[lines.length - 1]
    lines[lines.length - 1] = last.length > 1 ? last.replace(/[.…]*$/, '') + '…' : '…'
  }

  return lines
}

function bodyStyle(len: number, hasImage: boolean) {
  if (hasImage) {
    // right panel is ~560px wide
    if (len > 360) return { fontSize: 18, lineHeight: 1.28 }
    if (len > 280) return { fontSize: 20, lineHeight: 1.32 }
    if (len > 200) return { fontSize: 23, lineHeight: 1.35 }
    if (len > 120) return { fontSize: 28, lineHeight: 1.4 }
    return { fontSize: 36, lineHeight: 1.5 }
  }
  // full width: 1120px - 120px padding = 1000px content
  if (len > 560) return { fontSize: 20, lineHeight: 1.28 }
  if (len > 430) return { fontSize: 22, lineHeight: 1.32 }
  if (len > 300) return { fontSize: 25, lineHeight: 1.35 }
  if (len > 190) return { fontSize: 29, lineHeight: 1.4 }
  if (len > 100) return { fontSize: 36, lineHeight: 1.5 }
  return { fontSize: 42, lineHeight: 1.5 }
}

// Estimate max chars that fit in the middle area before the footer gets pushed off
function maxBodyChars(hasImage: boolean, hasTitle: boolean): number {
  if (hasImage) return 430
  if (hasTitle) return 560
  return 700
}

export function boardOgCard({
  accent, accentSoft, border, label, body, title, author, date, imageUrl,
}: BoardOgCardProps) {
  const hasImage = !!imageUrl
  const hasTitle = !!title && title.trim().length > 0
  const safeBody = clampText(body, maxBodyChars(hasImage, hasTitle))
  const { fontSize, lineHeight } = bodyStyle(safeBody.length, hasImage)
  const charsPerLine = hasImage
    ? fontSize >= 34 ? 24 : fontSize >= 28 ? 30 : fontSize >= 23 ? 37 : fontSize >= 20 ? 43 : 47
    : fontSize >= 40 ? 40 : fontSize >= 36 ? 48 : fontSize >= 29 ? 58 : fontSize >= 25 ? 67 : 76
  const maxLines = hasImage ? (hasTitle ? 4 : 5) : (hasTitle ? 5 : 6)
  const bodyLines = wrapText(safeBody, charsPerLine, maxLines)
  const footerWidth = hasImage ? 520 : 980

  // Info panel content (badge + text + footer) — shared between both layouts
  function infoPanel(rightPadding = 60) {
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          paddingTop: 44,
          paddingBottom: 44,
          paddingLeft: hasImage ? 44 : 60,
          paddingRight: rightPadding,
          overflow: 'hidden',
          minWidth: 0,
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
                    paddingLeft: 26, paddingRight: 26,
                    borderRadius: 999,
                    background: accentSoft,
                    borderWidth: 2, borderStyle: 'solid', borderColor: border,
                    color: accent, fontSize: 24, fontWeight: 700,
                  },
                  children: label,
                },
              },
            },
          },
          // Text block
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flexGrow: 1,
                marginTop: 24,
                marginBottom: 24,
                overflow: 'hidden',
                minWidth: 0,
              },
              children: [
                ...(hasTitle ? [{
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      fontSize: hasImage ? 26 : 30,
                      fontWeight: 700,
                      color: '#0f172a',
                      lineHeight: 1.3,
                      marginBottom: 14,
                      flexShrink: 0,
                      width: '100%',
                      overflow: 'hidden',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                    },
                    children: clampText(title!, 90),
                  },
                }] : []),
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      maxHeight: hasImage ? 286 : 260,
                      fontSize,
                      fontWeight: 400,
                      color: '#334155',
                      lineHeight,
                      overflow: 'hidden',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                    },
                    children: bodyLines.map((line, index) => ({
                      type: 'div',
                      props: {
                        style: { display: 'flex', whiteSpace: 'pre-wrap' },
                        children: `${index === 0 ? '"' : ''}${line}${index === bodyLines.length - 1 ? '"' : ''}`,
                      },
                    })),
                  },
                },
              ],
            },
          },
          // Footer
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                width: footerWidth,
                maxWidth: '100%',
                flexShrink: 0,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', width: '100%', height: 2, background: '#f1f5f9', marginBottom: 18 },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      width: '100%',
                      gap: 16,
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', flexDirection: 'column', minWidth: 0 },
                          children: [
                            {
                              type: 'div',
                              props: { style: { fontSize: 22, fontWeight: 700, color: accent }, children: 'mikeblocky.com/interact' },
                            },
                            ...(author ? [{
                              type: 'div',
                              props: {
                                style: { fontSize: 18, fontWeight: 400, color: '#94a3b8', marginTop: 4 },
                                children: hasImage ? `by ${author} · ${date}` : `by ${author}`,
                              },
                            }] : []),
                          ],
                        },
                      },
                      ...(!hasImage ? [{
                        type: 'div',
                        props: { style: { fontSize: 20, fontWeight: 400, color: '#94a3b8', flexShrink: 0 }, children: date },
                      }] : []),
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    }
  }

  if (hasImage) {
    // Split layout: image panel on left, info on right
    return {
      type: 'div',
      props: {
        style: {
          background: accentSoft, width: '100%', height: '100%',
          display: 'flex', padding: 40,
        },
        children: {
          type: 'div',
          props: {
            style: {
              display: 'flex', flexDirection: 'row',
              width: '100%', height: '100%',
              background: '#ffffff',
              borderWidth: 12, borderStyle: 'solid', borderColor: accent,
              borderRadius: 32, overflow: 'hidden',
            },
            children: [
              // Left image panel
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex', width: 420, flexShrink: 0,
                    background: accentSoft,
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
              infoPanel(44),
            ],
          },
        },
      },
    }
  }

  // Text-only layout: full width card
  return {
    type: 'div',
    props: {
      style: {
        background: accentSoft, width: '100%', height: '100%',
        display: 'flex', padding: 40,
      },
      children: {
        type: 'div',
        props: {
          style: {
            display: 'flex', flexDirection: 'column',
            width: '100%', height: '100%',
            background: '#ffffff',
            borderWidth: 12, borderStyle: 'solid', borderColor: accent,
            borderRadius: 32, overflow: 'hidden',
          },
          children: [infoPanel(60)],
        },
      },
    },
  }
}
