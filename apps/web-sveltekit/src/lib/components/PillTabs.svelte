<script lang="ts" context="module">
  export type TabItem = {
    id: string;
    label: string;
    count?: number;
  };
</script>

<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  export let tabs: TabItem[] = [];
  export let activeTab = tabs[0]?.id ?? '';
  export let ariaLabel = 'Section tabs';
  export let storageKey = '';
  export let syncUrl = false;

  function isValidTab(value: string) {
    return tabs.some((tab) => tab.id === value);
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
  }

  onMount(() => {
    const urlTab = syncUrl ? new URL(window.location.href).searchParams.get('tab') : null;
    const storedTab = storageKey ? localStorage.getItem(storageKey) : null;
    const nextTab = urlTab && isValidTab(urlTab) ? urlTab : storedTab && isValidTab(storedTab) ? storedTab : '';

    if (nextTab) activeTab = nextTab;
  });
</script>

<div class="pill-tabs" role="tablist" aria-label={ariaLabel}>
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
