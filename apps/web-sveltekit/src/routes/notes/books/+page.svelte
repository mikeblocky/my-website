<script lang="ts">
  import PageIntro from '$lib/components/PageIntro.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
</script>

<SeoHead
  title="Books"
  path="/notes/books"
  image="/notes/opengraph-image.png"
  twitterImage="/notes/twitter-image.png"
/>

<PageIntro
  eyebrow="Books"
  title="Books"
  description="A collection of books I've read and taken notes on."
/>

<section class="simple-link-stack">
  <a href="/notes/books/llm-from-scratch-raschka/">LLMs From Scratch by Sebastian Raschka</a>
  <p>^The pages within this section are currently under construction.</p>
</section>

<SiteFooter />
