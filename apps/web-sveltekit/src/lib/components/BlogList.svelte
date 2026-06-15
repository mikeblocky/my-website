<script lang="ts">
  import type { BlogPost } from '@mikeblocky/site-data';
  import { slide } from 'svelte/transition';
  import StackVertical from './StackVertical.svelte';
  import { cn } from '@/lib/utils/utils';

  export let posts: BlogPost[] = [];

  let query = '';
  let activeTheme = 'all';
  let isFocused = false;
  let currentPage = 1;
  const POSTS_PER_PAGE = 5;

  $: themes = ['all', ...Array.from(new Set(posts.flatMap((post) => post.themes))).sort()];
  $: normalizedQuery = query.trim().toLowerCase();

  type SearchMatch = {
    lineNumber: number;
    excerpt: string;
  };

  type SearchLine = {
    lineNumber: number;
    text: string;
  };

  type SearchableBlogPost = BlogPost & {
    searchText?: string;
    searchLines?: SearchLine[];
    searchMatches?: SearchMatch[];
  };

  // Helper to build excerpt for search lines
  function buildExcerpt(text: string, term: string) {
    const index = text.toLowerCase().indexOf(term);
    if (index === -1 || text.length <= 160) {
      return text;
    }
    const start = Math.max(0, index - 55);
    const end = Math.min(text.length, index + term.length + 85);
    const prefix = start > 0 ? '... ' : '';
    const suffix = end < text.length ? ' ...' : '';
    return `${prefix}${text.slice(start, end).trim()}${suffix}`;
  }

  // Filter posts matching Next.js logic
  $: filteredPosts = (() => {
    let result: SearchableBlogPost[] = posts.map((post) => ({ ...post }));

    // Theme filter
    if (activeTheme !== 'all') {
      result = result.filter((post) => post.themes?.includes(activeTheme));
    }

    // Keyword filter
    if (normalizedQuery) {
      result = result
        .map((post) => {
          const themeString = post.themes?.join(' ') ?? '';
          const haystack = `${post.title} ${post.description ?? ''} ${themeString} ${post.searchText ?? ''}`.toLowerCase();

          if (!haystack.includes(normalizedQuery)) {
            return {
              ...post,
              searchMatches: []
            };
          }

          const searchMatches = (post.searchLines ?? [])
            .filter((line: SearchLine) => line.text.toLowerCase().includes(normalizedQuery))
            .slice(0, 2)
            .map((line: SearchLine) => ({
              lineNumber: line.lineNumber,
              excerpt: buildExcerpt(line.text, normalizedQuery)
            }));

          return {
            ...post,
            searchMatches
          };
        })
        .filter(
          (post) =>
            (post.searchMatches?.length ?? 0) > 0 ||
            `${post.title} ${post.description ?? ''} ${post.themes?.join(' ') ?? ''}`.toLowerCase().includes(normalizedQuery)
        );
    }

    return result;
  })();

  $: totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  $: safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));
  $: paginatedPosts = filteredPosts.slice(
    (safeCurrentPage - 1) * POSTS_PER_PAGE,
    safeCurrentPage * POSTS_PER_PAGE
  );

  $: isFiltered = normalizedQuery || activeTheme !== 'all';
  $: countLabel = isFiltered
    ? `Showing ${filteredPosts.length} result${filteredPosts.length === 1 ? '' : 's'} for your filters.`
    : `Showing all ${posts.length} posts.`;

  // Reset page when filters change
  $: if (normalizedQuery || activeTheme) {
    currentPage = 1;
  }

  // Helper for text highlighting
  function highlightText(text: string, term: string) {
    if (!term) return [{ text, highlight: false }];
    const cleanTerm = term.trim();
    if (!cleanTerm) return [{ text, highlight: false }];
    const escapedTerm = cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => ({
      text: part,
      highlight: index % 2 === 1
    }));
  }
</script>

