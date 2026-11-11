/** Capture a separate, fully laid out copy without changing the live thread. */
async function snapCard(prefix: string, id: string) {
  const source = document.getElementById(`${prefix}-${id}`);
  if (!source) throw new Error('Post not found');
  await document.fonts.ready;
  const clone = source.cloneNode(true) as HTMLElement;
  const width = Math.ceil(source.getBoundingClientRect().width);
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;pointer-events:none;`;
  wrapper.appendChild(clone);
  // Preserve grid/flex layout; never force a modern timeline post into display:block.
  clone.style.cssText += ';margin:0;transform:none;animation:none;transition:none;box-sizing:border-box;width:100%;padding:24px;border:0;border-radius:0;';
  clone.querySelectorAll('.timeline-action-feedback, .timeline-post-actions, .talk-actions, .prompt-actions, .suggestion-actions, .drawing-actions, .timeline-text-toggle, .gallery-more-overlay, .gallery-zoom-overlay, form').forEach(node => node.remove());
  clone.querySelectorAll<HTMLElement>('.expandable-post-text').forEach(node => {
    node.style.height = 'auto'; node.style.overflow = 'visible'; node.style.maskImage = 'none';
    node.classList.remove('collapsed');
  });
  document.body.appendChild(wrapper);
  try {
    await Promise.all(Array.from(clone.querySelectorAll('img')).map(async image => {
      image.loading = 'eager';
      try { await image.decode(); } catch { /* Keep the existing image fallback. */ }
    }));
    const { toPng } = await import('html-to-image');
    const backgroundColor = getComputedStyle(document.body).backgroundColor;
    const dataUrl = await toPng(clone, {
      backgroundColor, pixelRatio: 2, width,
      height: Math.ceil(clone.getBoundingClientRect().height),
      style: { boxShadow: 'none', animation: 'none', transition: 'none' }
    });
    const blob = await (await fetch(dataUrl)).blob();
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return 'snapped';
    } catch {
      const link = document.createElement('a');
      link.href = dataUrl; link.download = `${prefix}-${id}.png`; link.click();
      return 'saved';
    }
  } finally { wrapper.remove(); }
}

export const snapTalkCard = (id: string) => snapCard('talk', id);
export const snapDrawCard = (id: string) => snapCard('prompt', id);
export const snapSuggestionCard = (id: string) => snapCard('suggestion', id);
export const snapSketchbookCard = (id: string) => snapCard('drawing', id);
