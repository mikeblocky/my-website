export async function snapSketchbookCard(id: string) {
  const element = document.getElementById(`drawing-${id}`)
  if (!element) return null

  const url = `${window.location.origin}/sketchbook/${id}`
  const isDark = document.documentElement.classList.contains('dark')

  // Clone the card off-screen at a comfortable width so nothing gets cut off
  const clone = element.cloneNode(true) as HTMLElement
  clone.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 420px;
    z-index: -1;
    pointer-events: none;
    background: ${isDark ? '#1a1525' : '#ffffff'};
    border-radius: 16px;
    border: 1px solid ${isDark ? '#3b2d5a' : '#e2e8f0'};
    padding: 20px;
    color: ${isDark ? '#f1f5f9' : '#0f172a'};
    overflow: visible;
  `

  // Hide action buttons in clone
  const actionsDiv = clone.querySelector('.drawing-actions') as HTMLElement
  if (actionsDiv) actionsDiv.style.display = 'none'

  const moreOverlays = clone.querySelectorAll('.gallery-more-overlay') as NodeListOf<HTMLElement>
  const zoomOverlays = clone.querySelectorAll('.gallery-zoom-overlay') as NodeListOf<HTMLElement>
  moreOverlays.forEach(el => el.style.display = 'none')
  zoomOverlays.forEach(el => el.style.display = 'none')

  // Make all images inside the clone render at full natural size
  const imgs = clone.querySelectorAll('img') as NodeListOf<HTMLImageElement>
  imgs.forEach(img => {
    img.style.width = '100%'
    img.style.height = 'auto'
    img.style.maxHeight = 'none'
    img.style.objectFit = 'contain'
    img.style.opacity = '1'
  })

  // Add link bar at the bottom
  const linkBar = document.createElement('div')
  linkBar.style.cssText = `margin-top:12px;padding-top:10px;border-top:1px solid ${isDark ? '#ffffff15' : '#00000010'};font-size:12px;color:${isDark ? '#94a3b8' : '#64748b'};font-family:system-ui,sans-serif;letter-spacing:0.02em;`
  linkBar.textContent = `Link: ${url}`
  clone.appendChild(linkBar)

  document.body.appendChild(clone)

  // Wait a tick for images and layout to settle in the clone
  await new Promise(r => setTimeout(r, 100))

  try {
    const { toPng } = await import('html-to-image')
    const dataUrl = await toPng(clone, {
      backgroundColor: isDark ? '#1a1525' : '#ffffff',
      width: 420,
      style: {
        borderRadius: '16px',
        border: isDark ? '1px solid #3b2d5a' : '1px solid #e2e8f0',
        boxShadow: 'none',
        padding: '20px',
        margin: '0',
        display: 'block',
        overflow: 'visible',
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
    clone.remove()
  }
}