<section class="blog-index w-full">
  <div class="blog-search-shell space-y-4">
    <!-- Input Wrap with Glow -->
    <div 
      class={cn(
        "relative w-full rounded-sm border border-slate-200/60 dark:border-slate-800/60 bg-background/40 transition-all duration-200",
        isFocused && "ring-1 ring-[hsl(var(--pride-glow-val))]/80 border-[hsl(var(--pride-glow-val))]/80"
      )}
    >
      <input
        bind:value={query}
        type="text"
        placeholder="Search titles, themes, or post content..."
        aria-label="Search blog posts"
        on:focus={() => (isFocused = true)}
        on:blur={() => (isFocused = false)}
        class="w-full bg-transparent px-4 py-3 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500 font-sans"
        autocomplete="off"
      />
      {#if query}
        <button 
          type="button" 
          class="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-1 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 transition-colors" 
          aria-label="Clear search" 
          on:click={() => (query = '')}
        >
          ✕
        </button>
      {/if}
    </div>

    <!-- Theme Filter Strip -->
    <div class="theme-filter-strip theme-filter-strip--wrap" aria-label="Filter essays by theme">
      {#each themes as theme}
        <button
          type="button"
          class:active={activeTheme === theme}
          on:click={() => (activeTheme = theme)}
        >
          {theme === 'all' ? 'all' : theme.toLowerCase()}
        </button>
      {/each}
    </div>

    <span class="blog-count-label text-xs font-medium text-muted-foreground block">{countLabel}</span>
  </div>

  <!-- Blog entries list matching Next.js design -->
  <div class="blog-list space-y-6 mt-6" aria-live="polite">
    {#if paginatedPosts.length}
      {#each paginatedPosts as post, index}
        <div class="group">
          <a class="block py-3 transition-colors duration-200" href={`/blog/${post.slug}`}>
            <article>
              <div class="flex flex-col">
                <h4 class="group-hover:pride-text transition-colors duration-150 mb-2 mt-0 font-medium text-lg text-slate-900 dark:text-slate-100 font-sans">
                  {#each highlightText(post.title, query) as part}
                    {#if part.highlight}
                      <span class="bg-[hsl(var(--pride-glow-val))]/15 text-slate-950 dark:text-slate-50 border-b border-[hsl(var(--pride-glow-val))]/40 px-0.5 rounded-sm font-medium">
                        {part.text}
                      </span>
                    {:else}
                      {part.text}
                    {/if}
                  {/each}
                </h4>
                
                <p class="text-base text-muted-foreground line-clamp-2 mb-3 font-sans">
                  {#each highlightText(post.description, query) as part}
                    {#if part.highlight}
                      <span class="bg-[hsl(var(--pride-glow-val))]/15 text-slate-950 dark:text-slate-50 border-b border-[hsl(var(--pride-glow-val))]/40 px-0.5 rounded-sm font-medium">
                        {part.text}
                      </span>
                    {:else}
                      {part.text}
                    {/if}
                  {/each}
                </p>

                <!-- Search matches inline snippet -->
                {#if query && post.searchMatches && post.searchMatches.length > 0}
                  <div class="mb-3 rounded-sm border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 px-3 py-2.5 shadow-none" transition:slide>
                    <StackVertical gap="sm">
                      {#each post.searchMatches as match}
                        <div class="space-y-1">
                          <span class="text-xs font-semibold pride-text block font-mono">
                            Line {match.lineNumber}
                          </span>
                          <p class="text-sm leading-6 text-muted-foreground font-sans">
                            {#each highlightText(match.excerpt, query) as part}
                              {#if part.highlight}
                                <span class="bg-[hsl(var(--pride-glow-val))]/15 text-slate-950 dark:text-slate-50 border-b border-[hsl(var(--pride-glow-val))]/40 px-0.5 rounded-sm font-medium">
                                  {part.text}
                                </span>
                              {:else}
                                {part.text}
                              {/if}
                            {/each}
                          </p>
                        </div>
                      {/each}
                    </StackVertical>
                  </div>
                {/if}

                <!-- Meta Details -->
                <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground font-mono">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readingTime}</span>
                  {#if post.themes}
                    {#each post.themes as theme}
                      <span>•</span>
                      <span class="pride-text font-medium lowercase">
                        {theme}
                      </span>
                    {/each}
                  {/if}
                </div>
              </div>
            </article>
          </a>
          {#if index < paginatedPosts.length - 1}
            <hr class="border-slate-200/30 dark:border-slate-800/30 mt-3" />
          {/if}
        </div>
      {/each}
    {:else}
      <div class="rounded-sm border border-slate-200/60 bg-slate-50/50 p-6 text-center dark:border-slate-800/60 dark:bg-slate-900/30 shadow-none font-sans text-sm text-muted-foreground">
        No stories match "<span class="pride-text font-semibold">{query || activeTheme}</span>" just yet - try a different keyword or theme.
      </div>
    {/if}
  </div>

  <!-- Pagination Controls matching Next.js -->
  {#if totalPages > 1}
    <div class="mt-8 flex items-center justify-center gap-4">
      <button
        on:click={() => (currentPage = Math.max(1, currentPage - 1))}
        disabled={safeCurrentPage === 1}
        class="p-2 rounded-sm text-slate-500 hover:bg-slate-100/60 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-slate-800/40 transition-colors cursor-pointer border-0 bg-transparent"
        aria-label="Previous page"
      >
        ←
      </button>
      
      <div class="flex gap-2">
        {#each Array(totalPages) as _, i}
          <button
            on:click={() => (currentPage = i + 1)}
            class="w-7 h-7 rounded-sm text-xs font-semibold transition-colors cursor-pointer border {safeCurrentPage === i + 1
              ? 'bg-[hsl(var(--pride-glow-val))]/15 border-[hsl(var(--pride-glow-val))]/40 text-[hsl(var(--pride-glow-val))]'
              : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:bg-slate-800/40'}"
          >
            {i + 1}
          </button>
        {/each}
      </div>

      <button
        on:click={() => (currentPage = Math.min(totalPages, currentPage + 1))}
        disabled={safeCurrentPage === totalPages}
        class="p-2 rounded-sm text-slate-500 hover:bg-slate-100/60 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-slate-800/40 transition-colors cursor-pointer border-0 bg-transparent"
        aria-label="Next page"
      >
        →
      </button>
    </div>
  {/if}
</section>
