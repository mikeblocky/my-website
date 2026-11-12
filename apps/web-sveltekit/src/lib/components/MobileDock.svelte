<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { Menu, X, Home, User, Palette, BookOpen, Users, Heart, MessageCircle, ClipboardList, Music } from '@lucide/svelte';
  import { navLinks } from '$lib/site';
  import ThemeToggle from './ThemeToggle.svelte';
  import HapticsToggle from './HapticsToggle.svelte';
  import { dockDragIntent } from '$lib/gesture-intent';
  import { pulseHaptic } from '$lib/interaction-feedback';
  import { spotifyCurrentlyPlaying, startSpotifyPolling } from '$lib/spotify/currently-playing-store';
  let open = false;
  let reducedMotion = false;
  let navigating = false;
  let positioned = false;
  let x = 0, y = 0, viewportWidth = 0, viewportHeight = 0;
  let panelHeight = 440;
  let panel: HTMLDivElement;
  let trigger: HTMLButtonElement;
  let dragFrame=0,nextX=0,nextY=0;
  let dragging = false;
  let ignoreClickUntil=0;
  let pointer: { id: number; x: number; y: number; originX: number; originY: number;type:string;started:number } | null = null;
  type DockPosition = { corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' };
  let position: DockPosition = { corner: 'bottom-right' };
  const size = 54, margin = 16;
  let insets={top:margin,right:margin,bottom:margin,left:margin};
  const clamp = (value: number, max: number, start=margin,end=margin) => Math.max(start, Math.min(value, Math.max(start, max - size - end)));
  function restorePosition() {
    const styles=getComputedStyle(document.documentElement);
    const safe=(side:string)=>Math.max(margin,(parseFloat(styles.getPropertyValue(`--safe-${side}`))||0)+8);
    insets={top:safe('top'),right:safe('right'),bottom:safe('bottom'),left:safe('left')};
    viewportWidth = window.innerWidth;
    if(viewportWidth>760)open=false;
    viewportHeight = window.visualViewport?.height || window.innerHeight;
    x = position.corner.endsWith('left') ? insets.left : viewportWidth - size - insets.right;
    y = position.corner.startsWith('top') ? insets.top : viewportHeight - size - insets.bottom;
    x = clamp(x, viewportWidth,insets.left,insets.right); y = clamp(y, viewportHeight,insets.top,insets.bottom); positioned = true;
  }
  function snapPosition() {
    position = { corner: `${y + size / 2 < viewportHeight / 2 ? 'top' : 'bottom'}-${x + size / 2 < viewportWidth / 2 ? 'left' : 'right'}` as DockPosition['corner'] }; restorePosition();
    try { localStorage.setItem('mike:mobile-navigation-position', JSON.stringify(position)); } catch {}
  }
  function startDrag(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return;
    // Leave taps to the browser. Capturing/releasing every touch can retarget
    // its compatibility click, especially when focus changes during pointerup.
    ignoreClickUntil = 0;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, originX: x, originY: y,type:event.pointerType,started:performance.now() };
  }
  function moveDrag(event: PointerEvent) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    if (!dragging && dockDragIntent(dx,dy,pointer.type,performance.now()-pointer.started)!=='drag') return;
    dragging = true; open = false;
    nextX=clamp(pointer.originX + dx,viewportWidth,insets.left,insets.right);nextY=clamp(pointer.originY + dy,viewportHeight,insets.top,insets.bottom);
    if(!dragFrame)dragFrame=requestAnimationFrame(()=>{dragFrame=0;x=nextX;y=nextY;});
  }
  function finishDrag(event: PointerEvent) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const moved = dragging;
    pointer = null; dragging = false;
    if(dragFrame){cancelAnimationFrame(dragFrame);dragFrame=0;x=nextX;y=nextY;}
    if (moved) {ignoreClickUntil=performance.now()+700;snapPosition();}
  }
  function cancelDrag(event:PointerEvent){
    if(!pointer||pointer.id!==event.pointerId)return;
    pointer=null;dragging=false;
    cancelAnimationFrame(dragFrame);dragFrame=0;
    restorePosition();
  }
  async function toggleMenu(){
    open=!open;
    await tick();
    if(open)panel?.querySelector<HTMLAnchorElement>('a')?.focus({preventScroll:true});else trigger?.focus({preventScroll:true});
  }
  function activateTrigger(event:MouseEvent){
    if(event.detail!==0&&performance.now()<ignoreClickUntil)return;
    pulseHaptic();
    void toggleMenu();
  }
  function trapMenu(node:HTMLElement){
    const trap=(event:KeyboardEvent)=>{
      if(event.key!=='Tab')return;
      const controls=Array.from(node.querySelectorAll<HTMLElement>('a[href],button:not(:disabled)')).filter(el=>el.getClientRects().length>0);
      const first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    };
    node.addEventListener('keydown',trap);return{destroy(){node.removeEventListener('keydown',trap);}};
  }
  async function navigate(event: MouseEvent, href: string) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigating = true; open = false;
    await tick();
    try { await goto(href); } finally { navigating = false; }
  }
  function measurePanel(node: HTMLDivElement) {
    const observer = new ResizeObserver(() => panelHeight = node.offsetHeight);
    observer.observe(node); return { destroy: () => observer.disconnect() };
  }
  $: panelX = Math.max(insets.left, Math.min(x + size - 248, viewportWidth - 248 - insets.right));
  $: panelY = y > viewportHeight / 2 ? Math.max(insets.top, y - panelHeight - 12) : Math.min(viewportHeight - panelHeight - insets.bottom, y + size + 12);
  function resetPosition() { position = { corner: 'bottom-right' }; restorePosition(); snapPosition(); open = false; trigger?.focus({preventScroll:true}); }

  const icons = [Home, User, Palette, BookOpen, Users, Heart, MessageCircle, ClipboardList];
  $: pathname = $page.url.pathname;
  $: if (pathname) open = false;
  onMount(() => {
    startSpotifyPolling();
    try {
      const saved = JSON.parse(localStorage.getItem('mike:mobile-navigation-position') || 'null');
      if (saved && ['top-left','top-right','bottom-left','bottom-right'].includes(saved.corner)) position = { corner: saved.corner };
    } catch {}
    restorePosition();
    window.addEventListener('resize', restorePosition);
    window.visualViewport?.addEventListener('resize', restorePosition);
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => reducedMotion = preference.matches;
    update(); preference.addEventListener('change', update);
    return () => { cancelAnimationFrame(dragFrame); preference.removeEventListener('change', update); window.removeEventListener('resize', restorePosition); window.visualViewport?.removeEventListener('resize', restorePosition); };
  });
  const active = (href: string, path: string) => href === '/' ? path === '/' : path.startsWith(href) || (href === '/journal' && /^\/(blog|diary|learning)/.test(path));
