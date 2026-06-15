<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';
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

<div class="sm:hidden select-none">

  <!-- ────────────────── SPOTIFY FLOATING PLAYER BAR ────────────────── -->
  {#if $spotifyCurrentlyPlaying}
    {#if isSpotifyCollapsed}
      <button
        type="button"
        on:click={() => (isSpotifyCollapsed = false)}
        class="mobile-spotify-collapsed-btn"
        style="bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px) + {getPlayerBottomOffset()});"
        title="Expand currently playing"
        transition:fly={{ x: 12, duration: 260, opacity: 0 }}
      >
        {#if $spotifyCurrentlyPlaying.artworkUrl}
          <img
            src={$spotifyCurrentlyPlaying.artworkUrl}
            alt={$spotifyCurrentlyPlaying.album || 'artwork'}
            style="animation: spin 12s linear infinite"
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
        transition:fly={{ y: 14, duration: 300, opacity: 0 }}
      >
        <div class="mobile-spotify-player">
          <!-- Shifting Rainbow Gradient Background Tint Overlay -->
          <div
            class="mobile-spotify-rainbow"
            style="background-image: linear-gradient(135deg, var(--pride-colors-repeat)); background-size: 200% 200%; animation: pride-shift 12s ease-in-out infinite;"
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
                  style="animation: spin 12s linear infinite"
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
          >
            <ChevronDown />
          </button>
        </div>
      </div>
    {/if}
  {/if}

  <!-- ────────────────── iOS LIQUID GLASS TAB BAR ────────────────── -->
  <nav
    class="mobile-dock"
    style="bottom: calc(1rem + env(safe-area-inset-bottom, 0px));"
  >
    {#each mainTabs as tab, index}
      {@const active = isTabActive(tab, pathname) && !isMoreOpen}
      <a
        href={tab.href}
        class="mobile-dock-tab"
        class:active
        on:click={(e) => {
          if (isMoreOpen) {
            isMoreOpen = false;
            e.preventDefault();
            return;
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
        <span class="mobile-dock-label">
          {tab.label}
        </span>
      </a>
    {/each}

    <!-- More Tab Trigger -->
    <button
      type="button"
      on:click={() => (isMoreOpen = !isMoreOpen)}
      class="mobile-dock-tab mobile-dock-more"
      class:active={isMoreOpen || moreActive}
    >
      <span class="mobile-dock-icon-wrap">
        <svelte:component
          this={MoreHorizontal}
          class="mobile-dock-icon mobile-dock-more-icon-inner"
          style="transition: transform 320ms cubic-bezier(0.34,1.56,0.64,1); transform: rotate({isMoreOpen ? 90 : 0}deg);"
        />
      </span>
      <span class="mobile-dock-label">
        More
      </span>
    </button>

    <!-- Sliding Liquid Active Dot -->
    {#if activeIndex !== -1}
      <div
        class="absolute bottom-1 w-[4px] h-[4px] rounded-full bg-[hsl(var(--pride-glow-val))] shadow-[0_0_8px_hsl(var(--pride-glow-val)/0.9)] transition-all duration-260 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style="left: calc({activeIndex * 20}% + 10% - 2px);"
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
      in:fade={{ duration: 200 }}
      out:fade={{ duration: 0 }}
    ></div>

    <div
      class="mobile-more-menu"
      style="bottom: calc({moreMenuBottom} + env(safe-area-inset-bottom, 0px));"
    >
      {#each moreTabs as tab, index}
        {@const active = isTabActive(tab, pathname)}
        <div transition:fly={{ y: 8, delay: index * 32, duration: 280, opacity: 0 }}>
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
