<script lang="ts">
  import BaseContainer from '$lib/components/BaseContainer.svelte';
  import StackVertical from '$lib/components/StackVertical.svelte';
  import JournalShell from '$lib/components/JournalShell.svelte';
  import WritingIntro from '$lib/components/WritingIntro.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<SeoHead
  title="journal"
  path="/journal"
  description="A personal collection of blogs, notes, and logs that I write over time."
/>

<div class="writing-page">
<BaseContainer size="lg" paddingX="md" paddingY="lg">
  <StackVertical gap="md">
    <WritingIntro title="Journal" />

    <JournalShell />
  </StackVertical>

  <SiteFooter color="blue" />
</BaseContainer>
</div>
