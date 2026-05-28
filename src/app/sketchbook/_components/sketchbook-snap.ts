export async function snapSketchbookCard(id: string) {
  const element = document.getElementById(`drawing-${id}`)
  if (!element) return null

  const url = `${window.location.origin}/sketchbook/${id}`
  const isDark = document.documentElement.classList.contains('dark')
  const actionsDiv = element.querySelector('.drawing-actions') as HTMLElement

  if (actionsDiv) actionsDiv.style.visibility = 'hidden'

  const linkBar = document.createElement('div')
  linkBar.style.cssText = `margin-top:12px;padding-top:10px;border-top:1px solid ${isDark ? '#ffffff15' : '#00000010'};font-size:11px;color:${isDark ? '#94a3b8' : '#64748b'};font-family:system-ui,sans-serif;letter-spacing:0.02em;`
  linkBar.textContent = `Link: ${url}`
  element.appendChild(linkBar)

  try {
    const { toPng } = await import('html-to-image')
    const dataUrl = await toPng(element, {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      style: {
        borderRadius: '16px',
        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
        boxShadow: 'none',
        padding: '16px',
        margin: '0',
        display: 'flex',
        flexDirection: 'column',
        color: isDark ? '#f1f5f9' : '#0f172a'
      }
    })
    const res = await fetch(dataUrl)
    const blob = await res.blob()

    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      return 'snapped'
    } catch (_error) {
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `masterpiece-${id}.png`
      a.click()
      return 'saved'
    }
  } finally {
    if (actionsDiv) actionsDiv.style.visibility = ''
    linkBar.remove()
  }
}
