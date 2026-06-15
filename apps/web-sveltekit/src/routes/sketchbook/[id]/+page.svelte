<script lang="ts">
  import SeoHead from '$lib/components/SeoHead.svelte';
  import RedirectToBoard from '$lib/components/RedirectToBoard.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';

  export let data;

  $: drawing = data.drawing;
  $: id = data.id;

  $: description = drawing.body 
    ? `"${drawing.body.slice(0, 150)}${drawing.body.length > 150 ? '...' : ''}" — Drawing by ${drawing.author}`
    : `A beautiful sketch drawn by ${drawing.author} on the collaborative board.`;
  $: title = `Drawing by ${drawing.author} | Sketchbook`;
  $: ogImage = `/sketchbook/${id}/opengraph-image`;
</script>

<SeoHead
  {title}
  {description}
  path="/sketchbook/{id}"
  image={ogImage}
/>

<div class="w-full max-w-[700px] mx-auto px-6 py-12 font-sans">
  <RedirectToBoard {id} type="sketchbook" />
</div>

<SiteFooter />
