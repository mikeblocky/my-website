<script lang="ts">
  import { onMount } from 'svelte';
  import { Plus, Trash2, Download, Copy, Upload, Check, Image as ImageIcon, LayoutGrid, Eye } from '@lucide/svelte';
  import RecommendationCard from './RecommendationCard.svelte';
  import ImageCropperModal from './ImageCropperModal.svelte';

  type Recommendation = {
    id: string;
    title: string;
    creator: string;
    medium: string;
    thought: string;
    links: { label: string; url: string }[];
    imageUrl?: string;
    status?: string;
    category?: string;
  };

  let items: Recommendation[] = [
    {
      id: 'default-1',
      title: 'Skip and Loafer (スキップとローファー)',
      creator: 'Misaki Takamatsu',
      medium: 'Manga',
      thought: "Every time I reread this, I'm reminded of how rare it is for a story to treat its characters with such complete kindness.",
      links: [{ label: 'Latest volume', url: 'https://example.com/volume' }]
    },
    {
      id: 'default-2',
      title: 'OMORI',
      creator: 'OMOCAT',
      medium: 'Game',
      thought: 'I like how cute and uneasy it is at the same time.',
      links: [{ label: 'Official site', url: 'https://www.omori-game.com/' }]
    }
  ];

  let activeIndex = 0;
  let previewMode: 'grid' | 'row' | 'single' = 'grid';
  let isCopying = false;
  let isExporting = false;
  let isInitialized = false;
  let pendingImageSrc: string | null = null;
  let fileInputEl: HTMLInputElement;
  let dragActive = false;

  $: activeItem = items[activeIndex] || items[0];

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('data');
    if (!dataParam) {
      try {
        const cachedItems = localStorage.getItem('mikeblocky:favorites-generator-items');
        if (cachedItems) {
          const parsed = JSON.parse(cachedItems);
          if (Array.isArray(parsed) && parsed.length > 0) {
            items = parsed.map((item: any, idx: number) => ({
              ...item,
              id: item.id || `cached-${idx}-${Math.random().toString(36).substr(2, 9)}`
            }));
          }
        }
        const cachedIdx = localStorage.getItem('mikeblocky:favorites-generator-active-index');
        if (cachedIdx) {
          const idx = parseInt(cachedIdx, 10);
          if (!isNaN(idx)) activeIndex = Math.max(0, Math.min(idx, items.length - 1));
        }
        const cachedMode = localStorage.getItem('mikeblocky:favorites-generator-preview-mode');
        if (cachedMode === 'grid' || cachedMode === 'row' || cachedMode === 'single') previewMode = cachedMode;
      } catch (e) { /* ignore */ }
    } else {
      try {
        let sanitized = dataParam.replace(/ /g, '+');
        while (sanitized.length % 4 !== 0) sanitized += '=';
        if (/^[A-Za-z0-9+/]+=*$/.test(sanitized)) {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(sanitized))));
          if (Array.isArray(decoded) && decoded.length > 0) {
            items = decoded.map(({ title, creator, medium, thought, links, imageUrl }: any, idx: number) => ({
              id: `shared-${idx}-${Math.random().toString(36).substr(2, 9)}`,
              title, creator, medium, thought, links, imageUrl
            }));
            activeIndex = 0;
            previewMode = 'grid';
          }
        }
      } catch (e) { /* ignore */ }
    }
    isInitialized = true;
  });

  $: if (isInitialized) {
    localStorage.setItem('mikeblocky:favorites-generator-items', JSON.stringify(items));
  }
  $: if (isInitialized) {
    localStorage.setItem('mikeblocky:favorites-generator-active-index', String(activeIndex));
  }
  $: if (isInitialized) {
    localStorage.setItem('mikeblocky:favorites-generator-preview-mode', previewMode);
  }

  function updateActiveItem(fields: Partial<Recommendation>) {
    items = items.map((item, idx) => (idx === activeIndex ? { ...item, ...fields } : item));
  }

  function addNewItem() {
    const newItem: Recommendation = {
      id: Math.random().toString(36).substr(2, 9),
      title: '', creator: '', medium: 'Manga', thought: '', links: []
    };
    items = [...items, newItem];
    activeIndex = items.length - 1;
  }

  function removeItem(index: number) {
    items = items.filter((_, idx) => idx !== index);
    if (items.length === 0) {
      items = [{ id: Math.random().toString(36).substr(2, 9), title: '', creator: '', medium: 'Manga', thought: '', links: [] }];
    }
    activeIndex = Math.max(0, index - 1);
  }

  function handleImageFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => { pendingImageSrc = reader.result as string; };
    reader.readAsDataURL(file);
  }

  function handleImageChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) handleImageFile(file);
  }

  function handleDrag(e: DragEvent) {
    e.preventDefault(); e.stopPropagation();
    dragActive = e.type === 'dragenter' || e.type === 'dragover';
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault(); e.stopPropagation();
    dragActive = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) handleImageFile(file);
  }

  function addLink() {
    const links = activeItem.links || [];
    if (links.length < 6) updateActiveItem({ links: [...links, { label: '', url: '' }] });
  }

  function updateLink(idx: number, key: 'label' | 'url', value: string) {
    const links = [...(activeItem.links || [])];
    links[idx] = { ...links[idx], [key]: value };
    updateActiveItem({ links });
  }

  function removeLink(idx: number) {
    updateActiveItem({ links: (activeItem.links || []).filter((_, i) => i !== idx) });
  }

  function buildFull(item: Recommendation): Recommendation {
    const m = (item.medium || '').toLowerCase();
    const category = ['manga', 'anime', 'film', 'game', 'music'].includes(m) ? m : 'manga';
    const status = item.medium === 'Manga' ? 'All-time favorite' : item.medium === 'Game' ? 'Emotional favorite' : 'Recommended';
    return { ...item, category, status };
  }

  function getJsonConfig() {
    return '[' + items.map((item) => {
      const f = buildFull(item);
      const links = (f.links || []).filter(l => l.label && l.url)
        .map(l => `\t\t\t\t\t{ label: ${JSON.stringify(l.label)}, url: ${JSON.stringify(l.url)} }`).join(',\n');
      return `\t\t\t{\n\t\t\t\ttitle: ${JSON.stringify(f.title)},\n\t\t\t\tcreator: ${JSON.stringify(f.creator)},\n\t\t\t\tcategory: ${JSON.stringify(f.category)},\n\t\t\t\tmedium: ${JSON.stringify(f.medium)},\n\t\t\t\tstatus: ${JSON.stringify(f.status)},\n\t\t\t\timageUrl: '/recommendations/your-image.jpg',\n\t\t\t\tthought: ${JSON.stringify(f.thought)},\n\t\t\t\tlinks: [\n${links}\n\t\t\t\t]\n\t\t\t}`;
    }).join(',\n') + '\n]';
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(getJsonConfig());
      isCopying = true;
      setTimeout(() => (isCopying = false), 2000);
    } catch (e) { /* ignore */ }
  }

  async function exportCardPng() {
    const el = document.getElementById('favorites-card-export-target');
    if (!el) return;
    isExporting = true;
    await new Promise(r => setTimeout(r, 120));
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(el, { style: { transform: 'none' } });
      const suffix = previewMode === 'single'
        ? activeItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : previewMode === 'row' ? `row-${Math.floor(activeIndex / 2) + 1}` : 'grid';
      const link = document.createElement('a');
      link.download = `favorites-${suffix}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { isExporting = false; }
  }

  async function exportAllRows() {
    const origMode = previewMode;
    const origIdx = activeIndex;
    isExporting = true;
    try {
      const el = document.getElementById('favorites-card-export-target');
      if (!el) return;
      const rowCount = Math.ceil(items.length / 2);
      const { toPng } = await import('html-to-image');
      for (let i = 0; i < rowCount; i++) {
        activeIndex = i * 2;
        previewMode = 'row';
        await new Promise(r => setTimeout(r, 200));
        const dataUrl = await toPng(el, { style: { transform: 'none' } });
        const link = document.createElement('a');
        link.download = `favorites-row-${i + 1}.png`;
        link.href = dataUrl;
        link.click();
        await new Promise(r => setTimeout(r, 300));
      }
    } catch (e) { console.error(e); }
    finally {
      previewMode = origMode;
      activeIndex = origIdx;
      isExporting = false;
    }
  }
</script>

<div class="gen-root">
  <div class="gen-columns">
    <!-- Editor Column -->
    <div class="gen-editor">
      <!-- Card Tabs -->
      <div class="gen-tabs">
        {#each items as item, idx}
          <button
            type="button"
            class="gen-tab"
            class:active={activeIndex === idx}
            on:click={() => (activeIndex = idx)}
          >
            {item.title || `card #${idx + 1}`}
            {#if items.length > 1}
              <span
                class="gen-tab-remove"
                role="button"
                tabindex="-1"
                on:click|stopPropagation={() => removeItem(idx)}
              >&times;</span>
            {/if}
          </button>
        {/each}
        <button type="button" class="gen-tab-add" on:click={addNewItem}>
          <Plus size={12} /> add card
        </button>
      </div>

      <!-- Form -->
      <div class="gen-form">
        <!-- Row 1: Title + Creator -->
        <div class="gen-form-row gen-form-split2">
          <input
            type="text"
            bind:value={items[activeIndex].title}
            placeholder="Title of favorite manga, anime, film, game, music..."
            class="gen-input gen-input-bold"
          />
          <input
            type="text"
            bind:value={items[activeIndex].creator}
            placeholder="Creator, author, artist, or band name..."
            class="gen-input gen-input-bold"
          />
        </div>

        <!-- Row 2: Medium + Image -->
        <div class="gen-form-row gen-form-split-medium">
          <input
            type="text"
            bind:value={items[activeIndex].medium}
            placeholder="Medium (e.g. Manga, Anime, Game, Film, Music...)"
            class="gen-input"
          />
          <input
            type="file"
            bind:this={fileInputEl}
            on:change={handleImageChange}
            accept="image/*"
            class="gen-hidden-input"
          />
          {#if items[activeIndex].imageUrl}
            <div class="gen-img-preview">
              <img src={items[activeIndex].imageUrl} alt="Cover thumbnail" class="gen-img-thumb" />
              <div class="gen-img-actions">
                <button type="button" class="gen-img-action-crop" on:click={() => (pendingImageSrc = items[activeIndex].imageUrl || null)}>crop</button>
                <button type="button" class="gen-img-action-remove" on:click={() => updateActiveItem({ imageUrl: undefined })}>remove</button>
              </div>
            </div>
          {:else}
            <button
              type="button"
              class="gen-upload-btn"
              class:drag-active={dragActive}
              on:click={() => fileInputEl?.click()}
              on:dragenter={handleDrag}
              on:dragover={handleDrag}
              on:dragleave={handleDrag}
              on:drop={handleDrop}
            >
              <ImageIcon size={13} />
              <span>upload cover</span>
            </button>
          {/if}
        </div>

        <!-- Row 3: Thought -->
        <textarea
          bind:value={items[activeIndex].thought}
          placeholder="Why do you recommend it? Share your thoughts..."
          rows={4}
          class="gen-textarea"
        ></textarea>

        <!-- Row 4: Links header -->
        <div class="gen-links-header">
          <span class="gen-links-label">links to access ({(items[activeIndex].links || []).length}/6)</span>
          {#if (items[activeIndex].links || []).length < 6}
            <button type="button" class="gen-links-add" on:click={addLink}>
              <Plus size={10} /> add link
            </button>
          {/if}
        </div>

        <!-- Row 5: Links list -->
        {#if (items[activeIndex].links || []).length > 0}
          <div class="gen-links-list">
            {#each items[activeIndex].links as link, idx}
              <div class="gen-link-row">
                <input
                  type="text"
                  bind:value={items[activeIndex].links[idx].label}
                  placeholder="Link label"
                  class="gen-link-label-input"
                  on:input={() => updateLink(idx, 'label', items[activeIndex].links[idx].label)}
                />
                <input
                  type="url"
                  bind:value={items[activeIndex].links[idx].url}
                  placeholder="URL (https://...)"
                  class="gen-link-url-input"
                  on:input={() => updateLink(idx, 'url', items[activeIndex].links[idx].url)}
                />
                <button type="button" class="gen-link-remove" on:click={() => removeLink(idx)}>
                  <Trash2 size={14} />
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Action Panel -->
      <div class="gen-actions">
        <button type="button" class="gen-action-btn gen-action-outline" on:click={copyToClipboard}>
          {#if isCopying}
            <Check size={14} /> copied config
          {:else}
            <Copy size={14} /> copy config
          {/if}
        </button>
        {#if items.length > 2 && (previewMode === 'grid' || previewMode === 'row')}
          <button type="button" class="gen-action-btn gen-action-outline" disabled={isExporting} on:click={exportAllRows}>
            {isExporting ? 'generating...' : 'export all rows'}
          </button>
        {/if}
        <button type="button" class="gen-action-btn gen-action-primary" disabled={isExporting} on:click={exportCardPng}>
          {#if isExporting}
            generating...
          {:else}
            <Download size={14} />
            {previewMode === 'single' ? 'export active card' : previewMode === 'row' ? 'export active row' : 'export full grid'}
          {/if}
        </button>
      </div>
    </div>

    <!-- Live Preview Column (desktop sticky) -->
    <div class="gen-live-preview">
      <div class="gen-live-preview-label">live preview (active)</div>
      <div class="gen-live-preview-card">
        <RecommendationCard item={buildFull(activeItem)} viewMode="detailed" />
      </div>
    </div>
  </div>

  <!-- Page Preview Section -->
  <div class="gen-preview-section">
    <div class="gen-preview-header">
      <span class="gen-preview-title">preview</span>
      <div class="gen-preview-modes">
        <button type="button" class="gen-mode-btn" class:active={previewMode === 'single'} on:click={() => (previewMode = 'single')}>
          <Eye size={12} /> active card
        </button>
        {#if items.length > 2}
          <button type="button" class="gen-mode-btn" class:active={previewMode === 'row'} on:click={() => (previewMode = 'row')}>
            <LayoutGrid size={12} /> active row
          </button>
        {/if}
        <button type="button" class="gen-mode-btn" class:active={previewMode === 'grid'} on:click={() => (previewMode = 'grid')}>
          <LayoutGrid size={12} /> full grid ({items.length})
        </button>
      </div>
    </div>

    <div class="gen-export-wrapper">
      <div
        id="favorites-card-export-target"
        data-exporting={isExporting}
        class="gen-export-target"
        class:exporting={isExporting}
        style={isExporting
          ? `width:${previewMode === 'single' ? '460px' : '896px'};min-width:${previewMode === 'single' ? '460px' : '896px'}`
          : `max-width:${previewMode === 'single' ? '460px' : '896px'};margin:0 auto`}
      >
        {#if previewMode === 'single'}
          <div class="gen-single-wrap">
            <RecommendationCard item={buildFull(activeItem)} viewMode="detailed" />
          </div>
        {:else if previewMode === 'row'}
          <div class="gen-grid" class:force-2col={isExporting}>
            {#each items as item, idx}
              {@const isSameRow = Math.floor(idx / 2) === Math.floor(activeIndex / 2)}
              {#if isSameRow}
                <div
                  class="gen-card-wrap"
                  class:active={activeIndex === idx && !isExporting}
                  on:click={() => (activeIndex = idx)}
                  role="button"
                  tabindex="-1"
                >
                  <RecommendationCard item={buildFull(item)} viewMode="detailed" />
                  {#if activeIndex === idx && !isExporting}
                    <div class="gen-editing-badge">editing</div>
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
        {:else}
          <div class="gen-grid" class:force-2col={isExporting}>
            {#each items as item, idx}
              <div
                class="gen-card-wrap"
                class:active={activeIndex === idx && !isExporting}
                on:click={() => (activeIndex = idx)}
                role="button"
                tabindex="-1"
              >
                <RecommendationCard item={buildFull(item)} viewMode="detailed" />
                {#if activeIndex === idx && !isExporting}
                  <div class="gen-editing-badge">editing</div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

{#if pendingImageSrc}
  <ImageCropperModal
    imageSrc={pendingImageSrc}
    defaultAspectRatio={(() => {
      const m = (activeItem.medium || '').toLowerCase();
      if (m === 'manga' || m === 'anime' || m === 'book') return '3:4';
      if (m === 'game' || m === 'film' || m === 'movie') return '16:9';
      if (m === 'music' || m === 'album') return '1:1';
      return 'original';
    })()}
    on:close={() => (pendingImageSrc = null)}
    on:crop={(e) => { updateActiveItem({ imageUrl: e.detail }); pendingImageSrc = null; }}
  />
{/if}

<style>
  .gen-root { display: flex; flex-direction: column; gap: 1.5rem; padding-top: 1rem; width: 100%; }

  .gen-columns {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    align-items: start;
  }
  @media (min-width: 1024px) {
    .gen-columns { grid-template-columns: 1fr 360px; }
  }

  .gen-editor { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; min-width: 0; }

  .gen-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }

  .gen-tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.875rem;
    border-radius: 0.25rem;
    border: 1px solid hsl(var(--border));
    font-size: 0.625rem;
    letter-spacing: 0.05em;
    font-weight: 600;
    text-transform: lowercase;
    cursor: pointer;
    transition: all 0.2s;
    background: transparent;
    color: hsl(var(--muted-foreground));
    font-family: var(--font-sans);
  }
  .gen-tab:hover { border-color: hsl(var(--foreground) / 0.4); color: hsl(var(--foreground)); }
  .gen-tab.active {
    color: hsl(var(--pride-glow-val));
    border-color: hsl(var(--pride-glow-val) / 0.45);
    background: hsl(var(--pride-glow-val) / 0.1);
    font-weight: 700;
  }

  .gen-tab-remove {
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    font-size: 0.6875rem;
    font-weight: 700;
    padding: 0 0.125rem;
    margin-left: 0.25rem;
  }
  .gen-tab-remove:hover { color: hsl(var(--destructive)); }

  .gen-tab-add {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.875rem;
    border-radius: 0.25rem;
    border: 1px dashed hsl(var(--border));
    font-size: 0.625rem;
    letter-spacing: 0.05em;
    font-weight: 600;
    text-transform: lowercase;
    cursor: pointer;
    color: hsl(var(--muted-foreground));
    background: transparent;
    font-family: var(--font-sans);
    transition: all 0.2s;
  }
  .gen-tab-add:hover { border-color: hsl(var(--foreground) / 0.4); color: hsl(var(--foreground)); }

  .gen-form {
    background: hsl(var(--background) / 0.4);
    border-radius: 0.75rem;
    border: 1px solid hsl(var(--border) / 0.5);
    box-shadow: 0 1px 3px hsl(0 0% 0% / 0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .gen-form-row { border-bottom: 1px solid hsl(var(--border) / 0.5); }

  .gen-form-split2 {
    display: grid;
    grid-template-columns: 1fr;
  }
  @media (min-width: 640px) {
    .gen-form-split2 { grid-template-columns: 1fr 1fr; }
    .gen-form-split2 .gen-input:first-child { border-right: 1px solid hsl(var(--border) / 0.5); border-bottom: none; }
  }
  .gen-form-split2 .gen-input:first-child { border-bottom: 1px solid hsl(var(--border) / 0.5); }

  .gen-form-split-medium {
    display: grid;
    grid-template-columns: 1fr;
  }
  @media (min-width: 640px) {
    .gen-form-split-medium { grid-template-columns: 1fr 200px; }
    .gen-form-split-medium > :first-child { border-bottom: none; }
    .gen-upload-btn, .gen-img-preview { border-left: 1px solid hsl(var(--border) / 0.5); border-top: none; }
  }
  .gen-form-split-medium > :first-child { border-bottom: 1px solid hsl(var(--border) / 0.5); }

  .gen-input {
    min-width: 0;
    background: transparent;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    color: hsl(var(--foreground));
    font-family: var(--font-sans);
    outline: none;
    width: 100%;
  }
  .gen-input::placeholder { color: hsl(var(--muted-foreground) / 0.5); }
  .gen-input-bold { font-weight: 600; }

  .gen-hidden-input { display: none; }

  .gen-upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: hsl(var(--muted-foreground));
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background 0.15s;
    font-family: var(--font-sans);
    border-top: 1px solid hsl(var(--border) / 0.5);
  }
  .gen-upload-btn:hover { background: hsl(var(--muted) / 0.3); }
  .gen-upload-btn.drag-active { background: hsl(var(--pride-glow-val) / 0.05); color: hsl(var(--pride-glow-val)); }
  @media (min-width: 640px) { .gen-upload-btn { border-top: none; } }

  .gen-img-preview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.375rem 1rem;
    background: hsl(var(--muted) / 0.1);
    border-top: 1px solid hsl(var(--border) / 0.5);
  }
  @media (min-width: 640px) { .gen-img-preview { border-top: none; } }

  .gen-img-thumb {
    width: 1.5rem;
    height: 2rem;
    object-fit: cover;
    border-radius: 0.25rem;
    border: 1px solid hsl(var(--border));
    flex-shrink: 0;
  }

  .gen-img-actions { display: flex; align-items: center; gap: 0.625rem; }

  .gen-img-action-crop {
    font-size: 0.5625rem;
    color: hsl(var(--pride-glow-val));
    font-weight: 700;
    cursor: pointer;
    background: none;
    border: none;
    font-family: var(--font-mono);
    text-decoration: none;
  }
  .gen-img-action-crop:hover { text-decoration: underline; }

  .gen-img-action-remove {
    font-size: 0.5625rem;
    color: hsl(var(--destructive));
    font-weight: 700;
    cursor: pointer;
    background: none;
    border: none;
    font-family: var(--font-mono);
  }

  .gen-textarea {
    min-height: 110px;
    width: 100%;
    resize: none;
    background: transparent;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    color: hsl(var(--foreground));
    font-family: var(--font-sans);
    outline: none;
    border-bottom: 1px solid hsl(var(--border) / 0.5);
    line-height: 1.6;
  }
  .gen-textarea::placeholder { color: hsl(var(--muted-foreground) / 0.5); }

  .gen-links-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid hsl(var(--border) / 0.5);
    padding: 0.5rem 1rem;
  }

  .gen-links-label {
    font-size: 0.5625rem;
    text-transform: lowercase;
    letter-spacing: 0.1em;
    color: hsl(var(--muted-foreground));
    font-family: var(--font-mono);
    font-weight: 600;
  }

  .gen-links-add {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.5625rem;
    font-weight: 700;
    text-transform: lowercase;
    letter-spacing: 0.075em;
    color: hsl(var(--pride-glow-val));
    cursor: pointer;
    background: none;
    border: none;
    font-family: var(--font-mono);
  }
  .gen-links-add:hover { text-decoration: underline; }

  .gen-links-list { background: hsl(var(--background) / 0.1); }

  .gen-link-row {
    display: grid;
    grid-template-columns: 140px 1fr auto;
    align-items: center;
    border-bottom: 1px solid hsl(var(--border) / 0.4);
  }
  .gen-link-row:last-child { border-bottom: none; }

  .gen-link-label-input {
    min-width: 0;
    border-right: 1px solid hsl(var(--border) / 0.4);
    background: transparent;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: hsl(var(--foreground));
    font-family: var(--font-sans);
    outline: none;
  }
  .gen-link-label-input::placeholder { color: hsl(var(--muted-foreground) / 0.5); }

  .gen-link-url-input {
    min-width: 0;
    background: transparent;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    color: hsl(var(--foreground));
    font-family: var(--font-sans);
    outline: none;
  }
  .gen-link-url-input::placeholder { color: hsl(var(--muted-foreground) / 0.5); }

  .gen-link-remove {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    background: none;
    border-left: 1px solid hsl(var(--border) / 0.4);
    height: 100%;
    transition: color 0.15s;
  }
  .gen-link-remove:hover { color: hsl(var(--destructive)); }

  .gen-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
    justify-content: flex-end;
    background: hsl(var(--background) / 0.4);
    border-radius: 0.75rem;
    border: 1px solid hsl(var(--border) / 0.5);
    padding: 1rem;
  }

  .gen-action-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: lowercase;
    padding: 0 1.25rem;
    height: 2.5rem;
    border-radius: 9999px;
    cursor: pointer;
    border: 1px solid hsl(var(--border));
    font-family: var(--font-sans);
    transition: all 0.15s;
    flex: 1;
  }
  @media (min-width: 768px) { .gen-action-btn { flex: initial; } }
  .gen-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .gen-action-outline {
    background: transparent;
    color: hsl(var(--foreground));
  }
  .gen-action-outline:hover:not(:disabled) { background: hsl(var(--muted) / 0.4); }

  .gen-action-primary {
    background: hsl(var(--foreground));
    color: hsl(var(--background));
    border-color: hsl(var(--foreground));
  }
  .gen-action-primary:hover:not(:disabled) { opacity: 0.85; }

  .gen-live-preview { display: none; }
  @media (min-width: 1024px) {
    .gen-live-preview {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      position: sticky;
      top: 6rem;
      flex-shrink: 0;
    }
  }

  .gen-live-preview-label {
    font-size: 0.5625rem;
    text-transform: lowercase;
    letter-spacing: 0.1em;
    color: hsl(var(--muted-foreground));
    font-family: var(--font-mono);
    font-weight: 600;
    border-bottom: 1px solid hsl(var(--border) / 0.5);
    padding-bottom: 0.375rem;
  }

  .gen-live-preview-card {
    width: 100%;
    max-width: 400px;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid hsl(var(--border) / 0.5);
    background: hsl(var(--background) / 0.4);
  }

  .gen-preview-section { display: flex; flex-direction: column; gap: 1rem; width: 100%; }

  .gen-preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid hsl(var(--border) / 0.4);
    padding-bottom: 0.5rem;
  }

  .gen-preview-title {
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.025em;
    color: hsl(var(--foreground));
    font-family: var(--font-sans);
  }

  .gen-preview-modes { display: flex; gap: 0.5rem; }

  .gen-mode-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.625rem;
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: lowercase;
    border-radius: 0.25rem;
    border: 1px solid hsl(var(--border));
    cursor: pointer;
    background: transparent;
    color: hsl(var(--muted-foreground));
    font-family: var(--font-sans);
    transition: all 0.15s;
  }
  .gen-mode-btn:hover { color: hsl(var(--foreground)); }
  .gen-mode-btn.active {
    color: hsl(var(--pride-glow-val));
    border-color: hsl(var(--pride-glow-val) / 0.45);
    background: hsl(var(--pride-glow-val) / 0.1);
  }

  .gen-export-wrapper { width: 100%; padding: 1rem 0; }

  .gen-export-target { width: 100%; background: transparent; }
  .gen-export-target.exporting { border-radius: 0.75rem; padding: 1.5rem; }

  .gen-single-wrap { width: 100%; border-radius: 0.375rem; overflow: hidden; }

  .gen-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    width: 100%;
  }
  @media (min-width: 1024px) { .gen-grid { grid-template-columns: 1fr 1fr; } }
  .gen-grid.force-2col { grid-template-columns: 1fr 1fr; }

  .gen-card-wrap {
    border-radius: 0.375rem;
    height: 100%;
    transition: all 0.3s;
    cursor: pointer;
    position: relative;
  }
  .gen-card-wrap:hover { outline: 1px solid hsl(var(--border)); }
  .gen-card-wrap.active {
    outline: 2px solid hsl(var(--pride-glow-val));
    outline-offset: 2px;
  }

  .gen-editing-badge {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: hsl(var(--pride-glow-val) / 0.9);
    color: white;
    font-size: 0.5625rem;
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-family: var(--font-mono);
    letter-spacing: 0.05em;
    text-transform: lowercase;
    font-weight: 700;
    z-index: 10;
  }

  /* Export background (mirrors official-bg-preview) */
  :global(.gen-export-target.exporting) {
    background-image:
      radial-gradient(circle at 10% 10%, hsl(350 85% 72% / 0.14), transparent 45rem),
      radial-gradient(circle at 30% 30%, hsl(52 92% 70% / 0.11), transparent 40rem),
      radial-gradient(circle at 50% 50%, hsl(142 76% 66% / 0.09), transparent 40rem),
      radial-gradient(circle at 75% 70%, hsl(206 90% 72% / 0.13), transparent 45rem),
      radial-gradient(circle at 95% 90%, hsl(272 75% 70% / 0.08), transparent 55rem),
      linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)),
      url('/distribution/2026/kemutai-hanashi/Illustration125c.webp?v=1') !important;
    background-size: cover !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
  }
  :global(.dark .gen-export-target.exporting) {
    background-image:
      radial-gradient(circle at 10% 10%, hsl(350 85% 72% / 0.09), transparent 45rem),
      radial-gradient(circle at 30% 30%, hsl(52 92% 70% / 0.07), transparent 40rem),
      radial-gradient(circle at 50% 50%, hsl(142 76% 66% / 0.06), transparent 40rem),
      radial-gradient(circle at 75% 70%, hsl(206 90% 72% / 0.09), transparent 45rem),
      radial-gradient(circle at 95% 90%, hsl(272 75% 70% / 0.05), transparent 55rem),
      linear-gradient(rgba(7, 12, 22, 0.95), rgba(7, 12, 22, 0.95)),
      url('/distribution/2026/kemutai-hanashi/Illustration125c.webp?v=1') !important;
    background-size: cover !important;
    background-position: center !important;
    background-repeat: no-repeat !important;
  }
</style>
