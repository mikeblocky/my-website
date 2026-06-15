<script lang="ts">
  import SeoHead from '$lib/components/SeoHead.svelte';
  import BlogPostTemplate from '$lib/components/BlogPostTemplate.svelte';

  export let data: any;

  // Resolve social image or default
  $: slug = data.post.slug;
  $: ogImage = `/blog/posts/${slug}/opengraph-image.${data.post.imageFormat || 'png'}`;
  $: twitterImage = `/blog/posts/${slug}/twitter-image.${data.post.imageFormat || 'png'}`;
</script>

<SeoHead
  title={data.post.title}
  path={`/blog/${slug}`}
  image={ogImage}
  twitterImage={twitterImage}
  description={data.post.description}
/>

{#if data.type === 'mdx'}
  <BlogPostTemplate
    title={data.post.title}
    date={data.post.date}
    readingTime={data.post.readingTime}
    {slug}
    themes={data.post.themes}
    contentClassName={data.post.contentClassName ?? ''}
  >
    <svelte:component this={data.content} />
  </BlogPostTemplate>
{:else}
  <svelte:component this={data.content} />
{/if}
