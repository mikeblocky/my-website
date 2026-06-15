<script lang="ts">
  import DrawBoard from '$lib/components/DrawBoard.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';

  let passcode = '';
  let isAdminMode = false;
</script>

<SeoHead
  title="Draw"
  path="/draw"
  description="Suggest a scene, character, or image idea for later drawings."
/>

<SectionPageShell
  title="Draw"
  description="A prompt shelf for scenes, characters, and small image ideas."
  currentLabel="Interact"
  footerColor="violet"
>
  <DrawBoard bind:isAdminMode bind:passcode />
</SectionPageShell>
