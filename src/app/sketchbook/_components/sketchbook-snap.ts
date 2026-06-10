export async function snapSketchbookCard(id: string) {
  const element = document.getElementById(`drawing-${id}`)
  if (!element) return null

  const url = `${window.location.origin}/sketchbook/${id}`
  const isDark = document.documentElement.classList.contains('dark')

  // Hide action buttons
  const actionsDiv = element.querySelector('.drawing-actions') as HTMLElement
  if (actionsDiv) actionsDiv.style.visibility = 'hidden'

  const moreOverlays = element.querySelectorAll('.gallery-more-overlay') as NodeListOf<HTMLElement>
  const zoomOverlays = element.querySelectorAll('.gallery-zoom-overlay') as NodeListOf<HTMLElement>
  moreOverlays.forEach(el => el.style.display = 'none')
  zoomOverlays.forEach(el => el.style.display = 'none')

  // Add link bar at the bottom
  const linkBar = document.createElement('div')
  linkBar.style.cssText = `flex:0 0 100%;width:100%;box-sizing:border-box;margin-top:12px;padding:10px 24px 16px;border-top:1px solid ${isDark ? '#ffffff15' : '#00000010'};font-size:12px;color:${isDark ? '#94a3b8' : '#64748b'};font-family:system-ui,sans-serif;letter-spacing:0.02em;`
  linkBar.textContent = `Link: ${url}`
  element.appendChild(linkBar)

  // Set element flex-wrap temporarily so that linkBar sits on its own row below the main card content
  const previousFlexWrap = element.style.flexWrap
  element.style.flexWrap = 'wrap'

  try {
    const { toPng } = await import('html-to-image')
    const dataUrl = await toPng(element, {
      backgroundColor: isDark ? '#1a1525' : '#ffffff',
      style: {
        borderRadius: '16px',
        border: isDark ? '1px solid #3b2d5a' : '1px solid #e2e8f0',
        boxShadow: 'none',
        margin: '0',
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
      a.download = `artwork-${id}.png`
      a.click()
      return 'saved'
    }
  } finally {
    if (actionsDiv) actionsDiv.style.visibility = ''
    moreOverlays.forEach(el => el.style.display = '')
    zoomOverlays.forEach(el => el.style.display = '')
    element.style.flexWrap = previousFlexWrap
    linkBar.remove()
  }
}
