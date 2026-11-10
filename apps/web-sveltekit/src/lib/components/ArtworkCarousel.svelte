<script lang="ts">
  import { ArrowLeft, ArrowRight, Maximize2 } from '@lucide/svelte';
  import { onMount } from 'svelte';
  export let title: string;
  export let items: { src: string; previewSrc?: string; width: number; height: number }[] = [];
  export let onOpen: (index: number) => void;
  let track: HTMLDivElement;
  let current = 0;
  let pointer: { id: number; x: number; y: number } | null = null;
  let suppressClick = false;
  let dragX = 0;
  let dragging = false;
  let lastWheel = 0;
  // Keep current in the reactive expression: template helper calls alone do not
  // tell legacy Svelte that their calculated layer positions depend on it.
  $: cards = items.map((item, index) => {
    const difference = ((index - current) % items.length + items.length) % items.length;
    const offset = difference > items.length / 2 ? difference - items.length : difference;
    return { item, index, offset };
  });
  const decoded = new Map<string, Promise<void>>();
  let ready = false;
  let requested: number | null = null;
  let preparing = false;
  function prepare(index: number) {
    const src = items[index]?.previewSrc ?? items[index]?.src;
    if (!src) return Promise.resolve();
    let promise = decoded.get(src);
    if (!promise) {
      const image = new Image(); image.src = src;
      promise = image.decode().catch(() => {});
      decoded.set(src, promise);
    }
    return promise;
  }
  function warmNeighbors(index: number) {
    if (!ready || !items.length) return;
    for (const distance of [0, -1, 1, -2, 2]) void prepare((index + distance + items.length) % items.length);
  }
  onMount(() => { ready = true; warmNeighbors(current); });
  async function go(index: number) {
    if (!items.length) return;
    requested = ((index % items.length) + items.length) % items.length;
    if (preparing) return;
    preparing = true;
    try {
      while (requested !== null) {
        const next = requested; requested = null;
        if (ready) await prepare(next);
        if (requested !== null) continue;
        current = next; warmNeighbors(current);
      }
    } finally { preparing = false; }
  }
  function startSwipe(event: PointerEvent) {
    if (!event.isPrimary) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    dragX = 0; dragging = false;
    suppressClick = false;
  }
  function moveSwipe(event: PointerEvent) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    if (!dragging && Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
    dragging = true; suppressClick = true;
    track.setPointerCapture(event.pointerId);
    const distance = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
    dragX = Math.max(-160, Math.min(160, distance));
  }
  function browseWheel(node: HTMLElement) {
    const listener = (event: WheelEvent) => horizontalWheel(event);
    node.addEventListener('wheel', listener, { passive: false, capture: true });
    return { destroy() { node.removeEventListener('wheel', listener, true); } };
  }
  let wheelDistance = 0;
  function horizontalWheel(event: WheelEvent) {
    if (event.ctrlKey || event.metaKey || items.length < 2) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    const now = performance.now();
    if (now - lastWheel < 420) return;
    wheelDistance = Math.sign(delta) === Math.sign(wheelDistance) ? wheelDistance + delta : delta;
    if (Math.abs(wheelDistance) >= 1) { go(current + Math.sign(wheelDistance)); wheelDistance = 0; lastWheel = now; }
  }
  function finishSwipe(event: PointerEvent) {
    if (!pointer) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    pointer = null; dragging = false; dragX = 0;
    const distance = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
    if (Math.abs(distance) > 25) { suppressClick = true; go(current + (distance < 0 ? 1 : -1)); }
  }
  function select(index: number) {
    if (suppressClick) { suppressClick = false; return; }
    if (index !== current) go(index);
    else onOpen(index);
  }
  function keyboard(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); go(current + (event.key === 'ArrowRight' ? 1 : -1)); }
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); go(event.key === 'Home' ? 0 : items.length - 1); }
  }
</script>

