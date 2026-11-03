<script lang="ts">
  import { page } from '$app/stores';
  import { onNavigate } from '$app/navigation';
  import '$lib/styles/app.css';
  import MobileDock from '$lib/components/MobileDock.svelte';
  // import SpotifyAmbientPlayer from '$lib/components/SpotifyAmbientPlayer.svelte';

  $: pathname = $page.url.pathname;
  $: isBlogPost = pathname.startsWith('/blog/') && pathname !== '/blog/';

  onNavigate((navigation) => {
    if (!document.startViewTransition ||
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

<div class="min-h-dvh relative overflow-x-hidden">
  <main class="w-full mx-auto mt-4 px-[clamp(0.75rem,4vw,1.5rem)] pb-[calc(8rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
    <div class="page-transition">
      <slot />
    </div>
  </main>
</div>
<MobileDock />
<!-- <SpotifyAmbientPlayer /> -->
