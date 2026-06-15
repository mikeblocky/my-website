<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import { ChevronLeft, ChevronRight, Maximize2, X } from '@lucide/svelte';

  export let zines: any[] = [];

  let selectedSlug = zines[0]?.slug ?? '';
  $: selectedZine = zines.find((z) => z.slug === selectedSlug) ?? zines[0];

  let spreadStart = 0;
  let direction = 1;
  let isDesktop = false;
  let isFullscreen = false;
  let mounted = false;
  let transitioning = false;

  $: total = selectedZine?.pages?.length ?? 0;
  $: showSpread = isDesktop && selectedZine?.orientation === 'vertical';
  $: pageStep = showSpread ? 2 : 1;
  $: canGoPrev = spreadStart > 0;
  $: canGoNext = spreadStart + pageStep < total;
  $: currentSpread = showSpread ? Math.floor(spreadStart / 2) + 1 : spreadStart + 1;
  $: spreadCount = showSpread ? Math.max(1, Math.ceil(total / 2)) : Math.max(1, total);
  $: currentPage = selectedZine?.pages?.[spreadStart];
  $: nextPage = selectedZine?.pages?.[spreadStart + 1];
  $: currentRatio = currentPage ? currentPage.width / currentPage.height : 0.72;
  $: nextRatio = nextPage ? nextPage.width / nextPage.height : currentRatio;
  $: bookAspectRatio = showSpread ? currentRatio + nextRatio : currentRatio;
  $: isHorizontal = selectedZine?.orientation === 'horizontal';

  function selectZine(slug: string) {
    selectedSlug = slug;
    spreadStart = 0;
    direction = 1;
  }

  function goPrev() {
    if (!canGoPrev || transitioning) return;
    direction = -1;
    doTransition(() => {
      spreadStart = Math.max(0, spreadStart - pageStep);
    });
  }

  function goNext() {
    if (!canGoNext || transitioning) return;
    direction = 1;
    doTransition(() => {
      spreadStart = Math.min(total - 1, spreadStart + pageStep);
    });
  }

  function doTransition(fn: () => void) {
    transitioning = true;
    fn();
    setTimeout(() => { transitioning = false; }, 320);
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'Escape') isFullscreen = false;
  }

  onMount(() => {
    mounted = true;
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => { isDesktop = mq.matches; };
    update();
    mq.addEventListener('change', update);
    window.addEventListener('keydown', handleKey);
    return () => {
      mq.removeEventListener('change', update);
      window.removeEventListener('keydown', handleKey);
    };
  });

  $: if (isFullscreen && mounted) {
    document.body.style.overflow = 'hidden';
  } else if (mounted) {
    document.body.style.overflow = '';
  }
</script>

