<script lang="ts">
  import PageIntro from '$lib/components/PageIntro.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import Content from './content.mdx';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<SeoHead title="PyTorch References" path="/notes/pytorch" />

<PageIntro
  eyebrow="PyTorch"
  title="PyTorch References"
  description="PyTorch code snippets that I've used and learned from for quick reference."
/>

<section class="prose-panel prose dark:prose-invert max-w-none pb-24 font-sans text-left">
  <Content />
</section>

<SiteFooter />
