<script lang="ts">
  import BaseContainer from '$lib/components/BaseContainer.svelte';
  import StackVertical from '$lib/components/StackVertical.svelte';
  import JournalShell from '$lib/components/JournalShell.svelte';
  import PageIntro from '$lib/components/PageIntro.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<SeoHead title="journal" path="/journal" image="/blog/opengraph-image.png" />

<BaseContainer size="lg" paddingX="md" paddingY="lg">
  <StackVertical gap="md">
    <PageIntro
      eyebrow="Journal"
      title="Journal"
      description="A collection of my thoughts: long-form essays, tech reflections, and daily journal pages."
    />

    <JournalShell />
  </StackVertical>

  <SiteFooter color="blue" />
</BaseContainer>
