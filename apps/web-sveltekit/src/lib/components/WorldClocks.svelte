<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { formatWorldClock } from '$lib/world-clock';

  export let compact = false;
  const locations = [
    { id: 'local', label: 'your time', timeZone: '' },
    { id: 'nyc', label: 'nyc', timeZone: 'America/New_York' },
    { id: 'sweden', label: 'sweden', timeZone: 'Europe/Stockholm' },
    { id: 'tokyo', label: 'tokyo', timeZone: 'Asia/Tokyo' }
  ];
  let clocks: (ReturnType<typeof formatWorldClock> & { timeZone: string })[] = [];
  let reduced = true;

  onMount(() => {
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => reduced = media.matches;
    preference(); media.addEventListener('change', preference);
    let timer: ReturnType<typeof setTimeout>;
    let active = true;
    function tick() {
      clearTimeout(timer);
      if (!active || document.hidden) return;
      const now = new Date();
      clocks = locations.map(location => {
        const timeZone = location.timeZone || localZone;
        return { ...formatWorldClock(now, timeZone), timeZone };
      });
      // Minute precision keeps the strip calm and synchronized.
      timer = setTimeout(tick, 60000 - Date.now() % 60000 + 8);
    }
    document.addEventListener('visibilitychange', tick);
    tick();
    return () => {
      active = false; clearTimeout(timer);
      document.removeEventListener('visibilitychange', tick);
      media.removeEventListener('change', preference);
    };
  });
</script>

<section class="world-clocks" class:compact aria-label="World clocks" data-ready={clocks.length > 0}>
  <header><time datetime={clocks[0]?.iso} title={clocks[0]?.date}>{clocks[0]?.date.replace(/, \d{4}$/, '') ?? '—'}</time></header>
  <div class="clock-grid">
    {#each locations as location, index (location.id)}
      {@const clock = clocks[index]}
      <article class:local={location.id === 'local'} data-timezone={clock?.timeZone ?? location.timeZone} title={clock ? `${clock.date} · ${clock.offset} · ${clock.timeZone}` : location.label}>
        <span class="clock-location">{location.label}</span>
        <time class="clock-time" datetime={clock?.iso} aria-label={clock ? `${location.label}: ${clock.time.slice(0, 5)}, ${clock.date}, ${clock.offset}` : `${location.label}: loading time`}>
          <span class="clock-digits" aria-hidden="true">
            {#each (clock?.time.slice(0, 5) ?? '--:--').split('') as digit}
              <span class="digit-slot" class:separator={digit === ':'}>
                {#key digit}<span in:fly={{ y: 5, duration: reduced ? 0 : 220 }} out:fly={{ y: -5, duration: reduced ? 0 : 160 }}>{digit}</span>{/key}
              </span>
            {/each}
          </span>
        </time>
      </article>
    {/each}
  </div>
</section>

<style>
  .world-clocks { margin-top: 2rem; padding: 14px 0; border-block: 1px solid hsl(var(--foreground) / .12); color: hsl(var(--foreground)); }
  header { margin-bottom: 12px; color: hsl(var(--muted-foreground)); font-size: var(--font-size-xs); }
  .clock-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 20px; }
  article { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; }
  .clock-location { font-size: var(--font-size-xs); }
  .local .clock-location { color: hsl(var(--site-blue)); }
  .clock-time { display: block; font-variant-numeric: tabular-nums; }
  .clock-digits { display: flex; align-items: center; font-size: var(--font-size-md); font-weight: 500; line-height: 1.2; }
  .digit-slot { position: relative; display: inline-grid; place-items: center; width: .64em; height: 1.25em; overflow: hidden; }
  .digit-slot > span { grid-area: 1 / 1; display: block; }
  .digit-slot.separator { width: .35em; opacity: .55; animation: clock-breathe 3s ease-in-out infinite; }
  @keyframes clock-breathe { 50% { opacity: .9; } }
  .compact { margin-top: 0; padding: 0; border: 0; }
  .compact .clock-grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 16px 24px; }
  @media (max-width: 600px) { .clock-grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 16px 22px; } }
  @media (prefers-reduced-motion: reduce) { .digit-slot.separator { animation: none; } }
</style>
