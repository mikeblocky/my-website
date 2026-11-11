<script lang="ts">
  import SeoHead from '$lib/components/SeoHead.svelte';
  import BlogPostTemplate from '$lib/components/BlogPostTemplate.svelte';

  export let data: any;

  $: slug = data.post.slug;
  $: thumbnail = `/api/thumbnail?title=${encodeURIComponent(data.post.title)}`;
</script>

<SeoHead
  title={data.post.title}
  path={`/blog/${slug}`}
  image={thumbnail}
  twitterImage={thumbnail}
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
