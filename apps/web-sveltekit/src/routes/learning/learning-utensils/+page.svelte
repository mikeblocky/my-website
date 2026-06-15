<script lang="ts">
  import { stationeryUtensils } from '@mikeblocky/site-data';
  import { BookOpen, Keyboard, MousePointer, PenLine } from '@lucide/svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';

  const utensilIcons = [Keyboard, MousePointer, BookOpen, PenLine];
</script>

<SeoHead
  title="Personal utensils"
  path="/learning/learning-utensils"
/>

<SectionPageShell
  title="Personal utensils"
  description="All the little tools I use to work, draw, study, and keep notes moving."
  currentLabel="Personal utensils"
  containerSize="md"
  contentGap="md"
>
  <section class="smooth-panel stationery-panel">
    <header>
      <h3>Learning and drawing setup</h3>
      <p>The everyday desk pieces that support reading, experiments, sketches, and small drafts.</p>
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
