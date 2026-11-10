<script lang="ts" context="module">
  export type TabItem = { id: string; label: string; count?: number };
</script>

<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  export let tabs: TabItem[] = [];
  export let activeTab = tabs[0]?.id ?? '';
  export let ariaLabel = 'Section';
  export let storageKey = '';
  export let syncUrl = false;
  export let native = false;

  function setTab(event: Event) {
    activeTab = (event.currentTarget as HTMLSelectElement).value;
    if (!browser) return;
    if (storageKey) { try { localStorage.setItem(storageKey, activeTab); } catch {} }
    if (syncUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url);
    }
  }

  onMount(() => {
    const urlTab = syncUrl ? new URL(window.location.href).searchParams.get('tab') : null;
    let storedTab: string | null = null;
    try { storedTab = storageKey ? localStorage.getItem(storageKey) : null; } catch {}
    if (tabs.some(tab => tab.id === urlTab)) activeTab = urlTab!;
    else if (tabs.some(tab => tab.id === storedTab)) activeTab = storedTab!;
  });
</script>

<select class="section-picker-native" class:site-native-select={!native} aria-label={ariaLabel} value={activeTab} on:change={setTab} disabled={!tabs.length}>
  {#each tabs as tab}
    <option value={tab.id}>{tab.label}{typeof tab.count === 'number' ? ` (${tab.count})` : ''}</option>
  {/each}
</select>

<style>
  .section-picker-native {
    width: fit-content; max-width: 100%; min-width: 12rem; min-height: 44px;
    padding: 0.7rem 2.25rem 0.7rem 0.9rem; border: 1px solid hsl(var(--border));
    border-radius: 0.75rem; background-color: hsl(var(--background)); color: hsl(var(--foreground));
    font: inherit; font-size: var(--font-size-sm); cursor: pointer;
    transition: border-color 200ms ease, background-color 220ms ease;
  }
  .section-picker-native:hover { border-color: hsl(var(--site-blue) / 0.5); }
  @media (max-width: 639px) { .section-picker-native { width: 100%; } }
</style>
