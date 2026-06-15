<script lang="ts">
  import { blogPosts } from '@mikeblocky/site-data';
  import BlogList from '$lib/components/BlogList.svelte';
  import PageIntro from '$lib/components/PageIntro.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<SeoHead
  title="Blog"
  path="/blog"
  image="/blog/opengraph-image.png"
  twitterImage="/blog/twitter-image.png"
  description="A collection of notes and blogs covering machine learning, programming, and personal thoughts."
/>

<PageIntro
  eyebrow="Journal"
  title="Blog"
  description="A collection of notes and blogs covering machine learning, programming, and personal thoughts."
/>

<BlogList posts={blogPosts} />

<SiteFooter />
