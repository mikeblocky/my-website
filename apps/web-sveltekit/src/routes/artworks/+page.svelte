<script lang="ts">
  import ArtworkGallery from '$lib/components/ArtworkGallery.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';

  export let data;
</script>

<SeoHead title="artworks" path="/artworks" description="A quiet gallery archiving my character illustrations, sketches, and drawings." />

<SectionPageShell
  title="Gallery"
  description="A personal archive of drawings, digital sketches, and character illustrations."
  currentLabel="Gallery"
  footerColor="blue"
>
  <ArtworkGallery sections={data.sections} stats={data.stats} />
</SectionPageShell>
