<script lang="ts">
  import NotesList from '$lib/components/NotesList.svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';

  export let data;
</script>

<SeoHead title="Notes" path="/notes" />

<SectionPageShell
  title="Notes"
  description="A collection of notes from my learning journey, mostly around math and machine learning."
  currentLabel="Notes"
  containerSize="md"
  contentGap="md"
>
  <div class="smooth-panel">
    <NotesList notes={data.notes} />
  </div>
</SectionPageShell>
