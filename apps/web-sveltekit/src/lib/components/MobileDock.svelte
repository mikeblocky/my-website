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
  $: moreMenuBottom = playerBarVisible ? '9.5rem' : '5.25rem';
</script>

<div class="sm:hidden select-none">

  <!-- ────────────────── SPOTIFY FLOATING PLAYER BAR ────────────────── -->
  {#if $spotifyCurrentlyPlaying}
    {#if isSpotifyCollapsed}
      <button
        type="button"
        on:click={() => (isSpotifyCollapsed = false)}
        class="fixed right-4 z-50 w-12 h-12 rounded-full overflow-hidden focus:outline-none bg-slate-100/70 dark:bg-slate-800/60 border border-white/20 dark:border-white/10 backdrop-blur-2xl active:scale-[0.97] transition-transform duration-180 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style="bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px) + {getPlayerBottomOffset()});"
        title="Expand currently playing"
        transition:fly={{ x: 12, duration: 260, opacity: 0 }}
      >
        {#if $spotifyCurrentlyPlaying.artworkUrl}
          <img
            src={$spotifyCurrentlyPlaying.artworkUrl}
            alt={$spotifyCurrentlyPlaying.album || 'artwork'}
            class="w-full h-full object-cover"
            style="animation: spin 12s linear infinite"
          />
        {:else}
          <Music class="w-4 h-4 text-muted-foreground m-auto" />
        {/if}
        <div class="absolute inset-0 bg-emerald-500/5 mix-blend-overlay pointer-events-none"></div>
      </button>
    {:else}
      <div
        class="fixed left-1/2 w-[calc(100%-2rem)] max-w-md z-50 -translate-x-1/2"
        style="bottom: calc(1rem + env(safe-area-inset-bottom, 0px) + {getPlayerBottomOffset()});"
        transition:fly={{ y: 14, duration: 300, opacity: 0 }}
      >
        <div
          class="flex items-center justify-between p-2.5 rounded-2xl relative overflow-hidden bg-white/55 dark:bg-slate-950/55 backdrop-blur-2xl border border-white/[0.14] dark:border-white/[0.08]"
        >
          <!-- Shifting Rainbow Gradient Background Tint Overlay -->
          <div
            class="absolute inset-0 opacity-[0.05] dark:opacity-[0.08] pointer-events-none"
            style="background-image: linear-gradient(135deg, var(--pride-colors-repeat)); background-size: 200% 200%; animation: pride-shift 12s ease-in-out infinite;"
          ></div>

          <!-- Link part (artwork & text) -->
          <a
            href={$spotifyCurrentlyPlaying.songUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-3 min-w-0 flex-1 z-10 focus:outline-none active:scale-[0.99] transition-transform duration-180 ease-[cubic-bezier(0.22,1,0.36,1)]"
          >
            <div class="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200/20 dark:border-slate-800/20 flex items-center justify-center">
              {#if $spotifyCurrentlyPlaying.artworkUrl}
                <img
                  src={$spotifyCurrentlyPlaying.artworkUrl}
                  alt={$spotifyCurrentlyPlaying.album || 'artwork'}
                  class="w-full h-full object-cover"
                  style="animation: spin 12s linear infinite"
                />
              {:else}
                <Music class="w-3.5 h-3.5 text-muted-foreground" />
              {/if}
              <div class="absolute inset-0 bg-emerald-500/5 mix-blend-overlay pointer-events-none"></div>
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-bold text-foreground truncate lowercase font-sans">
                {$spotifyCurrentlyPlaying.song}
              </p>
              <p class="text-[9px] text-muted-foreground truncate lowercase font-mono">
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
            class="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer z-20 focus:outline-none ml-2 active:scale-95 transition-transform duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] shrink-0 border-0 bg-transparent"
            title="Collapse player"
          >
            <ChevronDown class="h-4.5 w-4.5" />
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
        <svelte:component this={MoreHorizontal} class="mobile-dock-icon" />
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
      transition:fade={{ duration: 240 }}
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
              if (active) {
                e.preventDefault();
                if (!isGenerator) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                isMoreOpen = false;
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
