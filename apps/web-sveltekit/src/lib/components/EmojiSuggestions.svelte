<script lang="ts">
  import { tick } from 'svelte'
  import type { EmojiMatch } from '$lib/actions/emojiAutocomplete'

  export let results: EmojiMatch[] = []
  export let selectedIndex = 0
  export let onSelect: (match: EmojiMatch) => void
  export let query = ''
  export let anchorEl: HTMLElement | null = null

  let top = 0
  let left = 0
  let listEl: HTMLDivElement

  $: if (results.length && anchorEl) {
    tick().then(reposition)
  }

  function reposition() {
    if (!anchorEl || !listEl) return
    const rect = anchorEl.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const margin = 8
    const w = listEl.offsetWidth
    const h = listEl.offsetHeight

    // Below the anchor by default; flip above if it would overflow the bottom.
    let nextTop = rect.bottom + 4
    if (nextTop + h > vh - margin) {
      const above = rect.top - h - 4
      nextTop = above >= margin ? above : Math.max(margin, vh - h - margin)
    }

    let nextLeft = rect.left
    if (nextLeft + w > vw - margin) nextLeft = vw - margin - w
    if (nextLeft < margin) nextLeft = margin

    top = nextTop
    left = nextLeft
  }

  function portal(node: HTMLElement) {
    document.body.appendChild(node)
    return { destroy() { node.remove() } }
  }
</script>

{#if results.length > 0}
  <div
    use:portal
    bind:this={listEl}
    role="listbox"
    aria-label="Emoji suggestions"
    class="emoji-suggestions"
    style="top: {top}px; left: {left}px"
  >
    <div class="emoji-suggestions__header">
      Emoji matching <span class="emoji-suggestions__header-code">:{query}</span>
    </div>
    <div class="emoji-suggestions__list">
      {#each results as match, i}
        <button
          type="button"
          role="option"
          aria-selected={i === selectedIndex}
          class="emoji-suggestions__item"
          class:emoji-suggestions__item--active={i === selectedIndex}
          on:mousedown|preventDefault={() => onSelect(match)}
        >
          <span class="emoji-suggestions__glyph">{match.emoji}</span>
          <span class="emoji-suggestions__code">:{match.shortcode}:</span>
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .emoji-suggestions {
    position: fixed;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    min-width: 220px;
    max-width: min(320px, calc(100vw - 16px));
    max-height: min(50vh, 320px);
    overflow: hidden;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  :global(.dark) .emoji-suggestions {
    background: #0f172a;
    border-color: #1e293b;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  }

  /* Discord-style header strip */
  .emoji-suggestions__header {
    flex-shrink: 0;
    padding: 8px 12px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #94a3b8;
    font-family: var(--font-sans);
  }

  :global(.dark) .emoji-suggestions__header {
    border-bottom-color: #1e293b;
  }

  .emoji-suggestions__header-code {
    text-transform: none;
    letter-spacing: 0;
    color: #475569;
    font-family: ui-monospace, monospace;
  }

  :global(.dark) .emoji-suggestions__header-code {
    color: #cbd5e1;
  }

  .emoji-suggestions__list {
    overflow-y: auto;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    padding: 6px;
  }

  .emoji-suggestions__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 10px;
    border-radius: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: background 100ms ease;
  }

  .emoji-suggestions__item:hover,
  .emoji-suggestions__item--active {
    background: #f1f5f9;
  }

  :global(.dark) .emoji-suggestions__item:hover,
  :global(.dark) .emoji-suggestions__item--active {
    background: #1e293b;
  }

  .emoji-suggestions__glyph {
    font-size: 20px;
    line-height: 1;
    flex-shrink: 0;
  }

  .emoji-suggestions__code {
    font-size: 13px;
    font-weight: 500;
    color: #475569;
    font-family: ui-monospace, monospace;
  }

  :global(.dark) .emoji-suggestions__code {
    color: #94a3b8;
  }

  /* Slim scrollbar to match the picker panel */
  .emoji-suggestions__list::-webkit-scrollbar {
    width: 8px;
  }

  .emoji-suggestions__list::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 8px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  :global(.dark) .emoji-suggestions__list::-webkit-scrollbar-thumb {
    background: #334155;
    background-clip: padding-box;
  }
</style>
