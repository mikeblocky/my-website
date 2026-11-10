<script lang="ts">
  import ArtworkCarousel from './ArtworkCarousel.svelte';
  import PillTabs from './PillTabs.svelte';
  import ImageGallery from './ImageGallery.svelte';

  type ArtworkItem = {
    src: string;
    previewSrc?: string;
    viewerSrc?: string;
    width: number;
    height: number;
    isPortrait?: boolean;
  };

  type ArtworkSection = {
    title: string;
    items: ArtworkItem[];
  };

  type ArtworkStat = {
    label: string;
    value: number;
    color: string;
  };

  export let sections: ArtworkSection[] = [];
  export let stats: ArtworkStat[] = [];

  const tabs = [
    { id: 'illustrations', label: 'Illustrations' },
    { id: 'stats', label: 'Theme breakdown & stats' }
  ];

  let activeTab = 'illustrations';
  let activeIdx: number | null = null;

  $: allUrls = sections.flatMap((sec) => sec.items.map((item) => item.viewerSrc ?? item.src));
  $: total = stats.reduce((sum, item) => sum + item.value, 0);
</script>

<section class="gallery-client">
  <PillTabs
    bind:activeTab
    {tabs}
    ariaLabel="Gallery tabs"
    storageKey="mikeblocky:artworks-tab"
    syncUrl
  />

  {#key activeTab}
  <div class="smooth-panel">
    {#if activeTab === 'illustrations'}
      <div class="artwork-sections">
        {#each sections as section, sIdx}
          <ArtworkCarousel title={section.title} items={section.items} onOpen={(index) => activeIdx = sections.slice(0, sIdx).reduce((sum, item) => sum + item.items.length, 0) + index} />
        {/each}
      </div>
    {:else}
      <section class="stats-panel">
        <div>
          <h3>Total works</h3>
          <p>{total}</p>
        </div>
        <div class="stats-list">
          {#each stats as item, index}
            <article style={`--stat-index: ${index}; --stat-width: ${total > 0 ? (item.value / total) * 100 : 0}%`}>
              <div>
                <span>{item.label}</span>
                <small>{item.value} works ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)</small>
              </div>
              <div class="stats-bar" aria-hidden="true">
                <i class={`stat-color-${item.color}`}></i>
              </div>
            </article>
          {/each}
        </div>
      </section>
    {/if}
  </div>
  {/key}
</section>

<ImageGallery
  bind:activeIdx
  urls={allUrls}
  showThumbnails={false}
/>
