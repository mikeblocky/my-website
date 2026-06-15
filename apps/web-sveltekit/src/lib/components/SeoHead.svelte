<script lang="ts">
  import { site } from '$lib/site';

  export let title = site.name;
  export let description = site.description;
  export let path = '/';
  export let image = '/opengraph-image.jpg';

  $: url = new URL(path, site.url).toString();
  $: pageTitle = title === site.name ? title : `${title} | ${site.name}`;
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
  <meta property="og:image" content={new URL(image, site.url).toString()} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content={new URL(image, site.url).toString()} />
</svelte:head>
