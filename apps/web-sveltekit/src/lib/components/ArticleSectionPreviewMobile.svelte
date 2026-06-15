<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { ChevronDown } from '@lucide/svelte';

  export let articleId = 'content';

  type Section = { id: string; label: string; level: number };

  let sections: Section[] = [];
  let activeId = '';
  let minLevel = 2;
  let isClicking = false;
  let isScrolledPastStart = false;
  let isExpanded = false;

  function toSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function extractSections() {
    const article = document.getElementById(articleId);
    if (!article) return;
    const headings = Array.from(article.querySelectorAll('h2, h3, h4'));
    const slugCounts: Record<string, number> = {};
    sections = headings.map((h) => {
      if (!h.id) {
        const base = toSlug(h.textContent ?? '');
        slugCounts[base] = (slugCounts[base] ?? 0) + 1;
        h.id = slugCounts[base] > 1 ? `${base}-${slugCounts[base]}` : base;
      }
      return {
        id: h.id,
        label: (h.textContent ?? '').trim(),
        level: parseInt(h.tagName[1])
      };
    }).filter((s) => s.id);
    if (sections.length > 0) {
      minLevel = Math.min(...sections.map((s) => s.level));
      activeId = sections[0].id;
    }
  }

  function handleScroll() {
    if (sections.length === 0) return;

    const firstEl = document.getElementById(sections[0].id);
    if (firstEl) {
      isScrolledPastStart = firstEl.getBoundingClientRect().top <= 120;
    }

    if (isClicking) return;
    const threshold = 120;
    let current = sections[0].id;
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= threshold) current = section.id;
      else break;
    }
    if (current !== activeId) {
      activeId = current;
      isExpanded = false;
    }
  }

  function scrollToSection(id: string) {
    isExpanded = false;
    const el = document.getElementById(id);
    if (!el) return;
    isClicking = true;
    activeId = id;
    window.scrollTo({
      top: window.scrollY + el.getBoundingClientRect().top - 80,
      behavior: 'smooth'
    });
    setTimeout(() => (isClicking = false), 1000);
  }

  onMount(() => {
    extractSections();
    if (sections.length === 0) setTimeout(extractSections, 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('scroll', handleScroll);
    }
  });

  $: activeIndex = Math.max(0, sections.findIndex((s) => s.id === activeId));
  $: activeSection = sections[activeIndex];
</script>

{#if sections.length > 0 && isScrolledPastStart}
  <!-- Backdrop -->
  {#if isExpanded}
    <div
      class="article-mobile-toc-backdrop"
      on:click={() => (isExpanded = false)}
      role="presentation"
    ></div>
  {/if}

  <!-- Sticky bar -->
  <div class="article-mobile-toc" class:expanded={isExpanded}>
    <!-- Pride tint overlay -->
    <div class="article-mobile-toc-tint" aria-hidden="true"></div>
    <!-- Gloss sheen -->
    <div class="article-mobile-toc-sheen" aria-hidden="true"></div>

    <button
      type="button"
      class="article-mobile-toc-trigger"
      on:click={() => (isExpanded = !isExpanded)}
    >
      <div class="article-mobile-toc-info">
        <span class="article-mobile-toc-count">
          {String(activeIndex + 1).padStart(2, '0')}/{String(sections.length).padStart(2, '0')}
        </span>
        <span class="article-mobile-toc-title">
          {activeSection?.label ?? ''}
        </span>
      </div>
      <div class="article-mobile-toc-chevron" class:rotated={isExpanded}>
        <ChevronDown size={16} strokeWidth={1.8} />
      </div>
    </button>

    {#if isExpanded}
      <nav
        class="article-mobile-toc-nav"
        transition:slide={{ duration: 220, easing: quintOut }}
      >
        <div class="article-mobile-toc-nav-inner">
          {#each sections as section, index}
            {@const isActive = section.id === activeId}
            {@const indent = Math.max(0, section.level - minLevel)}
            <a
              href="#{section.id}"
              class="article-mobile-toc-nav-link"
              class:active={isActive}
              style="padding-left: {16 + indent * 12}px"
              on:click|preventDefault={() => scrollToSection(section.id)}
            >
              <span class="article-mobile-toc-nav-num">{String(index + 1).padStart(2, '0')}</span>
              <span class="article-mobile-toc-nav-label">{section.label}</span>
            </a>
          {/each}
        </div>
      </nav>
    {/if}
  </div>
{/if}
