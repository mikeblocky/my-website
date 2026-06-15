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

function bodyStyle(len: number, hasImage: boolean) {
  if (hasImage) {
    if (len > 500) return { fontSize: 16, lineHeight: 1.28 }
    if (len > 360) return { fontSize: 18, lineHeight: 1.3 }
    if (len > 260) return { fontSize: 20, lineHeight: 1.32 }
    if (len > 180) return { fontSize: 23, lineHeight: 1.35 }
    if (len > 100) return { fontSize: 28, lineHeight: 1.4 }
    return { fontSize: 34, lineHeight: 1.5 }
  }
  if (len > 700) return { fontSize: 18, lineHeight: 1.28 }
  if (len > 560) return { fontSize: 20, lineHeight: 1.3 }
  if (len > 420) return { fontSize: 22, lineHeight: 1.32 }
  if (len > 280) return { fontSize: 26, lineHeight: 1.35 }
  if (len > 160) return { fontSize: 30, lineHeight: 1.4 }
  if (len > 80)  return { fontSize: 36, lineHeight: 1.5 }
  return { fontSize: 42, lineHeight: 1.5 }
}

export function boardOgCard({
  accent, accentSoft, border, label, body, title, author, date, imageUrl,
}: BoardOgCardProps) {
  const hasImage = !!imageUrl
  const hasTitle = !!title && title.trim().length > 0
  // Hard cap only as last resort — let Satori wrap naturally within maxHeight
  const safeBody = clampText(body, hasImage ? 800 : 1200)
  const { fontSize, lineHeight } = bodyStyle(safeBody.length, hasImage)
  const footerWidth = hasImage ? 520 : 980

  // Text block renders body as a single string — Satori wraps it by width,
  // maxHeight + overflow:hidden clips any excess without manual line splitting
  const textBlock = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        maxHeight: hasImage ? 300 : 265,
        fontSize,
        fontWeight: 400,
        color: '#334155',
        lineHeight,
        overflow: 'hidden',
      },
      children: `"${safeBody}"`,
    },
  }

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
          // Text area
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
                      width: '100%',
                      fontSize: hasImage ? 26 : 30,
                      fontWeight: 700,
                      color: '#0f172a',
                      lineHeight: 1.3,
                      marginBottom: 14,
                      overflow: 'hidden',
                    },
                    children: clampText(title!, 90),
                  },
                }] : []),
                textBlock,
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
    return {
      type: 'div',
      props: {
        style: { background: accentSoft, width: '100%', height: '100%', display: 'flex', padding: 40 },
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
              {
                type: 'div',
                props: {
                  style: { display: 'flex', width: 420, flexShrink: 0, background: accentSoft },
                  children: {
                    type: 'img',
                    props: { src: imageUrl, style: { width: '100%', height: '100%', objectFit: 'cover' } },
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

  return {
    type: 'div',
    props: {
      style: { background: accentSoft, width: '100%', height: '100%', display: 'flex', padding: 40 },
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