</script>
<svelte:window on:pointermove={moveDrag} on:pointerup={finishDrag} on:pointercancel={cancelDrag} on:keydown={(event) => { if (event.key === 'Escape'&&open) {open = false;trigger?.focus();} }} />
<div class="phone-navigation">
  {#if open}
    <button class="phone-menu-backdrop" type="button" aria-label="Close navigation" on:click={() => open = false} on:introstart={event=>(event.currentTarget as HTMLElement).inert=false} on:outrostart={event=>(event.currentTarget as HTMLElement).inert=true} transition:fade={{duration: reducedMotion || navigating ? 0 : 120}}></button>
    <div class="phone-menu-panel" id="phone-menu" role="dialog" aria-modal="true" aria-label="Site menu" bind:this={panel} use:measurePanel use:trapMenu style:max-height={positioned?`${Math.max(80,viewportHeight-size-margin*3)}px`:undefined} style:left={positioned ? `${panelX}px` : undefined} style:top={positioned ? `${Math.max(margin, panelY)}px` : undefined} style:bottom={positioned ? 'auto' : undefined} style:right={positioned ? 'auto' : undefined} on:introstart={event=>(event.currentTarget as HTMLElement).inert=false} on:outrostart={event=>(event.currentTarget as HTMLElement).inert=true} in:fly={{y: 8, duration: reducedMotion || navigating ? 0 : 180, easing: cubicOut}} out:fade={{duration:reducedMotion||navigating?0:100}}>
      <nav aria-label="Mobile navigation">
        {#each navLinks as link, index}
          <a href={link.href} class:active={active(link.href, pathname)} aria-current={active(link.href, pathname) ? 'page' : undefined} on:click={(event) => navigate(event, link.href)}>
            <svelte:component this={icons[index]} size={18} strokeWidth={1.7} /><span>{link.label}</span>
          </a>
        {/each}
      </nav>
      <div class="phone-menu-footer">
        <button class="phone-reset-position" type="button" on:click={resetPosition}>reset position</button>
        <HapticsToggle />
        <div class="phone-menu-theme"><ThemeToggle /></div>
      </div>
    </div>
  {/if}
  {#if $spotifyCurrentlyPlaying}
    <a class="phone-music" href={$spotifyCurrentlyPlaying.songUrl} target="_blank" rel="noreferrer" aria-label={`Mike is listening to ${$spotifyCurrentlyPlaying.song} by ${$spotifyCurrentlyPlaying.artist}`}>
      {#if $spotifyCurrentlyPlaying.artworkUrl}<img src={$spotifyCurrentlyPlaying.artworkUrl} alt="" width="36" height="36" />{:else}<Music size={20} />{/if}
      <span><strong>{$spotifyCurrentlyPlaying.song}</strong><small>{$spotifyCurrentlyPlaying.artist}</small></span>
      <span class="music-meter" aria-hidden="true"><i></i><i></i><i></i></span>
    </a>
  {/if}
  <button class="phone-menu-trigger" bind:this={trigger} class:open class:dragging style:left={positioned ? '0px' : undefined} style:top={positioned ? '0px' : undefined} style:transform={positioned?`translate3d(${x}px,${y}px,0)`:undefined} style:bottom={positioned ? 'auto' : undefined} style:right={positioned ? 'auto' : undefined} on:pointerdown={startDrag} type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="phone-menu" on:click={activateTrigger} on:contextmenu|preventDefault>
    <span class="phone-trigger-icon"><svelte:component this={open ? X : Menu} size={21} strokeWidth={1.8} /></span>
  </button>
</div>
