<script lang="ts">
  import SectionLinkItem from '$lib/components/SectionLinkItem.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';
</script>

<SeoHead
  title="Learning"
  path="/learning"
/>

<SectionPageShell
  title="Learning"
  description="Weekly reflections, resources I use, and notes from things I'm trying to learn."
  currentLabel="Learning"
  footerColor="blue"
>
  <section class="section-link-list">
    <SectionLinkItem
      href="/learning/weekly-reflections/"
      title="Weekly Reflections"
      description="A running log of what I studied, noticed, and want to improve."
    />
    <SectionLinkItem
      href="/learning/learning-utensils/"
      title="Learning Utensils"
      description="The books, apps, and equipment I use while learning."
    />
  </section>
</SectionPageShell>
