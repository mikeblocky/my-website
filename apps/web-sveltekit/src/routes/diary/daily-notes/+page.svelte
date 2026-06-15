<script lang="ts">
  import { readingSeries, getDailyNotesByMonth } from '@mikeblocky/site-data';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';

  const monthGroups = getDailyNotesByMonth();
</script>

<SeoHead
  title="Daily notes"
  path="/diary/daily-notes"
  description="A collection of short entries, gratitude logs, and snippets of what I learn or document each day."
/>

<SectionPageShell
  title="Daily notes"
  description="A collection of short entries, gratitude logs, and snippets of what I learn or document each day."
  currentLabel="Daily notes"
  containerSize="md"
  contentGap="md"
>
  {#if readingSeries.length > 0}
    <section class="journal-note-group">
      <h4>Reading notes</h4>
      {#each readingSeries as note}
        <a href={note.href}>{note.title}</a>
      {/each}
    </section>
  {/if}

  {#each monthGroups as group}
    <section class="journal-note-group">
      <h4>{group.month}</h4>
      {#each group.days as day}
        <a href={day.href}>
          <span>{day.title}</span>
          {#if day.description}
            <small>{day.description}</small>
          {/if}
        </a>
      {/each}
    </section>
  {/each}
</SectionPageShell>
