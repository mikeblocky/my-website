<script lang="ts">
  import ArtworkGallery from '$lib/components/ArtworkGallery.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';

  export let data;
</script>

<SeoHead title="artworks" path="/artworks" image="/artworks/opengraph-image.png" />

<SectionPageShell
  title="Gallery"
  description="A gallery of my drawings and illustrations, alongside theme distributions."
  currentLabel="Gallery"
  footerColor="blue"
>
  <ArtworkGallery sections={data.sections} stats={data.stats} />
</SectionPageShell>
