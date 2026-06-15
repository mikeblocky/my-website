<script lang="ts">
  import { slide, fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import AdminLockToggle from './AdminLockToggle.svelte';

  export let title: string;
  export let count: number;
  export let isRefreshing = false;
  export let isLoading = false;
  export let isAdminMode = false;
  export let passcode = '';
  export let accent: 'blue' | 'violet' | 'teal' | 'yellow' | 'indigo' | 'sky';
  export let formButtonLabel: string;
  export let notification: string | null = null;
  export let clearNotification: () => void = () => {};
  export let singleMode = false;

  let isFormOpen = false;
  let showPasscodeInput = false;

  // Color mapping based on accent
  const accentClasses = {
    blue: {
      border: 'border-blue-200/50 dark:border-blue-800/40',
      text: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50/10 dark:bg-blue-950/5 hover:bg-blue-50/20 dark:hover:bg-blue-950/10',
      hoverBorder: 'hover:border-blue-400',
      toastBorder: 'border-blue-200 dark:border-blue-500/30',
      toastBg: 'bg-white/95 dark:bg-[#1a1525]',
      toastDot: 'bg-blue-600 dark:bg-blue-400',
      toastButton: 'border-blue-100 bg-blue-50/50 text-blue-600 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
    },
    violet: {
      border: 'border-violet-200/50 dark:border-violet-850/40',
      text: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50/10 dark:bg-violet-950/5 hover:bg-violet-50/20 dark:hover:bg-violet-950/10',
      hoverBorder: 'hover:border-violet-400',
      toastBorder: 'border-violet-200 dark:border-violet-500/30',
      toastBg: 'bg-white/95 dark:bg-[#181124]',
      toastDot: 'bg-violet-600 dark:bg-violet-400',
      toastButton: 'border-violet-100 bg-violet-50/50 text-violet-600 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50'
    },
    indigo: {
      border: 'border-indigo-200/50 dark:border-indigo-800/40',
      text: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50/10 dark:bg-indigo-950/5 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10',
      hoverBorder: 'hover:border-indigo-400',
      toastBorder: 'border-indigo-200 dark:border-indigo-500/30',
      toastBg: 'bg-white/95 dark:bg-[#141427]',
      toastDot: 'bg-indigo-600 dark:bg-indigo-400',
      toastButton: 'border-indigo-100 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50'
    },
    sky: {
      border: 'border-sky-200/50 dark:border-sky-800/40',
      text: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50/10 dark:bg-sky-950/5 hover:bg-sky-50/20 dark:hover:bg-sky-950/10',
      hoverBorder: 'hover:border-sky-400',
      toastBorder: 'border-sky-200 dark:border-sky-500/30',
      toastBg: 'bg-white/95 dark:bg-[#0d1822]',
      toastDot: 'bg-sky-600 dark:bg-sky-400',
      toastButton: 'border-sky-100 bg-sky-50/50 text-sky-600 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-300 dark:hover:bg-sky-900/50'
    },
    teal: {
      border: 'border-teal-200/50 dark:border-teal-800/40',
      text: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50/10 dark:bg-teal-950/5 hover:bg-teal-50/20 dark:hover:bg-teal-950/10',
      hoverBorder: 'hover:border-teal-400',
      toastBorder: 'border-teal-200 dark:border-teal-500/30',
      toastBg: 'bg-white/95 dark:bg-[#101a18]',
      toastDot: 'bg-teal-600 dark:bg-teal-300',
      toastButton: 'border-teal-100 bg-teal-50/50 text-teal-700 hover:bg-teal-100 dark:border-teal-500/20 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-900/50'
    },
    yellow: {
      border: 'border-amber-200/60 dark:border-amber-700/35',
      text: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50/25 dark:bg-amber-950/5 hover:bg-amber-50/45 dark:hover:bg-amber-950/10',
      hoverBorder: 'hover:border-amber-400',
      toastBorder: 'border-amber-200 dark:border-amber-500/30',
      toastBg: 'bg-white/95 dark:bg-[#1f1608]',
      toastDot: 'bg-amber-600 dark:bg-amber-300',
      toastButton: 'border-amber-100 bg-amber-50/60 text-amber-700 hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50'
    }
  }[accent];

  function handleFormSubmitSuccess() {
    isFormOpen = false;
  }
</script>

<div class="space-y-8">
  <!-- ────────────────── COLLAPSIBLE FORM CONTAINER ────────────────── -->
  {#if !singleMode}
    <div class="space-y-4">
      <button
        type="button"
        on:click={() => (isFormOpen = !isFormOpen)}
        class="w-full py-4 px-4 rounded-xl border border-dashed text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200 shadow-sm font-mono {isFormOpen ? 'border-slate-350 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/10 text-slate-500' : `${accentClasses.border} ${accentClasses.text} ${accentClasses.bg} ${accentClasses.hoverBorder}`}"
      >
        <span>{isFormOpen ? "✕ close form" : formButtonLabel}</span>
      </button>

      {#if isFormOpen}
        <div 
          transition:slide={{ duration: 280, easing: quintOut }}
          on:submit={handleFormSubmitSuccess} 
          class="pt-2"
        >
          <slot name="form" />
        </div>
      {/if}
    </div>
  {/if}

  <!-- ────────────────── BOARD HEADER & ARCHIVE ────────────────── -->
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border/60 pb-3 sm:flex-nowrap">
      <div class="flex items-center gap-2">
        <h2 class="mt-0 mb-0 text-xl font-bold text-heading">
          {title}
        </h2>

        <AdminLockToggle
          bind:isAdminMode
          bind:passcode
          bind:showPasscodeInput
          {accent}
        />
      </div>

      <div class="flex shrink-0 items-center gap-3">
        {#if isRefreshing}
          <span class="text-xs text-muted-foreground">
            Refreshing...
          </span>
        {/if}
        <span class="whitespace-nowrap text-sm text-muted-foreground">
          {count} {accent === 'yellow' && title.toLowerCase().includes('artwork') ? 'artworks' : 'posts'} collected
        </span>
      </div>
    </div>

    <!-- Content list -->
    <slot />
  </section>

  <!-- ────────────────── UNIFIED TOAST NOTIFICATION ────────────────── -->
  {#if notification}
    <div
      in:fly={{ y: -50, duration: 300, easing: quintOut }}
      out:fade={{ duration: 150 }}
      class="fixed top-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-2.5 rounded-xl border py-2 pl-4 pr-1.5 shadow-lg shadow-black/5 dark:shadow-black/25 backdrop-blur-md {accentClasses.toastBorder} {accentClasses.toastBg}"
    >
      <div class="h-2.5 w-2.5 shrink-0 rounded-full {accentClasses.toastDot}"></div>
      <span class="truncate text-xs font-medium text-slate-800 dark:text-slate-200">
        {notification}
      </span>
      <button
        on:click={clearNotification}
        class="ml-auto rounded-lg border px-2 py-0.5 text-[10px] font-bold transition-all font-mono {accentClasses.toastButton}"
      >
        close
      </button>
    </div>
  {/if}
</div>
