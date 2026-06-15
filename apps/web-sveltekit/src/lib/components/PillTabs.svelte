<script lang="ts" context="module">
  export type TabItem = {
    id: string;
    label: string;
    count?: number;
  };
</script>

<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount, tick } from 'svelte';

  export let tabs: TabItem[] = [];
  export let activeTab = tabs[0]?.id ?? '';
  export let ariaLabel = 'Section tabs';
  export let storageKey = '';
  export let syncUrl = false;

  let scroller: HTMLDivElement;
  let canScrollLeft = false;
  let canScrollRight = false;

  function isValidTab(value: string) {
    return tabs.some((tab) => tab.id === value);
  }

  function updateScrollState() {
    if (!scroller) return;
    const { scrollLeft, scrollWidth, clientWidth } = scroller;
    // 1px tolerance so sub-pixel rounding doesn't leave a stuck indicator.
    canScrollLeft = scrollLeft > 1;
    canScrollRight = scrollLeft + clientWidth < scrollWidth - 1;
  }

  function scrollActiveIntoView() {
    if (!scroller) return;
    const el = scroller.querySelector<HTMLElement>('button[aria-selected="true"]');
    el?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }

  function setTab(id: string) {
    activeTab = id;

    if (!browser) return;
    if (storageKey) localStorage.setItem(storageKey, id);

    if (syncUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', id);
      window.history.replaceState({}, '', url);
    }

    tick().then(scrollActiveIntoView);
  }

  onMount(() => {
    const urlTab = syncUrl ? new URL(window.location.href).searchParams.get('tab') : null;
    const storedTab = storageKey ? localStorage.getItem(storageKey) : null;
    const nextTab = urlTab && isValidTab(urlTab) ? urlTab : storedTab && isValidTab(storedTab) ? storedTab : '';

    if (nextTab) activeTab = nextTab;

    tick().then(() => {
      updateScrollState();
      scrollActiveIntoView();
    });

    const ro = new ResizeObserver(updateScrollState);
    if (scroller) ro.observe(scroller);
    window.addEventListener('resize', updateScrollState);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScrollState);
    };
  });
</script>

<div class="pill-tabs-wrap" class:can-scroll-left={canScrollLeft} class:can-scroll-right={canScrollRight}>
  <div
    class="pill-tabs"
    role="tablist"
    aria-label={ariaLabel}
    bind:this={scroller}
    on:scroll={updateScrollState}
  >
    {#each tabs as tab}
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === tab.id}
        class:active={activeTab === tab.id}
        on:click={() => setTab(tab.id)}
      >
        {#if activeTab === tab.id}
          <span class="pill-active-bg" aria-hidden="true"></span>
        {/if}
        <span>{tab.label}</span>
        {#if typeof tab.count === 'number'}
          <small>{tab.count}</small>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .pill-tabs-wrap {
    position: relative;
    /* When used as a flex child (e.g. the favorites toolbar), allow the inner
       scroller to shrink below its content width instead of overflowing. */
    min-width: 0;
    max-width: 100%;
    flex: 1 1 auto;
  }

  /* Override the global wrapping behaviour: keep tabs on one line and let the
     row scroll horizontally whenever it overflows, on any screen size. */
  .pill-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    scrollbar-width: none; /* Firefox */
    scroll-padding-inline: 1.25rem;
    /* A little side padding so the fade overlays never clip the first/last pill. */
    padding-block: 2px;
  }

  .pill-tabs::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  .pill-tabs :global(button) {
    flex: 0 0 auto;
  }

  /* Edge fade indicators — only visible when there's more to scroll toward. */
  .pill-tabs-wrap::before,
  .pill-tabs-wrap::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2.5rem;
    pointer-events: none;
    opacity: 0;
    transition: opacity 180ms ease;
    z-index: 2;
  }

  .pill-tabs-wrap::before {
    left: 0;
    background: linear-gradient(to right, hsl(var(--background)), hsl(var(--background) / 0));
  }

  /* Right side: a fade plus a chevron hint to signal "more tabs this way". */
  .pill-tabs-wrap::after {
    right: 0;
    background:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='9 18 15 12 9 6'/%3E%3C/svg%3E"),
      linear-gradient(to left, hsl(var(--background)) 35%, hsl(var(--background) / 0));
    background-repeat: no-repeat, no-repeat;
    background-position: right 0.4rem center, center;
  }

  .pill-tabs-wrap.can-scroll-left::before {
    opacity: 1;
  }

  .pill-tabs-wrap.can-scroll-right::after {
    opacity: 1;
  }
</style>
