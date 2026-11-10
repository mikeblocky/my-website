<script lang="ts">
  import HomePageContent from '$lib/components/HomePageContent.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  export let data;
</script>

<SeoHead
  description="a site where i share my thoughts and archive my artworks"
/>
<HomePageContent {...data} />
