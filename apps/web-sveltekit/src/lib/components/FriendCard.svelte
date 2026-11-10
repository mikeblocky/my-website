<script lang="ts">
  import { ArrowUpRight } from '@lucide/svelte';
  export let username: string;
  export let description: string;
  export let tag: string;
</script>
<article class="friend-note">
  <header><div><h2>@{username}</h2><span>{tag}</span></div><a href={`https://x.com/${username}`} target="_blank" rel="noopener noreferrer" aria-label={`Visit @${username} on X`}>Profile <ArrowUpRight size={15} /></a></header>
  <p>{description}</p>
</article>
<style>
  .friend-note { border-top: 1px solid hsl(var(--border) / .65); padding: 1.5rem 0 .5rem; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  header > div { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
  h2 { margin: 0; color: hsl(var(--foreground)); font-size: var(--font-size-md); font-weight: 600; }
  header span { color: hsl(var(--muted-foreground)); font-size: var(--font-size-2xs); padding: 3px 8px; background: hsl(var(--muted) / .6); border-radius: 999px; }
  a { display: inline-flex; align-items: center; gap: 4px; color: hsl(var(--muted-foreground)); font-size: var(--font-size-2xs); flex-shrink: 0; }
  a:hover { color: hsl(var(--site-blue)); }
  p { margin: 1.2rem 0 0; font-size: var(--font-size-base); line-height: 1.65; color: hsl(var(--muted-foreground)); text-wrap: pretty; }
</style>
