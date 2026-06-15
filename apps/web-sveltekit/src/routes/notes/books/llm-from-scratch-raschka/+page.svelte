<script lang="ts">
  import PageIntro from '$lib/components/PageIntro.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';

  const chapters = [1, 2, 3, 4, 5, 6];
</script>

<SeoHead
  title="LLM From Scratch — Raschka"
  path="/notes/books/llm-from-scratch-raschka"
/>

<PageIntro
  eyebrow="Books"
  title="LLM From Scratch"
  description="Last updated: December 31, 2024"
/>

<section class="prose-panel">
  <p>This is a book I'm reading to gain a deeper understanding of LLMs.</p>
  <p class="text-red-500 dark:text-red-400 text-sm">The page is currently under construction. Every chapter link below is a placeholder.</p>
  <p>I am planning to integrate MDX for each chapter notes since I took notes in Jupyter Notebooks for each chapter.</p>
  <ul>
    {#each chapters as ch}
      <li><a href={`/notes/books/llm-from-scratch-raschka/chapter-${ch}`} class="pride-text hover:underline">Chapter {ch} Notes</a></li>
    {/each}
  </ul>
</section>

<SiteFooter />
