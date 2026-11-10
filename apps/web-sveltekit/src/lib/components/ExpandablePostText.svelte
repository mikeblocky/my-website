<script lang="ts">
  import { onMount } from 'svelte';
  import RichText from './RichText.svelte';
  export let text: string;
  let expanded = false;
  let content: HTMLDivElement;
  let height = 0;
  const collapsedHeight = 156;
  $: overflowing = height > collapsedHeight + 16;
  onMount(() => {
    const observer = new ResizeObserver(() => height = content.scrollHeight);
    observer.observe(content);
    height = content.scrollHeight;
    return () => observer.disconnect();
  });
</script>

<div class="expandable-post-text" class:collapsed={overflowing && !expanded} style:height={height ? `${overflowing && !expanded ? collapsedHeight : height}px` : 'auto'}>
  <div bind:this={content}><RichText {text} theme="blue" /></div>
</div>
{#if overflowing}
  <button class="timeline-text-toggle" type="button" aria-expanded={expanded} on:click={() => expanded = !expanded}>{expanded ? 'See less' : 'See more'}</button>
{/if}

<style>
  .expandable-post-text { overflow: hidden; transition: height 440ms cubic-bezier(0.22, 1, 0.36, 1); }
  .expandable-post-text.collapsed { mask-image: linear-gradient(to bottom, black 65%, transparent 100%); }
  .timeline-text-toggle { display: block; border: 0; padding: 0.45rem 0; background: transparent; color: hsl(var(--site-blue)); font: inherit; font-size: var(--font-size-xs); cursor: pointer; }
  .timeline-text-toggle:hover { text-decoration: underline; }
  @media (prefers-reduced-motion: reduce) { .expandable-post-text { transition: none; } }
</style>
