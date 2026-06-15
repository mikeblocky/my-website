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
  description="A place to suggest books, manga, music, or films you think I would enjoy."
/>

<SectionPageShell
  title="Suggestions"
  description="Suggest books, manga, music, or movies for me to check out next."
  currentLabel="Interact"
  footerColor="sky"
>
  <SuggestionsBoard bind:isAdminMode bind:passcode />
</SectionPageShell>
