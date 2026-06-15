import { toPng } from 'html-to-image'

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

export async function snapSuggestionCard(id: string) {
  const element = document.getElementById(`suggestion-${id}`)
  if (!element) return null

  const url = `${window.location.origin}/suggestions/${id}`
  const isDark = document.documentElement.classList.contains('dark')
  const actionsDiv = element.querySelector('.suggestion-actions') as HTMLElement
  const previousFlexWrap = element.style.flexWrap

  if (actionsDiv) actionsDiv.style.visibility = 'hidden'
  element.style.flexWrap = 'wrap'

  const moreOverlays = element.querySelectorAll('.gallery-more-overlay') as NodeListOf<HTMLElement>
  const zoomOverlays = element.querySelectorAll('.gallery-zoom-overlay') as NodeListOf<HTMLElement>
  moreOverlays.forEach(el => el.style.display = 'none')
  zoomOverlays.forEach(el => el.style.display = 'none')

  const linkBar = document.createElement('div')
  linkBar.style.cssText = `flex:0 0 100%;width:100%;box-sizing:border-box;margin-top:12px;padding:10px 24px 16px;border-top:1px solid ${isDark ? '#ffffff15' : '#00000010'};font-size:12px;color:${isDark ? '#94a3b8' : '#64748b'};font-family:system-ui,sans-serif;letter-spacing:0.02em;`
  linkBar.textContent = `Link: ${url}`
  element.appendChild(linkBar)

  try {
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
      a.download = `suggestion-${id}.png`
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

export async function snapSketchbookCard(id: string) {
  const element = document.getElementById(`drawing-${id}`)
  if (!element) return null

  const url = `${window.location.origin}/sketchbook/${id}`
  const isDark = document.documentElement.classList.contains('dark')

  const actionsDiv = element.querySelector('.drawing-actions') as HTMLElement
  if (actionsDiv) actionsDiv.style.visibility = 'hidden'

  const moreOverlays = element.querySelectorAll('.gallery-more-overlay') as NodeListOf<HTMLElement>
  const zoomOverlays = element.querySelectorAll('.gallery-zoom-overlay') as NodeListOf<HTMLElement>
  moreOverlays.forEach(el => el.style.display = 'none')
  zoomOverlays.forEach(el => el.style.display = 'none')

  const linkBar = document.createElement('div')
  linkBar.style.cssText = `flex:0 0 100%;width:100%;box-sizing:border-box;margin-top:12px;padding:10px 24px 16px;border-top:1px solid ${isDark ? '#ffffff15' : '#00000010'};font-size:12px;color:${isDark ? '#94a3b8' : '#64748b'};font-family:system-ui,sans-serif;letter-spacing:0.02em;`
  linkBar.textContent = `Link: ${url}`
  element.appendChild(linkBar)

  const previousFlexWrap = element.style.flexWrap
  element.style.flexWrap = 'wrap'

  try {
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

export async function snapDrawCard(id: string) {
  const element = document.getElementById(`prompt-${id}`)
  if (!element) return null

  const url = `${window.location.origin}/draw/${id}`
  const isDark = document.documentElement.classList.contains('dark')

  const actionsDiv = element.querySelector('.prompt-actions') as HTMLElement
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
    const dataUrl = await toPng(element, {
      backgroundColor: isDark ? '#110c1c' : '#ffffff',
      style: {
        borderRadius: '16px',
        border: isDark ? '1px solid #4c2f77' : '1px solid #f3e8ff',
        boxShadow: 'none',
        padding: '24px',
        margin: '0',
        display: 'block',
        color: isDark ? '#f5f3ff' : '#1e1b4b'
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
      a.download = `draw-${id}.png`
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
