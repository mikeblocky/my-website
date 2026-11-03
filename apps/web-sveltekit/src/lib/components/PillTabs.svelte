<script lang="ts" context="module">
  export type TabItem = { id: string; label: string; count?: number };
</script>

<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount, tick } from 'svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { Check, ChevronDown } from '@lucide/svelte';

  export let tabs: TabItem[] = [];
  export let activeTab = tabs[0]?.id ?? '';
  export let ariaLabel = 'Section tabs';
  export let storageKey = '';
  export let syncUrl = false;

  let root: HTMLDivElement;
  let trigger: HTMLButtonElement;
  let open = false;
  let reducedMotion = false;
  let focusedIndex = 0;
  $: selected = tabs.find(tab => tab.id === activeTab) ?? tabs[0];
  const valid = (value: string | null) => tabs.some(tab => tab.id === value);

  async function focusOption(index: number) {
    focusedIndex = (index + tabs.length) % tabs.length;
    await tick();
    root?.querySelectorAll<HTMLButtonElement>('[role="option"]')[focusedIndex]?.focus();
  }

  async function showOptions() {
    if (!tabs.length) return;
    open = true;
    await focusOption(Math.max(0, tabs.findIndex(tab => tab.id === activeTab)));
  }

  async function closeOptions() {
    open = false;
    await tick();
    trigger?.focus();
  }

  function setTab(id: string) {
    activeTab = id;
    if (browser) {
      if (storageKey) { try { localStorage.setItem(storageKey, id); } catch {} }
      if (syncUrl) {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', id);
        window.history.replaceState({}, '', url);
      }
    }
    void closeOptions();
  }

  function keydown(event: KeyboardEvent) {
    if (!root?.contains(event.target as Node)) return;
    if (event.key === 'Escape' && open) { event.preventDefault(); void closeOptions(); }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) void showOptions();
      else void focusOption(focusedIndex + (event.key === 'ArrowDown' ? 1 : -1));
    } else if (open && (event.key === 'Home' || event.key === 'End')) {
      event.preventDefault();
      void focusOption(event.key === 'Home' ? 0 : tabs.length - 1);
    } else if (event.key === 'Tab') open = false;
  }

  onMount(() => {
    const urlTab = syncUrl ? new URL(window.location.href).searchParams.get('tab') : null;
    let storedTab: string | null = null;
    try { storedTab = storageKey ? localStorage.getItem(storageKey) : null; } catch {}
    if (valid(urlTab)) activeTab = urlTab!;
    else if (valid(storedTab)) activeTab = storedTab!;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => { reducedMotion = preference.matches; };
    syncPreference();
    preference.addEventListener('change', syncPreference);
    return () => preference.removeEventListener('change', syncPreference);
  });
</script>

<svelte:window
  on:keydown={keydown}
  on:pointerdown={(event) => { if (open && !root?.contains(event.target as Node)) open = false; }}
/>

<div class="section-picker" bind:this={root}>
  <button
    type="button"
    class="section-picker-trigger"
    class:expanded={open}
    bind:this={trigger}
    aria-label={`${ariaLabel}: ${selected?.label ?? 'Select section'}`}
    aria-haspopup="listbox"
    aria-expanded={open}
    disabled={!tabs.length}
    on:click={() => { if (open) void closeOptions(); else void showOptions(); }}
  >
    <span>{selected?.label ?? 'Select section'}</span>
    {#if typeof selected?.count === 'number'}<small>{selected.count}</small>{/if}
    <ChevronDown size={16} strokeWidth={1.6} aria-hidden="true" />
  </button>
  {#if open}
    <div class="section-picker-menu" role="listbox" aria-label={ariaLabel}
      in:fly={{ y: -5, duration: reducedMotion ? 0 : 220, easing: cubicOut }}
      out:fly={{ y: -3, duration: reducedMotion ? 0 : 120, easing: cubicOut }}>
      {#each tabs as tab, index}
        <button type="button" role="option" aria-selected={activeTab === tab.id}
          tabindex={focusedIndex === index ? 0 : -1}
          class:selected={activeTab === tab.id}
          on:focus={() => focusedIndex = index}
          on:click={() => setTab(tab.id)}>
          <span>{tab.label}</span>
          {#if typeof tab.count === 'number'}<small>{tab.count}</small>{/if}
          <span class="section-picker-check" aria-hidden="true">{#if activeTab === tab.id}<Check size={15} strokeWidth={1.8} />{/if}</span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .section-picker { position: relative; width: fit-content; max-width: 100%; z-index: 30; }
  .section-picker-trigger {
    display: flex; align-items: center; gap: 1.25rem; min-height: 44px;
    min-width: 12rem; max-width: 100%; padding: 0.7rem 0.9rem;
    border: 1px solid hsl(var(--border)); border-radius: 0.75rem;
    background: hsl(var(--background)); color: hsl(var(--foreground));
    font-size: var(--font-size-sm); font-weight: 500; cursor: pointer;
    transition: border-color 200ms ease, background-color 200ms ease, box-shadow 300ms var(--ease-out);
  }
  .section-picker-trigger > span { flex: 1; text-align: left; }
  .section-picker-trigger :global(svg) { flex-shrink: 0; transition: transform 300ms var(--ease-out); }
  .section-picker-trigger.expanded :global(svg) { transform: rotate(180deg); }
  .section-picker-trigger:hover, .section-picker-trigger.expanded { border-color: hsl(var(--site-blue) / 0.5); }
  .section-picker-menu {
    position: absolute; top: calc(100% + 0.5rem); left: 0;
    min-width: 100%; width: max-content; max-width: calc(100vw - 3rem);
    max-height: min(24rem, 60dvh); overflow-y: auto;
    padding: 0.35rem; border: 1px solid hsl(var(--border)); border-radius: 0.9rem;
    background: hsl(var(--background)); box-shadow: 0 12px 40px hsl(220 35% 10% / 0.14);
  }
  .section-picker-menu button {
    display: flex; align-items: center; gap: 1rem; width: 100%; min-height: 44px;
    border: 0; border-radius: 0.55rem; padding: 0.75rem;
    background: transparent; color: hsl(var(--foreground)); text-align: left;
    font-size: var(--font-size-sm); cursor: pointer;
    transition: background-color 180ms ease, color 180ms ease;
  }
  .section-picker-menu button > span:first-child { flex: 1; }
  .section-picker-menu button:hover, .section-picker-menu button:focus-visible, .section-picker-menu button.selected {
    background: hsl(var(--site-blue) / 0.08); color: hsl(var(--site-blue));
  }
  .section-picker-check { display: grid; place-items: center; width: 16px; }
  small { color: hsl(var(--muted-foreground)); font-variant-numeric: tabular-nums; }
  @media (max-width: 639px) { .section-picker, .section-picker-trigger { width: 100%; } .section-picker-menu { width: 100%; } }
</style>