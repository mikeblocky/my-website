<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { Search, Smile } from '@lucide/svelte'
  import { EMOJIS } from '$lib/data/emojis'

  export let getTarget: () => HTMLTextAreaElement | HTMLInputElement | null
  export let accent: 'indigo' | 'sky' | 'violet' | 'emerald' | 'amber' = 'indigo'

  const accentClasses: Record<typeof accent, string> = {
    indigo: 'hover:text-indigo-500 dark:hover:text-indigo-400',
    sky:    'hover:text-sky-500 dark:hover:text-sky-400',
    violet: 'hover:text-violet-500 dark:hover:text-violet-400',
    emerald:'hover:text-emerald-500 dark:hover:text-emerald-400',
    amber:  'hover:text-amber-500 dark:hover:text-amber-400',
  }

  let open = false
  let buttonEl: HTMLButtonElement
  let panelEl: HTMLDivElement
  let searchEl: HTMLInputElement
  let panelTop = 0
  let panelLeft = 0
  let ready = false
  let query = ''
  let hovered: { shortcode: string; emoji: string } | null = null

  // De-dupe by emoji glyph so the grid doesn't show visual repeats
  const ALL_EMOJIS = (() => {
    const seen = new Set<string>()
    return EMOJIS.filter((e) => (seen.has(e.emoji) ? false : seen.add(e.emoji)))
  })()

  $: q = query.trim().toLowerCase()
  $: filtered = q ? EMOJIS.filter((e) => e.shortcode.includes(q)) : ALL_EMOJIS

  async function reposition() {
    await tick()
    if (!buttonEl || !panelEl) return
    const btn = buttonEl.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const pw = panelEl.offsetWidth
    const ph = panelEl.offsetHeight
    const margin = 8

    // Prefer placing the panel above the button; flip below if it won't fit.
    let top = btn.top - ph - margin
    if (top < margin) {
      const below = btn.bottom + margin
      top = below + ph <= vh - margin ? below : Math.max(margin, vh - ph - margin)
    }

    // Align to button's left edge, then clamp within the viewport.
    let left = btn.left
    if (left + pw > vw - margin) left = vw - margin - pw
    if (left < margin) left = margin

    panelTop = top
    panelLeft = left
    ready = true
  }

  async function toggle(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    open = !open
    if (open) {
      ready = false
      query = ''
      hovered = null
      await reposition()
      searchEl?.focus()
    }
  }

  function insert(emoji: string) {
    const target = getTarget()
    if (!target) return
    const fn = (target as any).__emojiInsert
    if (fn) {
      fn(emoji)
    } else {
      const start = target.selectionStart ?? target.value.length
      const end = target.selectionEnd ?? start
      target.value = target.value.slice(0, start) + emoji + target.value.slice(end)
      target.setSelectionRange(start + emoji.length, start + emoji.length)
      target.dispatchEvent(new Event('input', { bubbles: true }))
      target.focus()
    }
    open = false
  }

  function onOutsideClick(e: MouseEvent) {
    const node = e.target as Node
    if (open && !buttonEl.contains(node) && !panelEl?.contains(node)) {
      open = false
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (open && e.key === 'Escape') {
      e.preventDefault()
      open = false
      buttonEl?.focus()
    }
  }

  function onViewportChange() {
    if (open) reposition()
  }

  onMount(() => {
    document.addEventListener('mousedown', onOutsideClick)
    document.addEventListener('keydown', onKeydown)
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
    return () => {
      document.removeEventListener('mousedown', onOutsideClick)
      document.removeEventListener('keydown', onKeydown)
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange, true)
    }
  })

  function portal(node: HTMLElement) {
    document.body.appendChild(node)
    return { destroy() { node.remove() } }
  }
</script>

<button
  bind:this={buttonEl}
  type="button"
  on:click={toggle}
  class="flex items-center justify-center w-7 h-7 rounded-md text-slate-400 transition-colors {accentClasses[accent]} cursor-pointer"
  title="Insert emoji"
  aria-label="Emoji picker"
  aria-expanded={open}
>
  <Smile size={17} strokeWidth={2} />
</button>

