<script lang="ts">
  import { stationeryUtensils } from '@mikeblocky/site-data';
  import { BookOpen, Keyboard, MousePointer, PenLine } from '@lucide/svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';

  const utensilIcons = [Keyboard, MousePointer, BookOpen, PenLine];
</script>

<SeoHead
  title="Diary utensils"
  path="/diary/diary-utensils"
  image="/diary/opengraph-image.png"
  twitterImage="/diary/twitter-image.png"
/>

<SectionPageShell
  title="Diary utensils"
  description="The tools, stationery, and setup behind my diary pages."
  currentLabel="Diary utensils"
  containerSize="md"
  contentGap="md"
>
  <section class="stationery-panel">
    <header>
      <h3>Journaling stationery</h3>
      <p>The physical and digital tools behind notes, diary pages, and quiet drafts.</p>
    </header>

    <div class="utensil-grid">
      {#each stationeryUtensils as item, index}
        <article>
          <span class="interact-icon pride-text">
            <svelte:component this={utensilIcons[index] ?? PenLine} size={17} strokeWidth={1.8} />
          </span>
          <h4>{item.title}</h4>
          <p>{item.description}</p>
          {#if item.href}
            <a href={item.href} target="_blank" rel="noreferrer">{item.label ?? 'view item'}</a>
          {/if}
        </article>
      {/each}
    </div>
  </section>
</SectionPageShell>