{#if selectedZine}
  <div class="zine-library">
    <aside class="zine-bookshelf">
      <p class="zine-shelf-label">bookshelf</p>
      <div class="zine-shelf-list">
        {#each zines as zine}
          <button
            type="button"
            class="zine-shelf-btn"
            class:active={selectedZine.slug === zine.slug}
            on:click={() => selectZine(zine.slug)}
          >
            <span class="zine-shelf-title">{zine.title}</span>
            <small class="zine-shelf-meta">{zine.orientation.substring(0, 3)} · {zine.pages.length}p · {zine.year}</small>
          </button>
        {/each}
      </div>
    </aside>

    <section class="zine-reader">
      <header class="zine-reader-header">
        <p class="zine-reader-eyebrow">{selectedZine.year} · {selectedZine.orientation}</p>
        <h2 class="zine-reader-title">{selectedZine.title}</h2>
        <p class="zine-reader-subtitle">{selectedZine.subtitle}</p>
      </header>

      <div class="zine-book-wrap">
        <div
          class="zine-book-outer"
          style="max-width: min({isHorizontal ? 1500 : 1180}px, 96vw, calc(78vh * {bookAspectRatio}))"
        >
          <div class="zine-book-frame" class:spread={showSpread}>
            {#if showSpread && spreadStart + 1 < total}
              <div class="zine-spine" aria-hidden="true"></div>
            {/if}

            <div
              class="zine-book-inner"
              class:spread={showSpread}
              style="aspect-ratio: {bookAspectRatio}"
            >
              {#if showSpread}
                <!-- Left page -->
                <button
                  type="button"
                  class="zine-page-btn left"
                  disabled={!canGoPrev}
                  aria-label="Previous spread"
                  on:click={goPrev}
                >
                  <div class="zine-page-img" class:transitioning>
                    {#if currentPage}
                      <img src={currentPage.src} alt={currentPage.alt} loading="lazy" />
                      <div class="zine-page-fold left"></div>
                    {:else}
                      <div class="zine-blank">Blank</div>
                    {/if}
                  </div>
                  <span class="zine-page-hover-gradient left"></span>
                </button>

                <!-- Right page -->
                <button
                  type="button"
                  class="zine-page-btn right"
                  disabled={!canGoNext}
                  aria-label="Next spread"
                  on:click={goNext}
                >
                  <div class="zine-page-img" class:transitioning>
                    {#if nextPage}
                      <img src={nextPage.src} alt={nextPage.alt} loading="lazy" />
                      <div class="zine-page-fold right"></div>
                    {:else}
                      <div class="zine-blank">Blank</div>
                    {/if}
                  </div>
                  <span class="zine-page-hover-gradient right"></span>
                </button>
              {:else}
                <!-- Single page -->
                <button
                  type="button"
                  class="zine-page-btn single"
                  disabled={!canGoNext}
                  aria-label="Next page"
                  on:click={goNext}
                >
                  <div class="zine-page-img" class:transitioning>
                    {#if currentPage}
                      <img src={currentPage.src} alt={currentPage.alt} loading="lazy" />
                    {:else}
                      <div class="zine-blank">Blank</div>
                    {/if}
                  </div>
                  <span class="zine-page-hover-gradient right"></span>
                </button>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <div class="zine-controls">
        <p class="zine-page-count">
          {showSpread ? 'spread' : 'page'} {currentSpread} of {spreadCount}
        </p>
        <div class="zine-control-btns">
          <button
            type="button"
            class="zine-ctrl-btn label"
            on:click={() => (isFullscreen = true)}
            aria-label="View full page"
          >
            <Maximize2 size={12} />
            <span>full-page</span>
          </button>
          <button
            type="button"
            class="zine-ctrl-btn icon"
            disabled={!canGoPrev}
            aria-label="Previous pages"
            on:click={goPrev}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            class="zine-ctrl-btn icon"
            disabled={!canGoNext}
            aria-label="Next pages"
            on:click={goNext}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  </div>
{:else}
  <div class="empty-panel">No zines are available yet.</div>
{/if}

{#if mounted && isFullscreen}
  <div
    class="zine-fullscreen"
    role="button"
    tabindex="-1"
    aria-label="Close fullscreen"
    on:click={() => (isFullscreen = false)}
    on:keydown={(e) => e.key === 'Escape' && (isFullscreen = false)}
    transition:fade={{ duration: 200 }}
  >
    <!-- Floating controls bar -->
    <div
      class="zine-fs-controls"
      role="toolbar"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <button
        type="button"
        class="zine-fs-btn icon"
        disabled={!canGoPrev}
        aria-label="Previous"
        on:click={goPrev}
      >
        <ChevronLeft size={16} />
      </button>
      <span class="zine-fs-count">
        {showSpread ? 'spread' : 'page'} {currentSpread} of {spreadCount}
      </span>
      <button
        type="button"
        class="zine-fs-btn icon"
        disabled={!canGoNext}
        aria-label="Next"
        on:click={goNext}
      >
        <ChevronRight size={16} />
      </button>
      <button
        type="button"
        class="zine-fs-btn close"
        aria-label="Minimize"
        on:click={() => (isFullscreen = false)}
      >
        <X size={12} />
        <span>minimize</span>
      </button>
    </div>

    <!-- Main fullscreen content -->
    <div
      class="zine-fs-main"
      role="presentation"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <button
        type="button"
        class="zine-fs-arrow left"
        disabled={!canGoPrev}
        aria-label="Previous spread"
        on:click={goPrev}
      >
        <ChevronLeft size={32} />
      </button>

      <div
        class="zine-fs-book"
        style="aspect-ratio: {bookAspectRatio}; max-width: min(100%, calc(74vh * {bookAspectRatio}))"
      >
        <div class="zine-book-frame fs" class:spread={showSpread}>
          {#if showSpread && spreadStart + 1 < total}
            <div class="zine-spine" aria-hidden="true"></div>
          {/if}
          <div class="zine-book-inner spread fs" class:spread={showSpread}>
            {#if showSpread}
              <div class="zine-page-img fs" class:transitioning>
                {#if currentPage}
                  <img src={currentPage.src} alt={currentPage.alt} loading="lazy" />
                  <div class="zine-page-fold left"></div>
                {:else}
                  <div class="zine-blank">Blank</div>
                {/if}
              </div>
              <div class="zine-page-img fs" class:transitioning>
                {#if nextPage}
                  <img src={nextPage.src} alt={nextPage.alt} loading="lazy" />
                  <div class="zine-page-fold right"></div>
                {:else}
                  <div class="zine-blank">Blank</div>
                {/if}
              </div>
            {:else}
              <div class="zine-page-img fs" class:transitioning>
                {#if currentPage}
                  <img src={currentPage.src} alt={currentPage.alt} loading="lazy" />
                {:else}
                  <div class="zine-blank">Blank</div>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <button
        type="button"
        class="zine-fs-arrow right"
        disabled={!canGoNext}
        aria-label="Next spread"
        on:click={goNext}
      >
        <ChevronRight size={32} />
      </button>
    </div>
  </div>
{/if}

<style>
  .zine-library {
    display: grid;
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    .zine-library {
      grid-template-columns: 260px minmax(0, 1fr);
      gap: 2rem;
    }
  }

  .zine-bookshelf {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .zine-shelf-label {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.12em;
    text-transform: lowercase;
    color: hsl(var(--muted-foreground));
  }

  .zine-shelf-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .zine-shelf-btn {
    width: 100%;
    padding: 0.625rem 0.75rem;
    text-align: left;
    border-radius: 0.375rem;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    transition: background 250ms ease, border-color 250ms ease;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .zine-shelf-btn:hover {
    background: hsl(var(--muted) / 0.3);
  }

  .zine-shelf-btn.active {
    border-color: hsl(var(--pride-glow-val) / 0.45);
    background: hsl(var(--pride-glow-val) / 0.05);
  }

  .zine-shelf-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: hsl(var(--foreground));
    line-height: 1.3;
  }

  .zine-shelf-meta {
    font-family: var(--font-mono);
    font-size: 0.5625rem;
    letter-spacing: 0.1em;
    text-transform: lowercase;
    color: hsl(var(--muted-foreground));
  }

  .zine-reader {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .zine-reader-header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-bottom: 1rem;
  }

  .zine-reader-eyebrow {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.12em;
    text-transform: lowercase;
    color: hsl(var(--pride-glow-val));
    font-weight: 600;
  }

  .zine-reader-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: hsl(var(--foreground));
  }

  .zine-reader-subtitle {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.6;
    color: hsl(var(--muted-foreground));
    max-width: 42rem;
  }

  .zine-book-wrap {
    display: flex;
    justify-content: flex-start;
  }

  .zine-book-outer {
    width: 100%;
  }

  .zine-book-frame {
    position: relative;
    border-radius: 0.375rem;
    border: 1px solid hsl(var(--border) / 0.8);
    background: hsl(220 20% 97%);
    padding: 0.5rem;
  }

  :global(.dark) .zine-book-frame {
    background: hsl(220 15% 8%);
    border-color: hsl(var(--border));
  }

  .zine-book-inner {
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;
    max-height: 78vh;
    min-height: 220px;
    overflow: hidden;
    border-radius: 0.25rem;
    background: white;
  }

  :global(.dark) .zine-book-inner {
    background: hsl(240 10% 5%);
  }

  .zine-book-inner.spread {
    grid-template-columns: 1fr 1fr;
  }

  .zine-spine {
    position: absolute;
    top: 1rem;
    bottom: 1rem;
    left: 50%;
    width: 1px;
    transform: translateX(-50%);
    z-index: 10;
    background: linear-gradient(to bottom, transparent, hsl(220 15% 60% / 0.15), transparent);
    pointer-events: none;
  }

  .zine-page-btn {
    position: relative;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    outline: none;
    text-align: left;
    height: 100%;
    overflow: hidden;
    display: block;
  }

  .zine-page-btn.single {
    width: 100%;
  }

  .zine-page-btn:disabled {
    cursor: default;
  }

  .zine-page-img {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    transition: opacity 0.28s ease, transform 0.28s ease;
  }

  :global(.dark) .zine-page-img {
    background: hsl(240 10% 5%);
  }

  .zine-page-img.transitioning {
    opacity: 0.5;
    transform: scale(0.985);
  }

  .zine-page-img img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 0.5rem;
    display: block;
  }

  .zine-page-img.fs img {
    padding: 0.75rem;
  }

  .zine-page-fold {
    position: absolute;
    inset-block: 0;
    width: 3rem;
    pointer-events: none;
  }

  .zine-page-fold.left {
    right: 0;
    background: linear-gradient(to left, rgba(0,0,0,0.08), transparent);
  }

  .zine-page-fold.right {
    left: 0;
    background: linear-gradient(to right, rgba(0,0,0,0.1), transparent);
  }

  .zine-page-hover-gradient {
    position: absolute;
    inset-block: 0;
    width: 6rem;
    pointer-events: none;
    opacity: 0;
    transition: opacity 200ms ease;
  }

  .zine-page-hover-gradient.left {
    left: 0;
    background: linear-gradient(to right, rgba(0,0,0,0), transparent);
  }

  .zine-page-hover-gradient.right {
    right: 0;
    background: linear-gradient(to left, rgba(0,0,0,0), transparent);
  }

  .zine-page-btn:hover .zine-page-hover-gradient {
    opacity: 1;
  }

  .zine-blank {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 0.75rem;
    color: hsl(var(--muted-foreground) / 0.4);
  }

  .zine-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  @media (min-width: 640px) {
    .zine-controls {
      flex-direction: row;
    }
  }

  .zine-page-count {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.12em;
    text-transform: lowercase;
    color: hsl(var(--muted-foreground));
  }

  .zine-control-btns {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .zine-ctrl-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    border: 1px solid hsl(var(--border));
    background: hsl(var(--background));
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    transition: border-color 180ms ease, color 180ms ease;
  }

  .zine-ctrl-btn:hover {
    border-color: hsl(var(--pride-glow-val) / 0.4);
    color: hsl(var(--pride-glow-val));
  }

  .zine-ctrl-btn:disabled {
    opacity: 0.35;
    pointer-events: none;
  }

  .zine-ctrl-btn.label {
    gap: 0.5rem;
    padding: 0 1.125rem;
    height: 2.25rem;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.12em;
    text-transform: lowercase;
  }

  .zine-ctrl-btn.icon {
    width: 2.25rem;
    height: 2.25rem;
  }

  /* Fullscreen overlay */
  .zine-fullscreen {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    background: hsl(220 20% 96% / 0.4);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    padding: 0.5rem;
    cursor: zoom-out;
    color: hsl(var(--foreground));
  }

  :global(.dark) .zine-fullscreen {
    background: hsl(0 0% 0% / 0.4);
  }

  .zine-fs-controls {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 60;
    display: flex;
    align-items: center;
    gap: 1rem;
    background: hsl(var(--background) / 0.95);
    border: 1px solid hsl(var(--border));
    border-radius: 0.375rem;
    padding: 0.5rem 1rem;
    cursor: default;
  }

  .zine-fs-count {
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.1em;
    text-transform: lowercase;
    color: hsl(var(--muted-foreground));
    border-right: 1px solid hsl(var(--border));
    padding-right: 1rem;
  }

  .zine-fs-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    border: none;
    background: transparent;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    transition: color 180ms ease, background 180ms ease;
  }

  .zine-fs-btn:hover {
    color: hsl(var(--pride-glow-val));
    background: hsl(var(--pride-glow-val) / 0.08);
  }

  .zine-fs-btn:disabled {
    opacity: 0.35;
    pointer-events: none;
  }

  .zine-fs-btn.icon {
    width: 1.75rem;
    height: 1.75rem;
  }

  .zine-fs-btn.close {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0 0.75rem;
    height: 1.75rem;
    font-family: var(--font-mono);
    font-size: 0.625rem;
    letter-spacing: 0.1em;
    text-transform: lowercase;
    background: hsl(var(--muted) / 0.5);
    border-radius: 0.375rem;
  }

  .zine-fs-main {
    position: relative;
    width: 100%;
    height: 100%;
    max-height: 74vh;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
  }

  .zine-fs-book {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
  }

  .zine-book-frame.fs {
    width: 100%;
    height: 100%;
    border-color: hsl(var(--border) / 0.4);
    background: hsl(220 20% 97% / 0.05);
    padding: 0.5rem;
  }

  :global(.dark) .zine-book-frame.fs {
    background: hsl(0 0% 0% / 0.05);
    border-color: hsl(220 15% 80% / 0.05);
  }

  .zine-book-inner.fs {
    max-height: none;
    height: 100%;
  }

  .zine-page-img.fs {
    height: 100%;
  }

  .zine-fs-arrow {
    position: absolute;
    z-index: 30;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 0.375rem;
    border: none;
    background: rgba(0,0,0,0.1);
    color: rgba(255,255,255,0.3);
    opacity: 0;
    cursor: pointer;
    transition: opacity 300ms ease, background 300ms ease, color 300ms ease;
  }

  .zine-fs-arrow:hover {
    opacity: 1;
    background: rgba(0,0,0,0.45);
    color: white;
  }

  .zine-fs-arrow:disabled {
    opacity: 0;
    pointer-events: none;
  }

  .zine-fs-arrow.left { left: 1rem; }
  .zine-fs-arrow.right { right: 1rem; }
</style>
