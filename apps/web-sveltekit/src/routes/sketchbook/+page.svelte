<script lang="ts">
  import SketchbookBoard from '$lib/components/SketchbookBoard.svelte';
  import PageIntro from '$lib/components/PageIntro.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';

  let passcode = '';
  let isAdminMode = false;
</script>

<SeoHead
  title="Sketchbook"
  path="/sketchbook"
  description="A small drawing board for quick marks and visual messages."
/>

<PageIntro
  eyebrow="Interact"
  title="Sketchbook"
  description="A small canvas room for visual notes and quick marks."
/>

<SketchbookBoard bind:isAdminMode bind:passcode />

<SiteFooter />
