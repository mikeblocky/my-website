<script lang="ts">
  import SeoHead from '$lib/components/SeoHead.svelte';
  import RedirectToBoard from '$lib/components/RedirectToBoard.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';

  export let data;

  $: talk = data.talk;
  $: id = data.id;

  $: author = talk.author || 'anonymous';
  $: bodySnippet = talk.body.slice(0, 150) + (talk.body.length > 150 ? '...' : '');
  $: description = `"${bodySnippet}" — Shared by ${author}`;
  $: title = `Post from ${author} | Talk`;
  $: ogImage = `/talk/${id}/opengraph-image`;
  $: twitterImage = `/talk/${id}/twitter-image`;
</script>

<SeoHead
  {title}
  {description}
  path={`/talk/${id}`}
  image={ogImage}
  {twitterImage}
/>

<div class="w-full max-w-[700px] mx-auto px-6 py-12 font-sans">
  <RedirectToBoard {id} type="talk" />
</div>

<SiteFooter color="indigo" />
