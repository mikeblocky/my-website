<script lang="ts">
  import { onMount } from 'svelte'
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

  // Group emojis into rows of 8
  const rows: typeof EMOJIS[] = []
  for (let i = 0; i < EMOJIS.length; i += 8) rows.push(EMOJIS.slice(i, i + 8))

  function toggle(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    open = !open
  }

  function insert(emoji: string) {
    const target = getTarget()
    if (!target) return
    const fn = (target as any).__emojiInsert
    if (fn) {
      fn(emoji)
    } else {
      // Fallback
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
    if (open && panelEl && !panelEl.contains(e.target as Node) && !buttonEl.contains(e.target as Node)) {
      open = false
    }
  }

  onMount(() => {
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  })
</script>

<div class="relative inline-flex">
  <button
    bind:this={buttonEl}
    type="button"
    on:click={toggle}
    class="flex items-center justify-center w-7 h-7 rounded-md text-slate-400 transition-colors {accentClasses[accent]} cursor-pointer"
    title="Insert emoji"
    aria-label="Emoji picker"
  >
    <span class="text-[17px] leading-none select-none">😊</span>
  </button>

  {#if open}
    <div
      bind:this={panelEl}
      class="absolute bottom-full left-0 mb-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-100/60 dark:shadow-none overflow-hidden"
      style="width: 288px"
    >
      <div class="overflow-y-auto max-h-52 p-2">
        {#each rows as row}
          <div class="flex">
            {#each row as { emoji, shortcode }}
              <button
                type="button"
                title=":{shortcode}:"
                on:mousedown|preventDefault={() => insert(emoji)}
                class="flex-1 flex items-center justify-center h-8 rounded-lg text-[18px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-0 bg-transparent leading-none"
              >
                {emoji}
              </button>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
