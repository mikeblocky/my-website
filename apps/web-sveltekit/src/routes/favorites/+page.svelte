<script lang="ts">
  import PillTabs from '$lib/components/PillTabs.svelte';
  import RecommendationCard from '$lib/components/RecommendationCard.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { LayoutGrid, LayoutList } from '@lucide/svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';

  export let data;
  $: groups = Object.entries(data.recommendationGroups ?? {});
  $: tabs = [...groups.map(([id, group]) => ({ id, label: group.label, count: group.items.length })), { id: 'generator', label: 'Card generator' }];
  let activeTab = '';
  let RecommendationGenerator: any = null;
  let isLoadingGenerator = false;
  $: if (!activeTab && groups[0]) activeTab = groups[0][0];
  $: activeGroup = activeTab === 'generator' ? null : groups.find(([id]) => id === activeTab)?.[1] ?? groups[0]?.[1];
  let viewMode: 'detailed' | 'simplified' = 'detailed';
  let capturingId: string | null = null;

  $: rowCount = activeGroup ? Math.ceil(activeGroup.items.length / 2) : 0;
  $: blockCount = activeGroup ? Math.ceil(activeGroup.items.length / 4) : 0;

  onMount(() => {
    const stored = localStorage.getItem('mikeblocky:recommendations-view');
    if (stored === 'detailed' || stored === 'simplified') viewMode = stored;
  });

  async function loadGenerator() {
    if (RecommendationGenerator || isLoadingGenerator) return;
    isLoadingGenerator = true;
    try {
      RecommendationGenerator = (await import('$lib/components/RecommendationGenerator.svelte')).default;
    } finally {
      isLoadingGenerator = false;
    }
  }

  $: if (browser && activeTab === 'generator') {
    loadGenerator();
  }

  function setViewMode(mode: 'detailed' | 'simplified') {
    viewMode = mode;
    if (browser) localStorage.setItem('mikeblocky:recommendations-view', mode);
  }

  async function captureElement(wrapperId: string, filename: string) {
    if (!browser) return;
    const element = document.getElementById(wrapperId);
    if (!element) return;

    capturingId = wrapperId;
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(element, {
        style: {
          transform: 'none'
        }
      });
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to capture favorites row:', error);
    } finally {
      capturingId = null;
    }
  }
</script>

<SeoHead title="favorites" path="/favorites" description="A collection of manga, anime, music, and games that have resonated with me." />

<SectionPageShell
  title="Favorites"
  description="A shelf of favorite manga, anime, games, and music I keep returning to."
  currentLabel="Favorites"
  footerColor="blue"
>
  <section class="recommendations-client">
    <div class="favorites-toolbar">
      <PillTabs
        bind:activeTab
        {tabs}
        ariaLabel="Recommendation categories"
        storageKey="mikeblocky:recommendations-tab"
        syncUrl
      />

      {#if activeGroup}
        <div class="favorites-view-toggle" aria-label="Recommendation view mode">
          <button type="button" class:active={viewMode === 'detailed'} on:click={() => setViewMode('detailed')}>
            <LayoutList size={12} />
            <span>Detailed</span>
          </button>
          <button type="button" class:active={viewMode === 'simplified'} on:click={() => setViewMode('simplified')}>
            <LayoutGrid size={12} />
            <span>Simplified</span>
          </button>
        </div>
      {/if}
    </div>

    {#key activeTab}
    <div class="smooth-panel">
    {#if activeTab === 'generator'}
      {#if RecommendationGenerator}
        <svelte:component this={RecommendationGenerator} />
      {:else}
        <div class="loading-surface" aria-live="polite">
          <div>
            <i></i>
            <span>loading generator...</span>
          </div>
        </div>
      {/if}
    {:else if activeGroup}
      <div class="favorites-capture-panel">
        <div class="favorites-capture-group">
          <span>Capture row</span>
          <div class="favorites-capture-group-buttons">
            {#each Array(rowCount) as _, rowIdx}
              <button
                type="button"
                disabled={capturingId !== null}
                class:active={capturingId === `favorites-official-row-wrapper-${rowIdx}`}
                on:click={() => captureElement(`favorites-official-row-wrapper-${rowIdx}`, `favorites-${activeTab}-row-${rowIdx + 1}.png`)}
              >
                {capturingId === `favorites-official-row-wrapper-${rowIdx}` ? 'saving...' : rowIdx + 1}
              </button>
            {/each}
          </div>
        </div>

        {#if activeGroup.items.length > 2}
          <div class="favorites-capture-group favorites-capture-group-bordered">
            <span>Capture 2 rows</span>
            <div class="favorites-capture-group-buttons">
              {#each Array(blockCount) as _, blockIdx}
                {@const startRow = blockIdx * 2 + 1}
                {@const endRow = Math.min(blockIdx * 2 + 2, rowCount)}
                {@const label = startRow === endRow ? `${startRow}` : `${startRow}-${endRow}`}
                <button
                  type="button"
                  disabled={capturingId !== null}
                  class:active={capturingId === `favorites-official-block-wrapper-${blockIdx}`}
                  on:click={() => captureElement(`favorites-official-block-wrapper-${blockIdx}`, `favorites-${activeTab}-rows-${label}.png`)}
                >
                  {capturingId === `favorites-official-block-wrapper-${blockIdx}` ? 'saving...' : label}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div class="recommendation-block-list">
        {#each Array(blockCount) as _, blockIdx}
          <div
            id={`favorites-official-block-wrapper-${blockIdx}`}
            class:official-bg-preview={capturingId === `favorites-official-block-wrapper-${blockIdx}`}
            class="recommendation-capture-block"
          >
            <div class="recommendation-capture-block-inner">
              {#each Array(2) as _, localRowIdx}
                {@const rowIdx = blockIdx * 2 + localRowIdx}
                {@const rowItems = activeGroup.items.slice(rowIdx * 2, rowIdx * 2 + 2)}
                {#if rowItems.length > 0}
                  <div
                    id={`favorites-official-row-wrapper-${rowIdx}`}
                    class:official-bg-preview={capturingId === `favorites-official-row-wrapper-${rowIdx}`}
                    class="recommendation-capture-row"
                  >
                    <div class="recommendation-card-grid recommendation-card-grid-row">
                      {#each rowItems as item}
                        <RecommendationCard {item} {viewMode} />
                      {/each}
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/if}
    </div>
    {/key}
  </section>
</SectionPageShell>
