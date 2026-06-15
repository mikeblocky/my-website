<script lang="ts">
  import { readingSeries, getDailyNotesByMonth } from '@mikeblocky/site-data';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';

  const monthGroups = getDailyNotesByMonth();
</script>

<SeoHead title="Daily notes" path="/diary/daily-notes" />

<SectionPageShell
  title="Daily notes"
  description="My attempt at documenting, reflecting on, and being grateful for what I learned each day."
  currentLabel="Daily notes"
  containerSize="md"
  contentGap="md"
>
  <section class="smooth-panel journal-note-list">
    <header>
      <h3>Daily journal logs</h3>
      <p>Short entries, gratitude notes, and snapshots of what I document and learn each day.</p>
    </header>

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
            <small>{day.description}</small>
          </a>
        {/each}
      </section>
    {/each}
  </section>
</SectionPageShell>
