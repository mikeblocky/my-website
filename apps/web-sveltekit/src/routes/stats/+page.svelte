<script lang="ts">
  import PageIntro from '$lib/components/PageIntro.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import StatsPanel from '$lib/components/StatsPanel.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';

  export let data;
</script>

<SeoHead
  title="Stats"
  path="/stats"
  description="A small theme breakdown of the artwork archive."
/>

<PageIntro
  eyebrow="Artworks"
  title="Stats"
  description="A small breakdown of artwork themes across the archive."
/>

<StatsPanel data={data.stats} />

<SiteFooter />