{#if open}
  <div
    use:portal
    bind:this={panelEl}
    style="top: {panelTop}px; left: {panelLeft}px;"
    class="emoji-picker"
    class:emoji-picker--ready={ready}
    role="dialog"
    aria-label="Emoji picker"
  >
    <!-- Search -->
    <div class="emoji-picker__search">
      <Search size={15} class="emoji-picker__search-icon" />
      <input
        bind:this={searchEl}
        bind:value={query}
        type="text"
        placeholder="Search emoji"
        spellcheck="false"
        autocomplete="off"
        class="emoji-picker__search-input"
      />
    </div>

    <!-- Grid -->
    <div class="emoji-picker__body">
      {#if filtered.length === 0}
        <div class="emoji-picker__empty">
          <span class="emoji-picker__empty-glyph">🔍</span>
          <span>No emoji found</span>
        </div>
      {:else}
        <div class="emoji-picker__grid">
          {#each filtered as { emoji, shortcode } (shortcode)}
            <button
              type="button"
              title=":{shortcode}:"
              on:mousedown|preventDefault={() => insert(emoji)}
              on:mouseenter={() => (hovered = { emoji, shortcode })}
              on:focus={() => (hovered = { emoji, shortcode })}
              class="emoji-picker__item"
            >
              {emoji}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Footer preview -->
    <div class="emoji-picker__footer">
      {#if hovered}
        <span class="emoji-picker__footer-glyph">{hovered.emoji}</span>
        <span class="emoji-picker__footer-code">:{hovered.shortcode}:</span>
      {:else}
        <Smile size={16} class="emoji-picker__footer-icon" />
        <span class="emoji-picker__footer-hint">Pick an emoji…</span>
      {/if}
    </div>
  </div>
{/if}

<style>
  .emoji-picker {
    position: fixed;
    z-index: 9999;
    width: min(calc(100vw - 16px), 340px);
    display: flex;
    flex-direction: column;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    opacity: 0;
    transform: scale(0.97);
    transition: opacity 120ms ease, transform 120ms ease;
    pointer-events: none;
  }

  .emoji-picker--ready {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }

  :global(.dark) .emoji-picker {
    background: #0f172a;
    border-color: #1e293b;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  }

  /* Search */
  .emoji-picker__search {
    position: relative;
    display: flex;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #f1f5f9;
  }

  :global(.dark) .emoji-picker__search {
    border-bottom-color: #1e293b;
  }

  .emoji-picker__search :global(.emoji-picker__search-icon) {
    position: absolute;
    left: 20px;
    color: #94a3b8;
    pointer-events: none;
  }

  .emoji-picker__search-input {
    width: 100%;
    border: none;
    outline: none;
    background: #f1f5f9;
    border-radius: 8px;
    padding: 8px 10px 8px 32px;
    font-size: 14px;
    color: #334155;
    font-family: var(--font-sans);
  }

  .emoji-picker__search-input::placeholder {
    color: #94a3b8;
  }

  :global(.dark) .emoji-picker__search-input {
    background: #1e293b;
    color: #e2e8f0;
  }

  /* Grid */
  .emoji-picker__body {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    max-height: min(42vh, 280px);
    padding: 8px;
  }

  .emoji-picker__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(2.1rem, 1fr));
    gap: 2px;
  }

  .emoji-picker__item {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    border: none;
    background: transparent;
    border-radius: 8px;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    transition: background 100ms ease, transform 100ms ease;
  }

  .emoji-picker__item:hover,
  .emoji-picker__item:focus-visible {
    background: #f1f5f9;
    transform: scale(1.12);
    outline: none;
  }

  :global(.dark) .emoji-picker__item:hover,
  :global(.dark) .emoji-picker__item:focus-visible {
    background: #1e293b;
  }

  .emoji-picker__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 28px 12px;
    color: #94a3b8;
    font-size: 13px;
    font-family: var(--font-sans);
  }

  .emoji-picker__empty-glyph {
    font-size: 26px;
    opacity: 0.6;
  }

  /* Footer */
  .emoji-picker__footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-top: 1px solid #f1f5f9;
    min-height: 38px;
  }

  :global(.dark) .emoji-picker__footer {
    border-top-color: #1e293b;
  }

  .emoji-picker__footer-glyph {
    font-size: 22px;
    line-height: 1;
  }

  .emoji-picker__footer-code {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    font-family: ui-monospace, monospace;
  }

  :global(.dark) .emoji-picker__footer-code {
    color: #94a3b8;
  }

  .emoji-picker__footer :global(.emoji-picker__footer-icon) {
    color: #94a3b8;
  }

  .emoji-picker__footer-hint {
    font-size: 13px;
    color: #94a3b8;
    font-family: var(--font-sans);
  }

  /* Slimmer scrollbar to match the compact panel */
  .emoji-picker__body::-webkit-scrollbar {
    width: 8px;
  }

  .emoji-picker__body::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 8px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  :global(.dark) .emoji-picker__body::-webkit-scrollbar-thumb {
    background: #334155;
    background-clip: padding-box;
  }
</style>
