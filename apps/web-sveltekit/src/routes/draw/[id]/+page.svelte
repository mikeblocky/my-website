<script lang="ts">
  import SeoHead from '$lib/components/SeoHead.svelte';
  import RedirectToBoard from '$lib/components/RedirectToBoard.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';

  export let data;

  $: prompt = data.prompt;
  $: id = data.id;

  $: author = prompt.author || 'anonymous';
  $: bodySnippet = prompt.body.slice(0, 150) + (prompt.body.length > 150 ? '...' : '');
  $: description = `"${bodySnippet}" — Suggested by ${author}`;
  $: title = `Prompt from ${author} | Drawing prompts`;
  $: ogImage = `/draw/${id}/opengraph-image`;
  $: twitterImage = `/draw/${id}/twitter-image`;
</script>

<SeoHead
  {title}
  {description}
  path={`/draw/${id}`}
  image={ogImage}
  {twitterImage}
/>

<div class="w-full max-w-[700px] mx-auto px-6 py-12 font-sans">
  <RedirectToBoard {id} type="prompt" />
</div>

<SiteFooter color="violet" />
