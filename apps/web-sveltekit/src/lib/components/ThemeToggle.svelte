<script context="module" lang="ts">
  let themeTransitionTimer:ReturnType<typeof setTimeout>;
</script>
<script lang="ts">
  import { onMount } from 'svelte';
  import { Sun, Moon } from '@lucide/svelte';
  import SpotifyNowPlaying from './SpotifyNowPlaying.svelte';

  let theme: 'light' | 'dark' = 'light';
  let mounted = false;
  let rotateDegree = 0;

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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const midDeg = (fromDeg + toDeg) / 2;
    const currentTransform=iconEl?getComputedStyle(iconEl).transform:`rotate(${fromDeg}deg)`;
    // Cancel any in-flight spin so rapid toggles don't stack conflicting
    // transform animations on the icon.
    iconAnim?.cancel();
    iconAnim = iconEl?.animate(
      [
        { transform: currentTransform },
        { transform: `rotate(${midDeg}deg) scale(0.9)` },
        { transform: `rotate(${toDeg}deg) scale(1)` }
      ],
      { duration: 180, easing: 'ease-in-out' }
    );
  }

  function applyTheme(nextTheme: 'light' | 'dark') {
    const root = document.documentElement;
    if (theme === nextTheme && mounted && root.classList.contains('dark')===(nextTheme==='dark')) return;
    const fromDeg = rotateDegree;
    const update = () => {
      theme = nextTheme;
      rotateDegree = nextTheme === 'dark' ? 360 : 0;
      root.classList.toggle('dark', nextTheme === 'dark');
      root.dataset.theme = nextTheme;
      root.style.colorScheme = nextTheme;
      try { localStorage.setItem('theme', nextTheme); } catch {}
      if (mounted) spinIcon(fromDeg, rotateDegree);
    };
    if (mounted && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      clearTimeout(themeTransitionTimer);
      root.classList.add('theme-changing');
      // Change colors in place: no full-page snapshots or separate navbar layer.
      update();
      themeTransitionTimer = setTimeout(() => root.classList.remove('theme-changing'), 170);
    } else update();
  }

  onMount(() => {
    let stored:string|null=null;try{stored=localStorage.getItem('theme');}catch{}
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(stored === 'dark' || (!stored && prefersDark) ? 'dark' : 'light');
    mounted = true;
    const observer=new MutationObserver(()=>{
      const next=document.documentElement.classList.contains('dark')?'dark':'light';
      if(next!==theme){theme=next;rotateDegree=next==='dark'?360:0;}
    });
    observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    return ()=>{observer.disconnect();iconAnim?.cancel();};
  });
</script>

<div class="flex items-center gap-3 sm:gap-4 select-none">
  {#if mounted}
    <SpotifyNowPlaying />
    <button
      type="button"
      class="relative p-2 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 border-0 bg-transparent cursor-pointer"
      aria-label="Toggle theme"
      on:click={() => applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark')}
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
