<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { browser } from '$app/environment';

  export let articleId = 'content';

  type Section = { id: string; label: string; level: number };

  let sections: Section[] = [];
  let activeId = '';
  let minLevel = 2;
  let isClicking = false;
  let tocListEl: HTMLDivElement | null = null;

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
    if (isClicking || sections.length === 0) return;
    const threshold = 120;
    let current = sections[0].id;
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= threshold) current = section.id;
      else break;
    }
    activeId = current;
  }

  function scrollToSection(id: string) {
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

  // Auto-scroll TOC to keep active item visible
  async function scrollTocToActive() {
    await tick();
    if (!tocListEl) return;
    const activeEl = tocListEl.querySelector('.article-toc-link.active') as HTMLElement | null;
    if (!activeEl) return;
    activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  $: if (activeId) scrollTocToActive();

  onMount(() => {
    extractSections();
    if (sections.length === 0) setTimeout(extractSections, 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    }
  });

  $: activeIndex = Math.max(0, sections.findIndex((s) => s.id === activeId));
</script>

{#if sections.length > 0}
  <div class="article-toc">
    <div class="article-toc-header">
      <span class="article-toc-label">Table of contents</span>
      <div class="article-toc-divider"></div>
    </div>
    <div class="article-toc-list" bind:this={tocListEl}>
      {#each sections as section, index}
        {@const isActive = section.id === activeId}
        {@const indent = Math.max(0, section.level - minLevel)}
        <a
          href="#{section.id}"
          class="article-toc-link"
          class:active={isActive}
          style="padding-right: {indent * 8}px"
          on:click|preventDefault={() => scrollToSection(section.id)}
        >
          <div class="article-toc-link-inner">
            <span class="article-toc-num" class:active={isActive}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span class="article-toc-text" class:active={isActive}>
              {section.label}
            </span>
          </div>
          <div class="article-toc-bar" class:active={isActive}></div>
        </a>
      {/each}
    </div>
  </div>
{/if}
