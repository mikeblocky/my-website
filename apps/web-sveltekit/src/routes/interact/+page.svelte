<script lang="ts">
  import InteractShell from '$lib/components/InteractShell.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';
</script>

<SeoHead
  title="interact"
  path="/interact"
  image="/interact/opengraph-image.jpg"
  twitterImage="/interact/twitter-image.jpg"
  description="A space to connect: send messages, draw something in the sketchbook suggest books or music, or leave drawing prompts."
/>

<SectionPageShell
  title="Interact"
  description="A space to send messages, draw something in the sketchbook, suggest books or music, or leave drawing prompts."
  currentLabel="Interact"
  footerColor="blue"
>
  <InteractShell />
</SectionPageShell>
