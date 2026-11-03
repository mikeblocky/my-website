<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { goto } from '$app/navigation';
  import {
    Home,
    Grid,
    BookOpen,
    MessageSquare,
    MoreHorizontal,
    User,
    Users,
    Heart,
    Music,
    ChevronDown
  } from '@lucide/svelte';
  import {
    spotifyCurrentlyPlaying,
    spotifyHasChecked,
    startSpotifyPolling
  } from '$lib/spotify/currently-playing-store';

  let isMoreOpen = false;
  let isSpotifyCollapsed = false;
  let isGenerator = false;
  let isCompact = false;
  let reducedMotion = false;
  let dragIndex: number | null = null;
  let gesture: { id: number; x: number; y: number; dragging: boolean } | null = null;
  let suppressClick = false;

  const duration = (milliseconds: number) => reducedMotion ? 0 : milliseconds;

  function startGesture(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false };
    suppressClick = false;
  }

  function moveGesture(event: PointerEvent) {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (!gesture.dragging) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { gesture = null; return; }
      if (Math.abs(dx) < 8) return;
      gesture.dragging = true;
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    dragIndex = Math.max(0, Math.min(4, (event.clientX - rect.left - 6) / ((rect.width - 12) / 5) - 0.5));
  }

  function endGesture(event: PointerEvent) {
    if (!gesture || gesture.id !== event.pointerId) return;
    const index = dragIndex === null ? -1 : Math.round(dragIndex);
    const didDrag = gesture.dragging;
    gesture = null;
    dragIndex = null;
    if (!didDrag) return;
    suppressClick = true;
    if (index === 4) isMoreOpen = !isMoreOpen;
    else if (index >= 0) {
      isMoreOpen = false;
      if (mainTabs[index].href !== pathname) void goto(mainTabs[index].href);
    }
  }

  const mainTabs = [
    { href: '/', label: 'Home', icon: Home, exact: true },
    { href: '/artworks', label: 'Gallery', icon: Grid },
    { href: '/journal', label: 'Journal', icon: BookOpen },
    { href: '/interact', label: 'Interact', icon: MessageSquare }
  ];

  const moreTabs = [
    { href: '/about', label: 'About', icon: User },
    { href: '/friends', label: 'Friends', icon: Users },
    { href: '/favorites', label: 'Favorites', icon: Heart }
  ];

  $: pathname = $page.url.pathname;

  // Check if active page/tab is recommendation generator. Query params and
  // localStorage are browser-only during SvelteKit prerendering.
  $: {
    if (!browser || pathname !== '/favorites') {
      isGenerator = false;
    } else {
      const tabParam = $page.url.searchParams.get('tab');
      const storedTab = localStorage.getItem('mikeblocky:recommendations-tab');
      const activeTab = tabParam || storedTab || 'manga';
      isGenerator = activeTab === 'generator';
    }
  }

  // Close sheet on path change
  $: {
    if (pathname) {
      isMoreOpen = false;
    }
  }

  // `pathname` is passed in explicitly so the reactive statements and markup
  // that call this track it as a dependency.
  const isTabActive = (tab: { href: string; exact?: boolean }, path: string) => {
    if (tab.exact) {
      return path === tab.href;
    }
    return path.startsWith(tab.href);
  };

  onMount(() => {
    startSpotifyPolling();
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => { reducedMotion = preference.matches; };
    syncPreference();
    preference.addEventListener('change', syncPreference);
    let previousY = window.scrollY;
    let travel = 0;
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const y = Math.max(0, window.scrollY);
        const delta = y - previousY;
        travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
        if (y < 80 || travel < -14) isCompact = false;
        else if (travel > 24 && !isMoreOpen && !gesture) isCompact = true;
        previousY = y;
        frame = 0;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      preference.removeEventListener('change', syncPreference);
      cancelAnimationFrame(frame);
    };
  });

  $: moreActive = moreTabs.some(tab => isTabActive(tab, pathname));

  $: activeIndex = (() => {
    if (isMoreOpen || moreActive) return 4;
    return mainTabs.findIndex(tab => isTabActive(tab, pathname));
  })();

  $: getPlayerBottomOffset = () => '72px';
  $: playerBarVisible = !!$spotifyCurrentlyPlaying && !isSpotifyCollapsed;
  $: moreMenuBottom = '5.25rem';
</script>

