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

  $: if (results.length && anchorEl) {
    tick().then(() => {
      const rect = anchorEl!.getBoundingClientRect()
      top = rect.bottom + 4
      left = rect.left
    })
  }

  function portal(node: HTMLElement) {
    document.body.appendChild(node)
    return { destroy() { node.remove() } }
  }
</script>

{#if results.length > 0}
  <div
    use:portal
    role="listbox"
    aria-label="Emoji suggestions"
    class="emoji-suggestions"
    style="top: {top}px; left: {left}px"
  >
    <span class="emoji-suggestions__hint">:{query}</span>
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
{/if}

<style>
  .emoji-suggestions {
    position: fixed;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    min-width: 220px;
    max-width: 320px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06);
    padding: 6px;
  }

  :global(.dark) .emoji-suggestions {
    background: #0f172a;
    border-color: #1e293b;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }

  .emoji-suggestions__hint {
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    padding: 4px 8px 6px;
    font-family: ui-monospace, monospace;
    letter-spacing: 0.02em;
  }

  .emoji-suggestions__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px;
    border-radius: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition: background 120ms;
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
</style>
