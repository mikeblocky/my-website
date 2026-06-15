<script lang="ts">
  import TalkBoard from '$lib/components/TalkBoard.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';

  let passcode = '';
  let isAdminMode = false;
</script>

<SeoHead
  title="Talk"
  path="/talk"
  description="Leave a note, question, or ordinary message."
/>

<SectionPageShell
  title="Talk"
  description="A guestbook for small messages, questions, and replies."
  currentLabel="Interact"
  footerColor="indigo"
>
  <TalkBoard bind:isAdminMode bind:passcode />
</SectionPageShell>
