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
  description="Essays, translations, reflections, and learning notes."
/>

<PageIntro
  eyebrow="Journal"
  title="Blog"
  description="Essays, translations, reflections, and learning notes gathered in one place."
/>

<BlogList posts={blogPosts} />

<SiteFooter />
