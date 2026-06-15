<script lang="ts">
  import InteractShell from '$lib/components/InteractShell.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';
</script>

<SeoHead title="interact" path="/interact" image="/interact/opengraph-image.jpg" />

<SectionPageShell
  title="Interact"
  description="A place to connect and interact: share recommendations, leave suggestions, ask questions."
  currentLabel="Interact"
  footerColor="blue"
>
  <InteractShell />
</SectionPageShell>
