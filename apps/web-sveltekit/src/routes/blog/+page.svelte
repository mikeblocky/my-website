<script lang="ts">
  import { blogPosts } from '@mikeblocky/site-data';
  import BlogList from '$lib/components/BlogList.svelte';
  import WritingIntro from '$lib/components/WritingIntro.svelte';
  import BaseContainer from '$lib/components/BaseContainer.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<SeoHead
  title="Blog"
  path="/blog"
  description="A collection of notes and blogs covering machine learning, programming, and personal thoughts."
/>

<div class="writing-page">
  <BaseContainer size="lg" paddingX="md" paddingY="lg">
    <WritingIntro title="Blog" />
    <BlogList posts={blogPosts} />
    <SiteFooter />
  </BaseContainer>
</div>
