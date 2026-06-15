<script lang="ts">
  import { onMount } from 'svelte';
  import ArticleLineRail from './ArticleLineRail.svelte';
  import ArticleSectionPreview from './ArticleSectionPreview.svelte';
  import ArticleSectionPreviewMobile from './ArticleSectionPreviewMobile.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import SiteFooter from './SiteFooter.svelte';
  import BaseContainer from './BaseContainer.svelte';
  import StackVertical from './StackVertical.svelte';

  export let title: string;
  export let date: string;
  export let readingTime: string;
  export let slug = '';
  export let themes: string[] = [];
  export let contentClassName = '';
  export let parentLabel = 'Journal';
  export let parentHref = '/journal';

  let readCount: number | null = null;

  async function recordRead() {
    if (!slug) return;
    try {
      const response = await fetch('/api/blog/read-count', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slug })
      });
      const data = await response.json();
      if (response.ok && typeof data.count === 'number') {
        readCount = data.count;
      }
    } catch (error) {
      console.error('Could not record blog read count:', error);
    }
  }

  onMount(() => {
    recordRead();
  });
</script>

<div class="relative w-full">
  <BaseContainer size="xl" paddingX="sm" paddingY="lg">
    <div class="flex flex-col gap-6">
      <!-- Breadcrumb Header -->
      <section class="page-intro">
        <div class="section-header-top">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/" class="breadcrumb-home">
              <img src="/icon.svg" alt="" width="18" height="18" aria-hidden="true" />
              Home
            </a>
            <span aria-hidden="true">/</span>
            <a href={parentHref}>{parentLabel}</a>
            <span aria-hidden="true">/</span>
            <span class="truncate max-w-[150px] sm:max-w-[240px] md:max-w-[350px] lg:max-w-[450px] inline-block align-bottom" title={title}>{title}</span>
          </nav>
          <ThemeToggle />
        </div>

        <div class="section-title-block space-y-2 mt-4">
          <h1 class="font-sans font-bold text-xl sm:text-3xl md:text-3xl lg:text-4xl text-slate-900 dark:text-white mt-0 mb-4 w-full break-words">
            {title}
          </h1>
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-xs text-muted-foreground">
            <span>{date} | {readingTime}</span>
            {#if readCount !== null}
              <span class="text-muted-foreground/30">•</span>
              <span>{readCount.toLocaleString()} reads</span>
            {/if}
            {#each themes as theme}
              <span class="text-muted-foreground/30">•</span>
              <span class="pride-text lowercase font-medium">{theme}</span>
            {/each}
          </div>
        </div>
      </section>

      <!-- Main Article Area Grid -->
      <div class="blog-post-shell">
        <article id="content" class="relative min-w-0">
          <!-- Desktop sidebar - absolutely positioned to the left -->
          <div class="hidden xl:block absolute right-full mr-8 2xl:mr-12 top-0 bottom-0 pointer-events-none">
            <div class="sticky top-24 pointer-events-auto flex justify-end">
              <ArticleSectionPreview articleId="content" />
            </div>
          </div>

          <!-- Mobile sticky section bar -->
          <div class="xl:hidden">
            <ArticleSectionPreviewMobile articleId="content" />
          </div>

          <div
            id="blog-content-body"
            class="prose prose-panel max-w-none pb-24 pt-2 xl:pb-0 dark:prose-invert relative overflow-x-hidden {contentClassName}"
          >
            <slot />
          </div>
        </article>

        <ArticleLineRail articleId="content" />
      </div>
    </div>
  </BaseContainer>

  <SiteFooter color="blue" />
</div>
