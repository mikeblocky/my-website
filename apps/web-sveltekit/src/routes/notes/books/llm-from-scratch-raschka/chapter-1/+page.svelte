<script lang="ts">
  import PageIntro from '$lib/components/PageIntro.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import Notes from './notes.mdx';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<SeoHead
  title="LLM From Scratch - Chapter 1 Notes"
  path="/notes/books/llm-from-scratch-raschka/chapter-1"
/>

<PageIntro
  eyebrow="LLM from Scratch"
  title="Chapter 1 Notes"
  description="Understanding LLMs, pretraining, fine-tuning, and transformer architecture basics."
/>

<section class="prose-panel prose dark:prose-invert max-w-none pb-24 font-sans text-left">
  <Notes />
</section>

<SiteFooter />
