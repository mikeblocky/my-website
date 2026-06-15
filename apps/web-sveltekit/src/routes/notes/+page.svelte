<script lang="ts">
  import NotesList from '$lib/components/NotesList.svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';

  export let data;
</script>

<SeoHead
  title="Notes"
  path="/notes"
  image="/notes/opengraph-image.png"
  twitterImage="/notes/twitter-image.png"
/>

<SectionPageShell
  title="Notes"
  description="Notes I take while reading or studying — mostly math and machine learning stuff."
  currentLabel="Notes"
  containerSize="md"
  contentGap="md"
>
  <div class="smooth-panel">
    <NotesList notes={data.notes} />
  </div>
</SectionPageShell>
