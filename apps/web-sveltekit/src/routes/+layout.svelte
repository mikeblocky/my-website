<script lang="ts">
  import { page } from '$app/stores';
  import '$lib/styles/app.css';
  import MobileDock from '$lib/components/MobileDock.svelte';

  $: pathname = $page.url.pathname;
  $: isBlogPost = pathname.startsWith('/blog/') && pathname !== '/blog/';
</script>

<div class="flex flex-col min-h-screen relative">
  <div class="flex-1 flex flex-col">
    <main class="container mx-auto mt-4 px-4 flex-1 pb-32 sm:pb-4">
      {#key $page.url.pathname}
        <div class="page-transition">
          <slot />
        </div>
      {/key}
    </main>
  </div>
</div>
<MobileDock />
