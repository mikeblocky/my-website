<script lang="ts">
  import { page } from '$app/stores';
  import '$lib/styles/app.css';
  import MobileDock from '$lib/components/MobileDock.svelte';
  // import SpotifyAmbientPlayer from '$lib/components/SpotifyAmbientPlayer.svelte';

  $: pathname = $page.url.pathname;
  $: isBlogPost = pathname.startsWith('/blog/') && pathname !== '/blog/';
</script>

<div class="min-h-dvh relative overflow-x-hidden">
  <main class="w-full mx-auto mt-4 px-[clamp(0.75rem,4vw,1.5rem)] pb-[calc(8rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
    {#key $page.url.pathname}
      <div class="page-transition">
        <slot />
      </div>
    {/key}
  </main>
</div>
<MobileDock />
<!-- <SpotifyAmbientPlayer /> -->