<section class="art-carousel" aria-label={title} use:browseWheel>
  <header class="art-carousel-header"><div><h2>{title}</h2><p>{items.length} works <span aria-hidden="true">·</span> Scroll or swipe to browse</p></div>
    {#if items.length}<span class="art-carousel-count" aria-live="polite">{String(current + 1).padStart(2, '0')} <span>/ {String(items.length).padStart(2, '0')}</span></span>{/if}
  </header>
  {#if items.length}
    <!-- Custom carousel region supports keyboard arrows and pointer swipes alongside native buttons. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_noninteractive_element_interactions -->
    <div class="art-carousel-track" bind:this={track} class:dragging style={`--drag-x: ${dragX}px; --drag-rotation: ${dragX / 25}deg;`} on:pointerdown={startSwipe} on:pointermove={moveSwipe} on:pointerup={finishSwipe} on:pointercancel={() => { pointer = null; dragX = 0; dragging = false; }} on:keydown={keyboard} role="region" aria-roledescription="carousel" aria-label={`${title} artworks`} tabindex="0">
      {#each cards as card (card.item.src)}
        {@const item = card.item}
        {@const index = card.index}
        <button type="button" class="art-carousel-card" class:selected={index === current} class:distant={Math.abs(card.offset) > 3} style={`--art-ratio: ${item.width / item.height}; --offset: ${Math.max(-4, Math.min(4, card.offset))}; --depth: ${Math.min(4, Math.abs(card.offset))}; z-index: ${10 - Math.abs(card.offset)};`} tabindex={Math.abs(card.offset) <= 3 ? 0 : -1} aria-hidden={Math.abs(card.offset) > 3} aria-label={`Open ${title} artwork ${index + 1} of ${items.length}`} on:click={() => select(index)}>
          {#if Math.abs(card.offset) <= 3}<img src={item.previewSrc ?? item.src} width={item.width} height={item.height} alt={`${title} artwork ${index + 1}`} loading={Math.abs(card.offset) <= 1 ? 'eager' : 'lazy'} decoding="async" draggable="false" />{/if}
          <span class="art-carousel-open" aria-hidden="true"><Maximize2 size={15} /></span>
        </button>
      {/each}
    </div>
    <footer class="art-carousel-controls">
      <button type="button" aria-label={`Previous ${title} artwork`} disabled={items.length < 2} on:click={() => go(current - 1)}><ArrowLeft size={18} /></button>
      <input type="range" min="0" max={Math.max(0, items.length - 1)} value={current} aria-label={`Browse ${title}`} aria-valuetext={`Artwork ${current + 1} of ${items.length}`} disabled={items.length < 2} on:input={(event) => go(Number(event.currentTarget.value))} />
      <button type="button" aria-label={`Next ${title} artwork`} disabled={items.length < 2} on:click={() => go(current + 1)}><ArrowRight size={18} /></button>
    </footer>
  {:else}<p class="art-carousel-empty">New drawings will appear here.</p>{/if}
</section>

<style>
  .art-carousel { min-width: 0; margin-bottom: 3.5rem; }
  .art-carousel-header { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 22px; }
  h2 { font-size: clamp(1rem, 2vw, 1.3rem); font-weight: 550; line-height: 1.4; margin: 0; letter-spacing: -.025em; }
  .art-carousel-header p { margin: 6px 0 0; color: hsl(var(--muted-foreground)); font-size: .7rem; }
  .art-carousel-header p span { margin-inline: 5px; }
  .art-carousel-count { flex-shrink: 0; font-size: .7rem; font-variant-numeric: tabular-nums; }
  .art-carousel-count span { color: hsl(var(--muted-foreground)); }
  .art-carousel-track { position: relative; display: grid; place-items: center; isolation: isolate; height: clamp(340px, 64vh, 620px); overflow: visible; padding: 26px 0; border-radius: 0; touch-action: none; }
  .art-carousel-card { position: absolute; left: 50%; top: 50%; width: min(72%, calc(350px * var(--art-ratio))); max-height: 52vh; aspect-ratio: var(--art-ratio); padding: 0; border: 0; border-radius: 0; background: transparent; box-shadow: none; cursor: pointer; transform: translate(-50%, -50%) translateX(calc(var(--offset) * 82px)) translateY(calc(var(--depth) * 10px)) rotate(calc(var(--offset) * 10deg)) scale(calc(1 - var(--depth) * .045)); opacity: calc(1 - var(--depth) * .13); transition: transform 420ms cubic-bezier(.22,.8,.25,1), opacity 300ms ease; will-change: transform; }
  .art-carousel-card.distant { opacity: 0; visibility: hidden; pointer-events: none; will-change: auto; transition: none; }
  .art-carousel-card.selected { opacity: 1; transform: translate(-50%, -50%) translateX(var(--drag-x, 0px)) rotate(calc(-1deg + var(--drag-rotation, 0deg))); cursor: zoom-in; box-shadow: none; }
  .art-carousel-track.dragging .art-carousel-card.selected { transition: none; cursor: grabbing; }
  .art-carousel-card img { display: block; width: 100%; height: 100%; object-fit: contain; border-radius: 0;  }
  .art-carousel-open { position: absolute; bottom: 22px; right: 22px; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: hsl(var(--background) / .9); color: hsl(var(--foreground)); opacity: 0; transform: translateY(4px); transition: opacity 200ms ease, transform 300ms ease; }
  .art-carousel-card:hover .art-carousel-open, .art-carousel-card:focus-visible .art-carousel-open { opacity: 1; transform: translateY(0); }
  .art-carousel-controls { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; }
  .art-carousel-controls button { display: grid; place-items: center; width: 40px; height: 40px; border: 1px solid hsl(var(--border) / .6); border-radius: 50%; color: hsl(var(--foreground)); background: hsl(var(--background)); cursor: pointer; transition: background 180ms ease, transform 300ms cubic-bezier(.22,1,.36,1); }
  .art-carousel-controls button:hover { background: hsl(var(--muted)); transform: translateY(-2px); }
  .art-carousel-controls button:disabled { opacity: .25; cursor: default; transform: none; }
  .art-carousel-controls input { width: min(120px, 30vw); height: 3px; accent-color: hsl(var(--site-blue)); cursor: pointer; }
  .art-carousel-empty { font-size: .8rem; color: hsl(var(--muted-foreground)); padding: 2rem 0; }
  @media (max-width: 600px) { .art-carousel-track { height: clamp(340px, 58vh, 500px); padding-inline: 0; } .art-carousel-card { width: min(76%, calc(280px * var(--art-ratio))); max-height: 46vh; padding: 0; transform: translate(-50%, -50%) translateX(calc(var(--offset) * 40px)) translateY(calc(var(--depth) * 8px)) rotate(calc(var(--offset) * 10deg)) scale(calc(1 - var(--depth) * .045)); } .art-carousel-card.selected { opacity: 1; transform: translate(-50%, -50%) translateX(var(--drag-x, 0px)) rotate(calc(-1deg + var(--drag-rotation, 0deg))); } }
  @media (prefers-reduced-motion: reduce) { .art-carousel-card, .art-carousel-open, .art-carousel-controls button { transition: none; } }
</style>
