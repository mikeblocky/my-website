<script lang="ts">
  import SeoHead from '$lib/components/SeoHead.svelte';
  import RedirectToBoard from '$lib/components/RedirectToBoard.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';

  export let data;

  $: suggestion = data.suggestion;
  $: id = data.id;

  $: body = suggestion.note || suggestion.bestPart || suggestion.reference?.description || suggestion.title;
  $: description = `"${body.slice(0, 150)}${body.length > 150 ? '...' : ''}" - Suggested by ${suggestion.author || 'anonymous'}`;
  $: title = `${suggestion.title} | Media suggestions`;
  $: ogImage = suggestion.imageUrl || '/suggestions/opengraph-image.jpg';
</script>

<SeoHead
  {title}
  {description}
  path="/suggestions/{id}"
/>

<div class="w-full max-w-[700px] mx-auto px-6 py-12 font-sans">
  <RedirectToBoard {id} type="suggestion" />
</div>

<SiteFooter />
