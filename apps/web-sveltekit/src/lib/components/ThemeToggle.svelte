<script lang="ts">
  import { onMount } from 'svelte';
  import { Sun, Moon } from '@lucide/svelte';
  import { scale as svelteScale } from 'svelte/transition';
  import SpotifyNowPlaying from './SpotifyNowPlaying.svelte';

  let theme: 'light' | 'dark' = 'light';
  let mounted = false;
  let rotateDegree = 0;
  let transitionTimer: number | undefined;

  function applyTheme(nextTheme: 'light' | 'dark') {
    if (theme === nextTheme && mounted) return;

    window.clearTimeout(transitionTimer);

    const root = document.documentElement;
    theme = nextTheme;
    rotateDegree = nextTheme === 'dark' ? 360 : 0;

    root.classList.add('theme-switching');
    root.classList.toggle('dark', nextTheme === 'dark');
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    localStorage.setItem('theme', nextTheme);

    transitionTimer = window.setTimeout(() => {
      root.classList.remove('theme-switching');
    }, 180);
  }

  onMount(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(stored === 'dark' || (!stored && prefersDark) ? 'dark' : 'light');
    mounted = true;
  });
</script>

<div class="flex items-center gap-3 sm:gap-4 select-none">
  {#if mounted}
    <SpotifyNowPlaying />
    <button
      type="button"
      class="relative p-2 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 border-0 bg-transparent cursor-pointer"
      aria-label="Toggle theme"
      on:click={() => applyTheme(theme === 'dark' ? 'light' : 'dark')}
      transition:svelteScale={{ duration: 200, start: 0.95 }}
    >
      <div
        class="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-400 ease-in-out"
        style="transform: rotate({rotateDegree}deg);"
      >
        {#if theme === 'dark'}
          <Moon class="w-4 h-4 sm:w-5 sm:h-5" />
        {:else}
          <Sun class="w-4 h-4 sm:w-5 sm:h-5" />
        {/if}
      </div>
    </button>
  {:else}
    <span class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent" aria-hidden="true"></span>
  {/if}
</div>
