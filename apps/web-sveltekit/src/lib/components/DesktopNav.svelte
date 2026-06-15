<script lang="ts">
  import { onMount } from 'svelte';
  import { Menu, X } from '@lucide/svelte';
  import { portalLinks } from '$lib/site';
  import {
    spotifyCurrentlyPlaying,
    startSpotifyPolling
  } from '$lib/spotify/currently-playing-store';

  let isMenuOpen = false;
  let navRef: HTMLElement;

  const links = [{ href: '/', label: 'Home' }, ...portalLinks.map(({ href, label }) => ({ href, label }))];

  function menuPanelTransition(_node: Element) {
    return {
      duration: 200,
      css: (t: number, u: number) => `
        opacity: ${t};
        filter: blur(${u * 4}px);
        transform: translateY(${u * -10}px);
      `
    };
  }

  function menuItemTransition(_node: Element, params: { delay?: number } = {}) {
    return {
      delay: params.delay ?? 0,
      duration: 200,
      css: (t: number, u: number) => `
        opacity: ${t};
        filter: blur(${u * 3}px);
        transform: translateY(${u * -10}px);
      `
    };
  }

  function menuIconTransition(_node: Element) {
    return {
      duration: 180,
      css: (t: number, u: number) => `
        opacity: ${t};
        filter: blur(${u * 3}px);
        transform: scale(${0.94 + t * 0.06});
      `
    };
  }

  onMount(() => {
    startSpotifyPolling();

    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && navRef && !navRef.contains(event.target as Node)) {
        isMenuOpen = false;
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        isMenuOpen = false;
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<div class="desktop-nav-shell" bind:this={navRef}>
  {#if !$spotifyCurrentlyPlaying}
    <nav class="desktop-nav" aria-label="Primary navigation">
      {#each links as link}
        <a class="pride-nav-link" href={link.href}>{link.label}</a>
      {/each}
    </nav>
  {:else}
    <div class="desktop-menu-container">
      <button
        type="button"
        class:active={isMenuOpen}
        aria-expanded={isMenuOpen}
        aria-controls="desktop-compact-menu"
        on:click|stopPropagation={() => (isMenuOpen = !isMenuOpen)}
      >
        <span class="desktop-menu-icon" class:active={isMenuOpen} aria-hidden="true">
          {#key isMenuOpen}
            {#if isMenuOpen}
              <span class="desktop-menu-icon-glyph" transition:menuIconTransition>
                <X size={16} strokeWidth={1.8} />
              </span>
            {:else}
              <span class="desktop-menu-icon-glyph" transition:menuIconTransition>
                <Menu size={16} strokeWidth={1.8} />
              </span>
            {/if}
          {/key}
        </span>
        <span>Open menu</span>
      </button>

      {#if isMenuOpen}
        <nav
          id="desktop-compact-menu"
          class="desktop-menu-popover"
          aria-label="Primary navigation"
          transition:menuPanelTransition
        >
          {#each links as link, index}
            <div class="desktop-menu-item" transition:menuItemTransition={{ delay: index * 50 }}>
              <a href={link.href} style={`--item-index: ${index}`} on:click={() => (isMenuOpen = false)}>
                {link.label}
              </a>
            </div>
          {/each}
        </nav>
      {/if}
    </div>
  {/if}
</div>
