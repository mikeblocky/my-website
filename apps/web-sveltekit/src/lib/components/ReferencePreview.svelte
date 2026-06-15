<script lang="ts">
  import { Calendar, ExternalLink, Link as LinkIcon, Star, User } from '@lucide/svelte';
  import { decodeHtmlEntities } from '$lib/text/html-entities';

  export let reference: any;
  export let compact = false;

  $: hasMeta = reference.author || reference.releaseDate || reference.episodes || reference.chapters || reference.rating;
  $: title = decodeHtmlEntities(reference.title);
  $: description = decodeHtmlEntities(reference.description);
  $: author = decodeHtmlEntities(reference.author);
  $: releaseDate = decodeHtmlEntities(reference.releaseDate);
  $: rating = decodeHtmlEntities(reference.rating);
  $: siteName = decodeHtmlEntities(reference.siteName);
  $: hasImage = !!reference.image;
</script>

<div class="flex min-w-0 items-stretch rounded-xl bg-teal-50/45 dark:bg-teal-950/10 border border-teal-100/40 dark:border-teal-950/20 overflow-hidden {compact ? 'bg-slate-100/40 dark:bg-slate-900/50 border-0' : ''} {hasImage ? 'p-0 gap-0' : (compact ? 'p-3 sm:p-4 gap-4' : 'p-4 gap-4')}">
  {#if hasImage}
    <div class="relative shrink-0 bg-slate-100 dark:bg-slate-900 border-r border-slate-200/20 dark:border-slate-800/20 {compact ? 'w-20 sm:w-24' : 'w-24 sm:w-32'}">
      <img
        src={reference.image}
        alt=""
        class="absolute inset-0 w-full h-full object-cover object-center"
      />
    </div>
  {/if}
  <div class="min-w-0 flex-1 space-y-2 {hasImage ? (compact ? 'p-3 sm:p-4' : 'p-4') : ''}">
    <div class="flex min-w-0 items-center justify-between gap-2">
      <div class="flex min-w-0 items-center gap-1.5">
        <LinkIcon size={12} class="shrink-0 text-teal-600 dark:text-teal-400" />
        {#if reference.url}
          <a
            href={reference.url}
            target="_blank"
            rel="noreferrer"
            class="inline-flex min-w-0 items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-teal-700 hover:underline dark:text-teal-300"
          >
            <span class="truncate font-sans">{siteName || 'Link'}</span>
            <ExternalLink size={10} class="shrink-0" />
          </a>
        {:else}
          <span class="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 font-sans">Reference</span>
        {/if}
      </div>

      {#if rating}
        <div class="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20 font-sans">
          <Star size={10} class="fill-amber-500 text-amber-600 dark:text-amber-400" />
          <span>{rating}</span>
        </div>
      {/if}
    </div>

    <div class="space-y-1 text-left">
      {#if title}
        <p class="line-clamp-2 text-sm font-bold text-slate-800 dark:text-slate-100 font-sans">
          {title}
        </p>
      {/if}

      {#if hasMeta}
        <div class="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-0.5 font-sans">
          {#if author}
            <span class="flex items-center gap-1">
              <User size={11} class="text-teal-600/70" />
              <span class="truncate max-w-[120px]" title={author}>{author}</span>
            </span>
          {/if}
          {#if releaseDate}
            <span class="flex items-center gap-1">
              <Calendar size={11} class="text-teal-600/70" />
              <span>{releaseDate}</span>
            </span>
          {/if}
          {#if reference.episodes}
            <span class="flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.25 text-[10px] font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
              {reference.episodes} eps
            </span>
          {/if}
          {#if reference.chapters}
            <span class="flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.25 text-[10px] font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
              {reference.chapters}
            </span>
          {/if}
        </div>
      {/if}

      {#if description}
        <p class="line-clamp-2 text-xs leading-relaxed text-muted-foreground pt-0.5 font-sans">
          {description}
        </p>
      {/if}
    </div>
  </div>
</div>
