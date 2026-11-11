<script lang="ts">
  import { site } from '$lib/site';

  export let title = site.name;
  export let description = site.description;
  export let path = '/';
  export let image = '';
  $: generatedImage = `/api/thumbnail?title=${encodeURIComponent(title)}`;
  export let twitterImage = '';

  $: url = new URL(path, site.url).toString();
  $: pageTitle = title === site.name ? title : `${title} | ${site.name}`;
  $: ogImageUrl = new URL(image || generatedImage, site.url).toString();
  $: twitterImageUrl = new URL(twitterImage || image || generatedImage, site.url).toString();
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />
  <meta property="og:site_name" content={site.name} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={ogImageUrl} />
  <meta property="og:image:width" content="1200" />
  {#if !image || image.startsWith('/api/thumbnail')}
    <meta property="og:image:height" content="630" />
  {/if}
  <meta property="og:image:secure_url" content={ogImageUrl} />
  {#if !image || image.includes('/api/thumbnail') || image.includes('/opengraph-image')}
    <meta property="og:image:type" content="image/png" />
  {/if}
  <meta property="og:image:alt" content={title} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:site" content="@mikeblocky" />
  <meta name="twitter:image" content={twitterImageUrl} />
  <meta name="twitter:image:alt" content={title} />
</svelte:head>
