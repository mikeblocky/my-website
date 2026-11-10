<script lang="ts">
  import { page } from '$app/stores';
  import { onNavigate } from '$app/navigation';
  import { onDestroy } from 'svelte';
  import '$lib/styles/app.css';
  import SideNav from '$lib/components/SideNav.svelte';
  import MobileDock from '$lib/components/MobileDock.svelte';
  let navCollapsed = false;
  let toneTimer: ReturnType<typeof setTimeout>;
  let toneNavigation = 0;
  onDestroy(() => { clearTimeout(toneTimer); if (typeof document !== 'undefined') document.documentElement.classList.remove('light-page-settling'); });
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
    if (window.matchMedia('(max-width: 760px)').matches || !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      navigation.from?.url.pathname === navigation.to?.url.pathname) return;

    return new Promise<void>((resolve) => {
      document.documentElement.classList.add('route-crossfade');
      const transition = document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
      void transition.finished.catch(() => {}).finally(() => {
        document.documentElement.classList.remove('route-crossfade');
        resolve();
      });
    });
  });
</script>

<div class="site-navigation-layout" class:nav-collapsed={navCollapsed}>
<SideNav bind:collapsed={navCollapsed} />
<div class="site-frame min-h-dvh relative overflow-x-hidden">
  <main class="w-full mx-auto mt-4 px-[clamp(0.75rem,4vw,1.5rem)] pb-[calc(8rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
    <div class="page-transition">
      <slot />
    </div>
  </main>
</div>
</div>
<MobileDock />
<!-- <SpotifyAmbientPlayer /> -->
