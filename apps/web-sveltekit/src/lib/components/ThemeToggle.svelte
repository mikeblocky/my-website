<script lang="ts">
  import { onMount } from 'svelte';
  import { Sun, Moon } from '@lucide/svelte';
  import { scale as svelteScale } from 'svelte/transition';
  import SpotifyNowPlaying from './SpotifyNowPlaying.svelte';

  let theme: 'light' | 'dark' = 'light';
  let mounted = false;
  let rotateDegree = 0;
  let transitionTimer: number | undefined;
  let iconEl: HTMLDivElement | undefined;
  let iconAnim: Animation | undefined;

  // Mirrors the framer-motion icon animation from the Next.js ThemeToggle:
  //   animate={{ rotate: isDark ? 360 : 0, scale: [1, 0.8, 1] }}
  //   transition={{ duration: 0.4, ease: 'easeInOut' }}
  // Driven through the Web Animations API (like framer-motion's JS interpolation)
  // rather than a CSS transition: a plain `transform: rotate()` transition between
  // 0deg and 360deg is a no-op because both resolve to the identity matrix. The
  // explicit 180deg midpoint keyframe forces a real, visible spin and carries the
  // scale "pulse" (shrink to 0.8 half-way, back to 1) in the same animation. The
  // resting rotation lives in the inline style so the icon settles correctly.
  function spinIcon(fromDeg: number, toDeg: number) {
    const midDeg = (fromDeg + toDeg) / 2;
    // Cancel any in-flight spin so rapid toggles don't stack conflicting
    // transform animations on the icon.
    iconAnim?.cancel();
    iconAnim = iconEl?.animate(
      [
        { transform: `rotate(${fromDeg}deg) scale(1)` },
        { transform: `rotate(${midDeg}deg) scale(0.8)` },
        { transform: `rotate(${toDeg}deg) scale(1)` }
      ],
      { duration: 400, easing: 'ease-in-out' }
    );
  }

  function applyTheme(nextTheme: 'light' | 'dark') {
    if (theme === nextTheme && mounted) return;

    window.clearTimeout(transitionTimer);

    const root = document.documentElement;
    const fromDeg = rotateDegree;
    theme = nextTheme;
    rotateDegree = nextTheme === 'dark' ? 360 : 0;

    // Port of next-themes' `disableTransitionOnChange`: suppress every CSS
    // transition while the `dark` class is swapped so the palette flips
    // instantly. The previous approach animated color/background on every
    // element, which promotes text to temporary GPU layers and renders it
    // blurry for the duration of the transition.
    const killTransitions = document.createElement('style');
    killTransitions.appendChild(
      document.createTextNode('*,*::before,*::after{transition:none !important}')
    );
    document.head.appendChild(killTransitions);

    root.classList.toggle('dark', nextTheme === 'dark');
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    localStorage.setItem('theme', nextTheme);

    // Force the browser to commit the new palette while transitions are off…
    void window.getComputedStyle(document.body).opacity;
    // …then restore transitions on the next tick for normal hover/focus motion.
    transitionTimer = window.setTimeout(() => killTransitions.remove(), 1);

    // Only spin on a real user toggle, not on the initial mount sync
    // (framer-motion's `initial={false}` skips the first render). The icon spin
    // is a Web Animations API run, so it is unaffected by the transition kill.
    if (mounted) spinIcon(fromDeg, rotateDegree);
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
        bind:this={iconEl}
        class="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5"
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
