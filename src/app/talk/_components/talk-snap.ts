export async function snapTalkCard(id: string) {
  const element = document.getElementById(`talk-${id}`)
  if (!element) return null

  const url = `${window.location.origin}/talk/${id}`
  const isDark = document.documentElement.classList.contains('dark')
  const actionsDiv = element.querySelector('.talk-actions') as HTMLElement

  if (actionsDiv) actionsDiv.style.visibility = 'hidden'

  const moreOverlays = element.querySelectorAll('.gallery-more-overlay') as NodeListOf<HTMLElement>
  const zoomOverlays = element.querySelectorAll('.gallery-zoom-overlay') as NodeListOf<HTMLElement>
  moreOverlays.forEach(el => el.style.display = 'none')
  zoomOverlays.forEach(el => el.style.display = 'none')

  const linkBar = document.createElement('div')
  linkBar.style.cssText = `margin-top:12px;padding-top:10px;border-top:1px solid ${isDark ? '#ffffff15' : '#00000010'};font-size:12px;color:${isDark ? '#94a3b8' : '#64748b'};font-family:system-ui,sans-serif;letter-spacing:0.02em;`
  linkBar.textContent = `Link: ${url}`
  element.appendChild(linkBar)

  try {
    const { toPng } = await import('html-to-image')
    const dataUrl = await toPng(element, {
      backgroundColor: isDark ? '#1a1525' : '#ffffff',
      style: {
        borderRadius: '16px',
        border: isDark ? '1px solid #3b2d5a' : '1px solid #e2e8f0',
        boxShadow: 'none',
        padding: '24px',
        margin: '0',
        display: 'block',
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
      a.download = `talk-${id}.png`
      a.click()
      return 'saved'
    }
  } finally {
    if (actionsDiv) actionsDiv.style.visibility = ''
    moreOverlays.forEach(el => el.style.display = '')
    zoomOverlays.forEach(el => el.style.display = '')
    linkBar.remove()
  }
}
