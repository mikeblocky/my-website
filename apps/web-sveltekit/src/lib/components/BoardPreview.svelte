<script lang="ts" context="module">
  export type BoardKind = 'talk' | 'draw' | 'suggestions' | 'sketchbook';
</script>

<script lang="ts">
  import { browser } from '$app/environment';
  import { BookOpen, Image, MessageSquare, Palette, Send } from '@lucide/svelte';

  export let kind: BoardKind;
  export let title: string;
  export let description: string;
  export let emptyTitle: string;
  export let emptyDescription: string;
  export let items: any[] = [];
  export let ctaLabel = 'Leave a note';
  export let disabledNote = 'Live posting is being reconnected in the SvelteKit migration.';

  const icons = {
    talk: MessageSquare,
    draw: Palette,
    suggestions: BookOpen,
    sketchbook: Image
  };

  $: Icon = icons[kind];
  $: countLabel = items.length === 1 ? '1 entry' : `${items.length} entries`;

  function formatDate(value: string | undefined) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  }

  function itemTitle(item: any) {
    if (kind === 'suggestions') return item.title;
    return item.author ? `From ${item.author}` : kind === 'draw' ? 'Drawing prompt' : 'Guestbook note';
  }

  function itemBody(item: any) {
    if (kind === 'suggestions') return item.bestPart || item.note || item.reference?.description || '';
    return item.body || '';
  }

  function itemMeta(item: any) {
    const parts = [formatDate(item.createdAt)];
    if (kind === 'suggestions' && item.category) parts.unshift(item.category);
    if (kind === 'draw' && item.character) parts.unshift(item.character);
    return parts.filter(Boolean).join(' / ');
  }
</script>

<section class="board-preview smooth-panel" data-kind={kind}>
  <header class="board-preview-header">
    <span class="interact-icon pride-text">
      <svelte:component this={Icon} size={20} strokeWidth={1.8} />
    </span>
    <div>
      <p>{countLabel}</p>
      <h2>{title}</h2>
      <span>{description}</span>
    </div>
  </header>

  <form class="board-compose" aria-label={title} on:submit|preventDefault>
    <textarea placeholder={disabledNote} aria-label={ctaLabel} disabled></textarea>
    <div>
      <small>{disabledNote}</small>
      <button type="submit" disabled>
        <Send size={14} strokeWidth={1.8} />
        <span>{ctaLabel}</span>
      </button>
    </div>
  </form>

  {#if items.length}
    <div class="board-entry-list">
      {#each items as item, index}
        <article class="board-entry" style={`--entry-index: ${index}`}>
          <div>
            <h3>{itemTitle(item)}</h3>
            {#if itemMeta(item)}
              <small>{itemMeta(item)}</small>
            {/if}
          </div>
          {#if itemBody(item)}
            <p>{itemBody(item)}</p>
          {/if}
        </article>
      {/each}
    </div>
  {:else}
    <div class="board-empty">
      <h3>{emptyTitle}</h3>
      <p>{emptyDescription}</p>
      {#if browser}
        <small>Opened from {window.location.pathname}</small>
      {/if}
    </div>
  {/if}
</section>
