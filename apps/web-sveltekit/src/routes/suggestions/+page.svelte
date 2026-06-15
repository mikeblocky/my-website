<script lang="ts">
  import SuggestionsBoard from '$lib/components/SuggestionsBoard.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';

  let passcode = '';
  let isAdminMode = false;
</script>

<SeoHead
  title="Suggestions"
  path="/suggestions"
  description="Suggest books, manga, movies, series, music, games, or anything else for me to try."
/>

<SectionPageShell
  title="Suggestions"
  description="A place to leave media I should read, watch, listen to, play, or keep near."
  currentLabel="Interact"
  footerColor="blue"
>
  <SuggestionsBoard bind:isAdminMode bind:passcode />
</SectionPageShell>
