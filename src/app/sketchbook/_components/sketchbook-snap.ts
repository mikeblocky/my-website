export async function snapSketchbookCard(id: string) {
  const element = document.getElementById(`drawing-${id}`)
  if (!element) return null

  const url = `${window.location.origin}/sketchbook/${id}`
  const isDark = document.documentElement.classList.contains('dark')

  // Save original styles so we can restore them after capture
  const origStyle = element.style.cssText
  const origClassName = element.className

  // Hide action buttons
  const actionsDiv = element.querySelector('.drawing-actions') as HTMLElement
  if (actionsDiv) actionsDiv.style.visibility = 'hidden'

  const moreOverlays = element.querySelectorAll('.gallery-more-overlay') as NodeListOf<HTMLElement>
  const zoomOverlays = element.querySelectorAll('.gallery-zoom-overlay') as NodeListOf<HTMLElement>
  moreOverlays.forEach(el => el.style.display = 'none')
  zoomOverlays.forEach(el => el.style.display = 'none')

  // Temporarily pull the card out of the narrow CSS column layout
  // and give it a comfortable fixed width so nothing gets cut off
  element.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 420px;
    z-index: -1;
    background: ${isDark ? '#1a1525' : '#ffffff'};
    border-radius: 16px;
    border: 1px solid ${isDark ? '#3b2d5a' : '#e2e8f0'};
    padding: 20px;
    color: ${isDark ? '#f1f5f9' : '#0f172a'};
    overflow: visible;
    box-shadow: none;
    display: block;
  `

  // Add link bar at the bottom
  const linkBar = document.createElement('div')
  linkBar.style.cssText = `margin-top:12px;padding-top:10px;border-top:1px solid ${isDark ? '#ffffff15' : '#00000010'};font-size:12px;color:${isDark ? '#94a3b8' : '#64748b'};font-family:system-ui,sans-serif;letter-spacing:0.02em;`
  linkBar.textContent = `Link: ${url}`
  element.appendChild(linkBar)

  // Let the browser reflow at the new width
  await new Promise(r => setTimeout(r, 50))

  try {
    const { toPng } = await import('html-to-image')
    const dataUrl = await toPng(element, {
      backgroundColor: isDark ? '#1a1525' : '#ffffff',
      pixelRatio: 2,
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
    // Restore the original element styles and class
    linkBar.remove()
    element.style.cssText = origStyle
    element.className = origClassName
    if (actionsDiv) actionsDiv.style.visibility = ''
    moreOverlays.forEach(el => el.style.display = '')
    zoomOverlays.forEach(el => el.style.display = '')
  }
}
