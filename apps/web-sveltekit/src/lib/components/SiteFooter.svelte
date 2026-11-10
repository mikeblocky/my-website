<script lang="ts">
  import { page } from '$app/stores';
  import { Bird, GitFork, Mail } from '@lucide/svelte';
  export let color = 'blue';
  export let spacing: 'default' | 'compact' | 'none' = 'default';
  const socials = [
    { href: 'mailto:mibeblocky@gmail.com', label: 'email', icon: Mail },
    { href: 'https://github.com/mikeblocky', label: 'github', icon: GitFork },
    { href: 'https://x.com/mikeblocky', label: 'x', icon: Bird }
  ];
  $: pathname = $page.url.pathname;
  $: homepage = pathname === '/' || pathname === '/homepage';
  $: parent = homepage ? null : getParentLink(pathname);
  function getParentLink(path: string) {
    const parts = path.split('/').filter(Boolean);
    if (parts.length <= 1) return null;
    const parents: Record<string, { href: string; label: string }> = {
      blog: { href: '/journal', label: 'journal' },
      learning: { href: '/learning', label: 'learning' },
      notes: { href: '/notes', label: 'notes' },
      draw: { href: '/draw', label: 'draw' },
      talk: { href: '/talk', label: 'talk' },
      suggestions: { href: '/suggestions', label: 'suggestions' },
      sketchbook: { href: '/sketchbook', label: 'sketchbook' },
      artworks: { href: '/artworks', label: 'gallery' },
      diary: { href: '/diary', label: 'diary' }
    };
    return parents[parts[0]] ?? null;
  }
</script>

<footer class="site-footer" data-spacing={spacing} data-accent={color}>
  <span class="footer-copyright">© {new Date().getFullYear()} mikeblocky.com</span>
  <div class="footer-context">
    {#if $$slots.controls}<slot name="controls" />
    {:else if !homepage}
      <nav aria-label="Footer navigation">
        {#if parent}<a href={parent.href}>{parent.label}</a><span aria-hidden="true">/</span>{/if}
        <a href="/">home</a>
      </nav>
    {/if}
  </div>
  <div class="footer-socials">
    {#each socials as social}
      <a href={social.href} aria-label={social.label} title={social.label} target={social.href.startsWith('mailto:') ? undefined : '_blank'} rel={social.href.startsWith('mailto:') ? undefined : 'noreferrer'}>
        <svelte:component this={social.icon} size={16} strokeWidth={1.5} />
      </a>
    {/each}
  </div>
</footer>

<style>
  .site-footer { display: grid; grid-template-columns: minmax(0,1fr) auto minmax(0,1fr); align-items: center; gap: 12px 20px; width: 100%; max-width: 56rem; margin: 40px auto 0; padding: 16px 0; border-top: 1px solid hsl(var(--foreground) / .12); color: hsl(var(--muted-foreground)); font-family: var(--font-sans); font-size: var(--font-size-xs); line-height: 1.5; }
  .site-footer[data-spacing='compact'] { margin-top: 24px; }
  .site-footer[data-spacing='none'] { margin-top: 0; }
  .footer-copyright { white-space: nowrap; }
  .footer-context { justify-self: center; }
  .footer-context nav { display: flex; align-items: center; justify-content: center; gap: 9px; }
  .footer-context nav > span { opacity: .4; }
  .footer-context nav a { display: inline-flex; align-items: center; min-height: 44px; }
  .footer-socials { display: flex; align-items: center; justify-self: end; gap: 2px; }
  .footer-socials a { display: grid; place-items: center; width: 40px; height: 44px; border-radius: 9px; }
  a { color: inherit; transition: color 180ms ease, background-color 180ms ease; }
  a:hover { color: hsl(var(--site-blue)); }
  .footer-socials a:hover { background: hsl(var(--site-blue) / .06); }
  a:focus-visible { outline: 2px solid hsl(var(--site-blue)); outline-offset: 2px; border-radius: 5px; }
  @media (max-width: 600px) {
    .site-footer { grid-template-columns: minmax(0,1fr) auto; gap: 4px 8px; }
    .footer-socials { grid-column: 2; grid-row: 1; }
    .footer-socials a { width: 34px; }
    .footer-context { grid-column: 1 / -1; grid-row: 2; }
    .footer-context:empty { display: none; }
  }
  @media (prefers-reduced-motion: reduce) { a { transition: none; } }
</style>