<div class="mobile-navigation sm:hidden select-none" class:compact={isCompact && !isMoreOpen}>

  <!-- ────────────────── SPOTIFY FLOATING PLAYER BAR ────────────────── -->
  {#if $spotifyCurrentlyPlaying}
    {#if isSpotifyCollapsed}
      <button
        type="button"
        on:click={() => (isSpotifyCollapsed = false)}
        class="mobile-spotify-collapsed-btn"
        style="bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px) + {getPlayerBottomOffset()});"
        title="Expand currently playing"
        aria-label="Expand currently playing"
        in:fly={{ x: 12, duration: duration(360), opacity: 0, easing: cubicOut }}
        out:fade={{ duration: duration(120) }}
      >
        {#if $spotifyCurrentlyPlaying.artworkUrl}
          <img
            src={$spotifyCurrentlyPlaying.artworkUrl}
            alt={$spotifyCurrentlyPlaying.album || 'artwork'}
            style:animation={reducedMotion ? 'none' : 'spin 12s linear infinite'}
          />
        {:else}
          <Music class="mobile-spotify-fallback-icon" />
        {/if}
        <div class="mobile-spotify-art-overlay"></div>
      </button>
    {:else}
      <div
        class="mobile-spotify-player-wrap"
        style="bottom: calc(1rem + env(safe-area-inset-bottom, 0px) + {getPlayerBottomOffset()});"
        in:fly={{ y: 10, duration: duration(380), opacity: 0, easing: cubicOut }}
        out:fade={{ duration: duration(120) }}
      >
        <div class="mobile-spotify-player">
          <!-- Shared blue glass tint -->
          <div
            class="mobile-spotify-tint"
            style="background: hsl(var(--site-blue));"
          ></div>
 
          <!-- Link part (artwork & text) -->
          <a
            href={$spotifyCurrentlyPlaying.songUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div class="mobile-spotify-art">
              {#if $spotifyCurrentlyPlaying.artworkUrl}
                <img
                  src={$spotifyCurrentlyPlaying.artworkUrl}
                  alt={$spotifyCurrentlyPlaying.album || 'artwork'}
                  style:animation={reducedMotion ? 'none' : 'spin 12s linear infinite'}
                />
              {:else}
                <Music class="mobile-spotify-fallback-icon-small" />
              {/if}
              <div class="mobile-spotify-art-overlay"></div>
            </div>
 
            <div class="mobile-spotify-details">
              <p class="mobile-spotify-song">
                {$spotifyCurrentlyPlaying.song}
              </p>
              <p class="mobile-spotify-artist">
                listening to: {$spotifyCurrentlyPlaying.artist}
              </p>
            </div>
          </a>
 
          <!-- Collapse button -->
          <button
            type="button"
            on:click={(e) => {
              e.preventDefault();
              e.stopPropagation();
              isSpotifyCollapsed = true;
            }}
            class="mobile-spotify-close"
            title="Collapse player"
            aria-label="Collapse player"
          >
            <ChevronDown />
          </button>
        </div>
      </div>
    {/if}
  {/if}

  <!-- ────────────────── iOS LIQUID GLASS TAB BAR ────────────────── -->
  <!-- Dragging supplements the native, keyboard-accessible links and button below. -->
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
  <nav
    class="mobile-dock"
    class:dragging={dragIndex !== null}
    aria-label="Mobile navigation"
    on:pointerdown={startGesture}
    on:pointermove={moveGesture}
    on:pointerup={endGesture}
    on:pointercancel={() => { gesture = null; dragIndex = null; }}
    on:lostpointercapture={() => { gesture = null; dragIndex = null; }}
    on:click|capture={(event) => {
      if (suppressClick && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); suppressClick = false; }
    }}
    style:--selection={dragIndex ?? Math.max(0, activeIndex)}
    style="bottom: calc(1rem + env(safe-area-inset-bottom, 0px));"
  >
    {#each mainTabs as tab, index}
      {@const active = isTabActive(tab, pathname) && !isMoreOpen}
      <a
        href={tab.href}
        draggable="false"
        aria-label={tab.label}
        aria-current={active ? 'page' : undefined}
        title={tab.label}
        class="mobile-dock-tab"
        class:active
        on:click={(e) => {
          if (isMoreOpen) {
            isMoreOpen = false;
          }
          if (active) {
            e.preventDefault();
            if (!isGenerator) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }
        }}
      >
        <span class="mobile-dock-icon-wrap">
          <svelte:component this={tab.icon} class="mobile-dock-icon" />
        </span>
      </a>
    {/each}

    <!-- More Tab Trigger -->
    <button
      type="button"
      on:click={() => (isMoreOpen = !isMoreOpen)}
      class="mobile-dock-tab mobile-dock-more"
      class:active={isMoreOpen || moreActive}
      aria-label="More navigation"
      title="More"
      aria-expanded={isMoreOpen}
      aria-controls="mobile-more-menu"
    >
      <span class="mobile-dock-icon-wrap">
        <svelte:component
          this={MoreHorizontal}
          class="mobile-dock-icon mobile-dock-more-icon-inner"
          style="transition: transform 380ms var(--ease-out); transform: rotate({isMoreOpen ? 90 : 0}deg);"
        />
      </span>
    </button>

    <!-- The same lens travels continuously between all five controls. -->
    {#if activeIndex !== -1}
      <div
        class="mobile-dock-lens"
        aria-hidden="true"
      ></div>
    {/if}
  </nav>

  <!-- ────────────────── MORE FLOATING OVERLAY MENU ────────────────── -->
  {#if isMoreOpen}
    <div
      class="mobile-more-backdrop"
      on:click={() => (isMoreOpen = false)}
      on:keydown={(e) => e.key === 'Escape' && (isMoreOpen = false)}
      role="button"
      tabindex="0"
      aria-label="Close more navigation"
      in:fade={{ duration: duration(220) }}
      out:fade={{ duration: duration(180) }}
    ></div>

    <div
      class="mobile-more-menu"
      id="mobile-more-menu"
      style="bottom: calc({moreMenuBottom} + env(safe-area-inset-bottom, 0px));"
    >
      {#each moreTabs as tab, index}
        {@const active = isTabActive(tab, pathname)}
        <div in:fly={{ y: 8, delay: reducedMotion ? 0 : index * 35, duration: duration(320), opacity: 0, easing: cubicOut }} out:fade={{ duration: duration(120) }}>
          <a
            href={tab.href}
            class:active
            on:click={(e) => {
              isMoreOpen = false;
              if (active) {
                e.preventDefault();
                if (!isGenerator) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }
            }}
          >
            <svelte:component
              this={tab.icon}
              class="mobile-more-icon"
            />
            <span>{tab.label}</span>
          </a>
        </div>
      {/each}
    </div>
  {/if}

</div>
