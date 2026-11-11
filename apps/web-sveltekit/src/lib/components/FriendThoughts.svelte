<script lang="ts">
  import { X } from '@lucide/svelte';
  import { fly } from 'svelte/transition';
  import { friendThoughts } from '$lib/friend-thoughts';
  export let username: string;
  export let x = 0;
  export let y = 0;
  export let inline = false;
  export let instance = '';
  export let onHeight: (height: number) => void = () => {};
  function measure(node: HTMLElement) {
    const observer = new ResizeObserver(() => onHeight(node.getBoundingClientRect().height));
    observer.observe(node);
    return { destroy() { observer.disconnect(); } };
  }
  export let onClose: () => void;
  function appear(node: Element) {
    return fly(node, { y: 8, duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240 });
  }
</script>

<aside id={instance || (inline ? "friend-thoughts-mobile" : "friend-thoughts")} class="thought-cloud" class:inline use:measure style={`left: ${x}px; top: ${y}px;`} aria-label={`Thoughts about @${username}`} in:appear>
  <header><span>@{username}</span><button type="button" on:click={onClose} aria-label="Close thoughts"><X size={14} /></button></header>
  <div class="thoughts">
    {#each friendThoughts[username] ?? [] as thought, index}
      <div class:photo={thought.image} class:long={thought.long} class:portrait={thought.portrait} class="thought" style={`--i: ${index}; --tilt: ${index % 2 ? 3 : -3}deg;`}>
        {#if thought.image}<img src={`/friends/thoughts/${thought.image}.webp`} alt={thought.text} width="280" height="156" decoding="async" />{/if}
        <span>{thought.text}</span>
      </div>
    {/each}
  </div>
</aside>

<style>
  .thought-cloud { position: absolute; z-index: 5; padding: 6px; width: min(340px, calc(100% - 24px)); color: hsl(var(--foreground)); }
  header { display: flex; align-items: center; justify-content: space-between; margin: 0 8px 9px; gap: 12px; }
  header > span { font-size: var(--font-size-2xs); padding: 5px 9px; border-radius: 20px; background: hsl(var(--background)); box-shadow: 0 2px 12px hsl(var(--foreground) / .06); }
  header button { display: grid; place-items: center; width: 44px; height: 44px; border: 1px solid hsl(var(--border)); border-radius: 50%; background: hsl(var(--background)); color: hsl(var(--muted-foreground)); cursor: pointer; }
  header button:hover { color: hsl(var(--foreground)); }
  .thoughts { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px 9px; }
  .thought { position: relative; max-width: 100%; padding: 10px 15px; border-radius: 22px 22px 22px 7px; background: hsl(var(--background)); border: 1px solid hsl(var(--border) / .75); box-shadow: 0 6px 20px hsl(var(--foreground) / .07); font-size: var(--font-size-2xs); line-height: 1.35; transform: rotate(var(--tilt)); animation: thought-arrive 380ms cubic-bezier(.22,1,.36,1) both; animation-delay: calc(var(--i) * 45ms); }
  .thought:nth-child(2) { background: color-mix(in srgb, hsl(var(--background)) 90%, #a9c5ff); }
  .thought:nth-child(3) { background: color-mix(in srgb, hsl(var(--background)) 90%, #f4b6cd); }
  .photo { padding: 5px 5px 9px; border-radius: 9px; flex: 1 1 100px; min-width: 0; }
  .photo img { display: block; width: 100%; height: 104px; border-radius: 5px; object-fit: cover; }
  .thoughts .photo.portrait img { height: auto; aspect-ratio: auto; }
  .photo > span { display: block; text-align: center; padding: 8px 3px 0; font-size: var(--font-size-2xs); }
  .thoughts:has(.photo + .photo) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .thoughts:has(.photo + .photo) .thought:not(.photo) { grid-column: 1 / -1; justify-self: center; }
  .thoughts:has(.photo + .photo) .photo img { height: auto; aspect-ratio: 16 / 10; }
  .long { flex-basis: 100%;  line-height: 1.6; transform: none; animation: none; }
  .inline { max-height: none; overflow: visible; position: relative; left: auto !important; top: auto !important; width: 100%; padding: 12px 8px 22px; }
  .inline .long { max-height: none; font-size: var(--font-size-sm); }
  .thoughts:has(.photo + .photo) .photo.portrait img { height: auto; aspect-ratio: 3 / 4; }
  @keyframes thought-arrive { from { opacity: 0; transform: translateY(8px) scale(.94) rotate(0); } to { opacity: 1; transform: translateY(0) scale(1) rotate(var(--tilt)); } }
  @media (prefers-reduced-motion: reduce) { .thought { animation: none; } }
</style>
