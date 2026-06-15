<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy, onMount } from 'svelte';

  export let articleId = 'content';

  const railHeight = 400;
  let railRef: HTMLDivElement | null = null;
  let article: HTMLElement | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let totalLines = 1;
  let currentLine = 1;
  let hoverLine: number | null = null;
  let isDragging = false;

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const formatLine = (value: number) => String(value).padStart(2, '0');

  $: activeLine = hoverLine ?? currentLine;
  $: thumbOffset = totalLines > 1 ? ((activeLine - 1) / (totalLines - 1)) * 100 : 0;
  $: checkpoints = Array.from({ length: 11 }, (_, index) => index / 10);

  function measure() {
    if (!article) return;

    const probe =
      article.querySelector('p, li, blockquote, pre, code') ??
      article.querySelector('div') ??
      article;
    const styles = window.getComputedStyle(probe);
    const lineHeightValue = Number.parseFloat(styles.lineHeight);
    const fontSizeValue = Number.parseFloat(styles.fontSize);
    const fallbackLineHeight = Number.isFinite(fontSizeValue) ? fontSizeValue * 1.7 : 28;
    const lineHeight = Number.isFinite(lineHeightValue) ? lineHeightValue : fallbackLineHeight;

    totalLines = Math.max(1, Math.ceil(article.scrollHeight / lineHeight));
  }

  function updateCurrentLine() {
    if (!article) return;

    const articleTop = article.getBoundingClientRect().top + window.scrollY;
    const range = Math.max(1, article.offsetHeight - window.innerHeight * 0.45);
    const progress = clamp((window.scrollY - articleTop) / range, 0, 1);

    currentLine = Math.max(1, Math.round(progress * (totalLines - 1)) + 1);
  }

  function scrollToRatio(ratio: number) {
    if (!article) return;

    const articleTop = article.getBoundingClientRect().top + window.scrollY;
    const range = Math.max(0, article.offsetHeight - window.innerHeight * 0.45);
    const safeRatio = clamp(ratio, 0, 1);
    const targetLine = Math.max(1, Math.round(safeRatio * (totalLines - 1)) + 1);

    hoverLine = targetLine;
    currentLine = targetLine;
    window.scrollTo({
      top: articleTop + safeRatio * range,
      behavior: isDragging ? 'auto' : 'smooth'
    });
  }

  function updateFromPointer(clientY: number) {
    if (!railRef) return;

    const rect = railRef.getBoundingClientRect();
    scrollToRatio(clamp((clientY - rect.top) / rect.height, 0, 1));
  }

  onMount(() => {
    article = document.getElementById(articleId);
    if (!article) return;

    measure();
    updateCurrentLine();

    resizeObserver = new ResizeObserver(() => {
      measure();
      updateCurrentLine();
    });
    resizeObserver.observe(article);

    window.addEventListener('resize', measure);
    window.addEventListener('scroll', updateCurrentLine, { passive: true });
  });

  onDestroy(() => {
    if (!browser) return;

    resizeObserver?.disconnect();
    window.removeEventListener('resize', measure);
    window.removeEventListener('scroll', updateCurrentLine);
  });
</script>

<aside class="article-line-rail" aria-label="Article line position">
  <div class="article-line-rail-label">Lines</div>
  <div class="article-line-rail-track-wrap">
    <div
      bind:this={railRef}
      class="article-line-rail-track"
      style={`height: ${railHeight}px`}
      role="slider"
      tabindex="0"
      aria-valuemin="1"
      aria-valuemax={totalLines}
      aria-valuenow={activeLine}
      aria-label="Scroll article by line"
      on:pointerdown={(event) => {
        isDragging = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        updateFromPointer(event.clientY);
      }}
      on:pointermove={(event) => {
        if (isDragging) {
          updateFromPointer(event.clientY);
          return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        const ratio = clamp((event.clientY - rect.top) / rect.height, 0, 1);
        hoverLine = Math.max(1, Math.round(ratio * (totalLines - 1)) + 1);
      }}
      on:pointerleave={() => {
        if (!isDragging) hoverLine = null;
      }}
      on:pointerup={(event) => {
        isDragging = false;
        hoverLine = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      on:keydown={(event) => {
        if (event.key === 'Home') scrollToRatio(0);
        if (event.key === 'End') scrollToRatio(1);
        if (event.key === 'ArrowUp') scrollToRatio((activeLine - 2) / Math.max(1, totalLines - 1));
        if (event.key === 'ArrowDown') scrollToRatio(activeLine / Math.max(1, totalLines - 1));
      }}
    >
      <div class="article-line-rail-bg"></div>
      <div class="article-line-rail-checkpoints">
        {#each checkpoints as ratio}
          {@const line = Math.max(1, Math.round(ratio * (totalLines - 1)) + 1)}
          {@const isActive = Math.abs(activeLine - line) < totalLines / 20}
          <div>
            <span class:active={isActive}></span>
          </div>
        {/each}
      </div>
      <div class="article-line-rail-thumb" style={`top: ${thumbOffset}%`}></div>
      <div class="article-line-rail-current" style={`top: ${thumbOffset}%`}>
        {formatLine(activeLine)}
      </div>
    </div>
  </div>
  <div class="article-line-rail-total">{formatLine(totalLines)} total</div>
</aside>
