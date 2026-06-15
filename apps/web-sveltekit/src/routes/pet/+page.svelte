<script lang="ts">
  import PageIntro from '$lib/components/PageIntro.svelte';
  import PetRoom from '$lib/components/PetRoom.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<SeoHead title="Pet annoy" path="/pet" />

<PageIntro
  eyebrow="Pet annoy"
  title="Pet annoy"
  description="Every click here sends a random animal GIF to my Discord. Use this to annoy me."
/>

<PetRoom />

<SiteFooter />
