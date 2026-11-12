<script lang="ts">
  import { page, navigating } from '$app/stores';
  import { onNavigate } from '$app/navigation';
  import { onDestroy, onMount } from 'svelte';
  import { installInteractionFeedback } from '$lib/interaction-feedback';
  import '$lib/styles/app.css';
  import SideNav from '$lib/components/SideNav.svelte';
  import MobileDock from '$lib/components/MobileDock.svelte';
  let navCollapsed = false;
  let toneTimer: ReturnType<typeof setTimeout>;
  let toneNavigation = 0;
  let activeTransition:ViewTransition|null=null;
  onMount(installInteractionFeedback);
  onDestroy(() => { clearTimeout(toneTimer);activeTransition?.skipTransition(); if (typeof document !== 'undefined') document.documentElement.classList.remove('light-page-settling','route-crossfade'); });
  // import SpotifyAmbientPlayer from '$lib/components/SpotifyAmbientPlayer.svelte';

  $: pathname = $page.url.pathname;
  $: isBlogPost = pathname.startsWith('/blog/') && pathname !== '/blog/';

  onNavigate((navigation) => {
    if (navigation.from?.url.pathname === navigation.to?.url.pathname) return;
    const root = document.documentElement;
    const toneId = ++toneNavigation;
    clearTimeout(toneTimer);
    if (!root.classList.contains('dark') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('light-page-settling');
      void navigation.complete.then(() => {
        if (toneId !== toneNavigation) return;
        toneTimer = setTimeout(() => root.classList.remove('light-page-settling'), 240);
      }).catch(() => { if (toneId === toneNavigation) root.classList.remove('light-page-settling'); });
    } else root.classList.remove('light-page-settling');
    activeTransition?.skipTransition();activeTransition=null;root.classList.remove('route-crossfade');
    if (window.matchMedia('(max-width: 760px), (pointer: coarse)').matches || !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      navigation.from?.url.pathname === navigation.to?.url.pathname) return;

    return new Promise<void>((resolve) => {
      document.documentElement.classList.add('route-crossfade');
      try{
        const transition = document.startViewTransition(async () => {
          resolve();
          await navigation.complete;
        });
        activeTransition=transition;
        void transition.finished.catch(() => {}).finally(() => {
          if(activeTransition===transition){root.classList.remove('route-crossfade');activeTransition=null;}
          resolve();
        });
      }catch{root.classList.remove('route-crossfade');activeTransition=null;resolve();}
    });
  });
</script>
{#if $navigating}<div class="route-loading-bar" role="progressbar" aria-label="Loading page"></div>{/if}

<div class="site-navigation-layout" class:nav-collapsed={navCollapsed}>
<SideNav bind:collapsed={navCollapsed} />
<div class="site-frame min-h-dvh relative overflow-x-hidden" aria-busy={!!$navigating}>
  <main class="w-full mx-auto mt-4 px-[clamp(0.75rem,4vw,1.5rem)] pb-[calc(8rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
    <div class="page-transition">
      <slot />
    </div>
  </main>
</div>
</div>
<MobileDock />
<!-- <SpotifyAmbientPlayer /> -->
