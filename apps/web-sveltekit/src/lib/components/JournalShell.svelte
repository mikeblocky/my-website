<script lang="ts">
  import {
    blogPosts,
    getDailyNotesByMonth,
    readingSeries,
    stationeryUtensils
  } from '@mikeblocky/site-data';
  import { BookOpen, Keyboard, MousePointer, PenLine } from '@lucide/svelte';
  import BlogList from './BlogList.svelte';
  import PillTabs from './PillTabs.svelte';
  import ListeningActivity from './ListeningActivity.svelte';

  const tabs = [
    { id: 'essays', label: 'Essays & articles' },
    { id: 'notes', label: 'Daily notes' },
    { id: 'utensils', label: 'Stationery setup' },
    { id: 'activity', label: 'Activity' }
  ];

  let activeTab = 'essays';
  const monthGroups = getDailyNotesByMonth();
  const utensilIcons = [Keyboard, MousePointer, BookOpen, PenLine];
</script>

<section class="journal-shell" data-journal-client-version="journal-client-2026-06-08-modular">
  <PillTabs bind:activeTab {tabs} ariaLabel="Journal tabs" storageKey="mikeblocky:journal-tab" syncUrl />

  {#key activeTab}
  <div class="smooth-panel">
    {#if activeTab === 'essays'}
      <BlogList posts={blogPosts} />
    {:else if activeTab === 'notes'}
      <div class="journal-note-list">
        <header>
          <h3>Daily journal logs</h3>
          <p>Short entries, gratitude notes, and snapshots of what I document and learn each day.</p>
        </header>
        {#if readingSeries.length}
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
            {#each group.days as note}
              <a href={note.href}>
                <span>{note.title}</span>
                <small>{note.description}</small>
              </a>
            {/each}
          </section>
        {/each}
        <section class="journal-note-group">
          <h4>Learning archive</h4>
          <a href="/learning/weekly-reflections">Weekly reflections</a>
          <a href="/learning/learning-utensils">Learning utensils</a>
        </section>
      </div>
    {:else if activeTab === 'utensils'}
      <div class="stationery-panel">
        <header>
          <h3>Journaling stationery</h3>
          <p>The physical and digital tools behind notes, diary pages, and drafts.</p>
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
      </div>
    {:else}
      <ListeningActivity />
    {/if}
  </div>
  {/key}
</section>
