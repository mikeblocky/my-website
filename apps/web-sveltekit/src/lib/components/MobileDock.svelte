<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { Menu, X, Home, User, Palette, BookOpen, Users, Heart, MessageCircle, ClipboardList, Music } from '@lucide/svelte';
  import { navLinks } from '$lib/site';
  import ThemeToggle from './ThemeToggle.svelte';
  import { spotifyCurrentlyPlaying, startSpotifyPolling } from '$lib/spotify/currently-playing-store';
  let open = false;
  let reducedMotion = false;
  let navigating = false;
  let positioned = false;
  let x = 0, y = 0, viewportWidth = 0, viewportHeight = 0;
  let panelHeight = 440;
  let panel: HTMLDivElement;
  let dragging = false;
  let suppressClick = false;
  let pointer: { id: number; x: number; y: number; originX: number; originY: number } | null = null;
  type DockPosition = { corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' };
  let position: DockPosition = { corner: 'bottom-right' };
  const size = 54, margin = 16;
  const clamp = (value: number, max: number) => Math.max(margin, Math.min(value, Math.max(margin, max - size - margin)));
  function restorePosition() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.visualViewport?.height || window.innerHeight;
    x = position.corner.endsWith('left') ? margin : viewportWidth - size - margin;
    y = position.corner.startsWith('top') ? margin : viewportHeight - size - margin;
    x = clamp(x, viewportWidth); y = clamp(y, viewportHeight); positioned = true;
  }
  function snapPosition() {
    position = { corner: `${y + size / 2 < viewportHeight / 2 ? 'top' : 'bottom'}-${x + size / 2 < viewportWidth / 2 ? 'left' : 'right'}` as DockPosition['corner'] }; restorePosition();
    try { localStorage.setItem('mike:mobile-navigation-position', JSON.stringify(position)); } catch {}
  }
  function startDrag(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return;
    const target = event.currentTarget as HTMLButtonElement;
    target.setPointerCapture(event.pointerId);
    suppressClick = false;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, originX: x, originY: y };
  }
  function moveDrag(event: PointerEvent) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    if (!dragging && Math.hypot(dx, dy) < 8) return;
    dragging = true; suppressClick = true; open = false;
    x = clamp(pointer.originX + dx, viewportWidth); y = clamp(pointer.originY + dy, viewportHeight);
  }
  function finishDrag(event: PointerEvent) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const moved = dragging;
    pointer = null; dragging = false;
    if (moved) snapPosition();
  }
  async function navigate(event: MouseEvent, href: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigating = true; open = false;
    await tick();
    try { await goto(href); } finally { navigating = false; }
  }
  function measurePanel(node: HTMLDivElement) {
    const observer = new ResizeObserver(() => panelHeight = node.offsetHeight);
    observer.observe(node); return { destroy: () => observer.disconnect() };
  }
  $: panelX = Math.max(margin, Math.min(x + size - 248, viewportWidth - 248 - margin));
  $: panelY = y > viewportHeight / 2 ? Math.max(margin, y - panelHeight - 12) : Math.min(viewportHeight - panelHeight - margin, y + size + 12);
  function resetPosition() { position = { corner: 'bottom-right' }; restorePosition(); snapPosition(); open = false; }

  const icons = [Home, User, Palette, BookOpen, Users, Heart, MessageCircle, ClipboardList];
  $: pathname = $page.url.pathname;
  $: if (pathname) open = false;
  onMount(() => {
    startSpotifyPolling();
    try {
      const saved = JSON.parse(localStorage.getItem('mike:mobile-navigation-position') || 'null');
      if (saved && ['top-left','top-right','bottom-left','bottom-right'].includes(saved.corner)) position = { corner: saved.corner };
    } catch {}
    restorePosition();
    window.addEventListener('resize', restorePosition);
    window.visualViewport?.addEventListener('resize', restorePosition);
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => reducedMotion = preference.matches;
    update(); preference.addEventListener('change', update);
    return () => { preference.removeEventListener('change', update); window.removeEventListener('resize', restorePosition); window.visualViewport?.removeEventListener('resize', restorePosition); };
  });
  const active = (href: string, path: string) => href === '/' ? path === '/' : path.startsWith(href) || (href === '/journal' && /^\/(blog|diary|learning)/.test(path));
</script>
<svelte:window on:keydown={(event) => { if (event.key === 'Escape') open = false; }} />
<div class="phone-navigation">
  {#if open}
    <button class="phone-menu-backdrop" type="button" aria-label="Close navigation" on:click={() => open = false} transition:fade={{duration: reducedMotion || navigating ? 0 : 180}}></button>
    <div class="phone-menu-panel" id="phone-menu" bind:this={panel} use:measurePanel style:left={positioned ? `${panelX}px` : undefined} style:top={positioned ? `${Math.max(margin, panelY)}px` : undefined} style:bottom={positioned ? 'auto' : undefined} style:right={positioned ? 'auto' : undefined} transition:fly={{y: 12, duration: reducedMotion || navigating ? 0 : 240, easing: cubicOut}}>
      <nav aria-label="Mobile navigation">
        {#each navLinks as link, index}
          <a href={link.href} class:active={active(link.href, pathname)} aria-current={active(link.href, pathname) ? 'page' : undefined} on:click={(event) => navigate(event, link.href)}>
            <svelte:component this={icons[index]} size={18} strokeWidth={1.7} /><span>{link.label}</span>
          </a>
        {/each}
      </nav>
      <div class="phone-menu-footer">
        <button class="phone-reset-position" type="button" on:click={resetPosition}>reset position</button>
        <div class="phone-menu-theme"><ThemeToggle /></div>
      </div>
    </div>
  {/if}
  {#if $spotifyCurrentlyPlaying}
    <a class="phone-music" href={$spotifyCurrentlyPlaying.songUrl} target="_blank" rel="noreferrer" aria-label={`Mike is listening to ${$spotifyCurrentlyPlaying.song} by ${$spotifyCurrentlyPlaying.artist}`}>
      {#if $spotifyCurrentlyPlaying.artworkUrl}<img src={$spotifyCurrentlyPlaying.artworkUrl} alt="" width="36" height="36" />{:else}<Music size={20} />{/if}
      <span><strong>{$spotifyCurrentlyPlaying.song}</strong><small>{$spotifyCurrentlyPlaying.artist}</small></span>
      <span class="music-meter" aria-hidden="true"><i></i><i></i><i></i></span>
    </a>
  {/if}
  <button class="phone-menu-trigger" class:open class:dragging style:left={positioned ? `${x}px` : undefined} style:top={positioned ? `${y}px` : undefined} style:bottom={positioned ? 'auto' : undefined} style:right={positioned ? 'auto' : undefined} on:pointerdown={startDrag} on:pointermove={moveDrag} on:pointerup={finishDrag} on:pointercancel={finishDrag} on:lostpointercapture={finishDrag} type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="phone-menu" on:click={() => { if (suppressClick) { suppressClick = false; return; } open = !open; }}>
    <span class="phone-trigger-icon"><svelte:component this={open ? X : Menu} size={21} strokeWidth={1.8} /></span>
  </button>
</div>
