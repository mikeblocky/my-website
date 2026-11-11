<script lang="ts">
  import { friendOrbit } from '$lib/friend-orbit';
  import FriendThoughts from '$lib/components/FriendThoughts.svelte';
  import FriendCard from '$lib/components/FriendCard.svelte';
  import PillTabs from '$lib/components/PillTabs.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';
  import { fade } from 'svelte/transition';
  import { Pause, Play, ChevronLeft, ChevronRight } from '@lucide/svelte';
  export let data;
  const groupLabels: Record<string, { label: string; tag: string }> = {
    admired: { label: 'Admired supporters', tag: 'Admired supporter' },
    developed: { label: 'Mutuals & close friends', tag: 'Mutual' },
    budding: { label: 'Budding connections', tag: 'Budding' },
    growing: { label: 'Growing bonds', tag: 'Growing' },
    upcoming: { label: 'Future plans to connect', tag: 'Upcoming' }
  };
  $: everyone = data.friendGroups.flatMap(group => group.friends.map(friend => ({ ...friend, groupId: group.id, tag: groupLabels[group.id]?.tag || group.title })));
  $: tabs = [{ id: 'all', label: 'Everyone', count: everyone.length }, ...data.friendGroups.map(group => ({ id: group.id, label: groupLabels[group.id]?.label ?? group.title, count: group.friends.length }))];
  let activeTab = 'all';
  let selectedUsername = '';
  let highlighted = '';
  let paused = false;
  function chooseFriend(username: string) {
    selectedUsername = username;
    thoughtUsername = username;
  }
  function stepFriend(direction: number) {
    const index = visibleFriends.findIndex(friend => friend.username === selected?.username);
    const next = visibleFriends[(index + direction + visibleFriends.length) % visibleFriends.length];
    if (next) chooseFriend(next.username);
  }
  let mapElement: HTMLDivElement;
  let thoughtUsername = '';
  let previousTab = 'all';
  $: if (activeTab !== previousTab) { thoughtUsername = ''; previousTab = activeTab; }
  function selectFriend(username: string) {
    selectedUsername = username;
    thoughtUsername = username;
  }
  function followThought(node: HTMLElement) {
    const media = window.matchMedia('(min-width:1000px)');
    const person = mapElement.querySelector<HTMLElement>(`[data-person="${CSS.escape(thoughtUsername)}"]`);
    let frame = 0, last = 0, width = 300, height = 180;
    const observer = new ResizeObserver(() => { width = node.offsetWidth; height = node.offsetHeight; });
    observer.observe(node);
    function move(now: number) {
      if (!media.matches || !person) return;
      if (now - last > 32) {
        const map = mapElement.getBoundingClientRect(), avatar = person.getBoundingClientRect();
        const x = Math.max(8, Math.min(map.width - width - 8, avatar.left + avatar.width / 2 - map.left - width / 2));
        const above = avatar.top - map.top - height - 14;
        const y = map.top + above > 12 ? above : avatar.bottom - map.top + 14;
        node.style.transform = `translate3d(${x}px,${y}px,0)`;
        last = now;
      }
      frame = requestAnimationFrame(move);
    }
    function start() { cancelAnimationFrame(frame); if (media.matches) frame = requestAnimationFrame(move); }
    media.addEventListener('change', start); start();
    return { destroy() { cancelAnimationFrame(frame); observer.disconnect(); media.removeEventListener('change', start); } };
  }
  function dismissOutside(event: PointerEvent) {
    if (window.matchMedia('(max-width: 560px), (pointer: coarse)').matches) return;
    if (!(event.target instanceof Element) || event.target.closest('.connection-person, .thought-cloud, .friend-controls, .friends-sidebar')) return;
    thoughtUsername = '';
  }
  function noteFade(node: Element) { return fade(node, { duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 160 }); }
  $: visibleFriends = activeTab === 'all' ? everyone : everyone.filter(friend => friend.groupId === activeTab);
  $: selected = visibleFriends.find(friend => friend.username === selectedUsername) || visibleFriends[0];
  $: nodes = friendOrbit(visibleFriends, activeTab === 'all');

</script>

<svelte:window on:pointerdown={dismissOutside} on:keydown={(event) => { if (event.key === 'Escape') thoughtUsername = ''; }} />

<SeoHead title="friends" path="/friends" description="Friends, artists, and creators in Mike's corner of the internet." />
<SectionPageShell title="Friends" currentLabel="Friends" footerColor="blue" containerSize="xl">
  <section class="friends-circle">
    <PillTabs bind:activeTab {tabs} ariaLabel="Friend groups" storageKey="mikeblocky:friends-tab" syncUrl />
    <div class="friends-stage">
    <div class="connection-map" bind:this={mapElement} class:has-thought={!!thoughtUsername} class:has-selection={visibleFriends.some(friend => friend.username === selectedUsername)} class:paused aria-label="People connected to Mike">
      {#key activeTab}<div class="connection-world"><div class="connection-orbit">
      <svg class="connection-threads" viewBox="0 0 800 560" preserveAspectRatio="none" fill="none" aria-hidden="true">
        {#each activeTab === 'all' ? [29, 43] : [39] as radius}<ellipse cx="400" cy="280" rx={radius * 8} ry={radius * .9 * 5.6} class="connection-ring" />{/each}
        {#each nodes as node (node.friend.username)}
          <path d={`M400 280 Q${400 + (node.x - 50) * 3} ${280 + (node.y - 50) * 1.3} ${node.x * 8} ${node.y * 5.6}`} class:active={highlighted === node.friend.username || selectedUsername === node.friend.username} style={`--connection-color: ${node.color}; stroke-dasharray: ${node.dash};`} />
        {/each}
      </svg>
      {#each nodes as node (node.friend.username)}
        <button data-person={node.friend.username} class="connection-person" class:chosen={selectedUsername === node.friend.username} style={`left: ${node.x}%; top: ${node.y}%; --connection-color: ${node.color};`} type="button" aria-label={`Read about @${node.friend.username}`} aria-pressed={selectedUsername === node.friend.username} aria-controls="friend-detail" aria-expanded={thoughtUsername === node.friend.username} on:click={() => selectFriend(node.friend.username)} on:mouseenter={() => highlighted = node.friend.username} on:mouseleave={() => highlighted = ''} on:focus={() => highlighted = node.friend.username} on:blur={() => highlighted = ''}>
          <span class="connection-avatar"><span aria-hidden="true">{node.friend.username.replace(/_/g, '').slice(0, 2)}</span><img src={`https://unavatar.io/twitter/${node.friend.username}`} alt="" loading="lazy" on:error={(event) => (event.currentTarget as HTMLImageElement).style.display = 'none'} /></span>
          <span class="connection-name">@{node.friend.username}</span>
        </button>
      {/each}
      </div></div>{/key}
      {#if thoughtUsername}{#key thoughtUsername}<div class="anchored-thought" use:followThought><FriendThoughts instance="friend-thoughts-orbit" username={thoughtUsername} inline onClose={() => thoughtUsername = ''} /></div>{/key}{/if}
      <button class="connection-center" type="button" aria-label="Show all connections" on:click={() => { selectedUsername = ''; thoughtUsername = ''; highlighted = ''; }}><img src="/mike-avatar.jpg" alt="Mike" width="64" height="64" /><strong>Mike</strong></button>
      <button class="orbit-pause" type="button" aria-label={paused ? 'Resume orbit' : 'Pause orbit'} aria-pressed={paused} on:click={() => paused = !paused}><svelte:component this={paused ? Play : Pause} size={14} /><span>{paused ? 'Resume' : 'Pause'}</span></button>
    </div>

    <div class="phone-friends">
      <div class="friend-controls">
        <button type="button" aria-label="Previous friend" on:click={() => stepFriend(-1)}><ChevronLeft size={20} /></button>
        <select class="site-native-select" aria-label="Choose a friend" value={selected?.username} on:change={(event) => chooseFriend(event.currentTarget.value)}>
          {#each visibleFriends as friend}<option value={friend.username}>@{friend.username}</option>{/each}
        </select>
        <button type="button" aria-label="Next friend" on:click={() => stepFriend(1)}><ChevronRight size={20} /></button>
      </div>
    </div>

    <aside class="friends-sidebar">
    <div class="profile-thoughts">{#if thoughtUsername}{#key thoughtUsername}<FriendThoughts username={thoughtUsername} inline onClose={() => thoughtUsername = ''} />{/key}{/if}</div>
    <div id="friend-detail" class="connection-detail" aria-live="polite">
      {#if selected}
        {#key selected.username}
          <div in:noteFade><FriendCard username={selected.username} description={selected.description} tag={selected.tag} /></div>
        {/key}
      {/if}
    </div>
    </aside>
    </div>

  </section>
</SectionPageShell>

<style>
  :global(html:has(.friends-circle)) { scrollbar-width:none; }
  :global(html:has(.friends-circle)::-webkit-scrollbar) { display:none; }

  .connection-ring { stroke:hsl(var(--border)); opacity:.45; stroke-width:1; vector-effect:non-scaling-stroke; }

  .phone-friends { display: none; }
  .friend-controls { display: grid; grid-template-columns: 44px minmax(0, 1fr) 44px; gap: 8px; margin-bottom: 16px; }
  .friend-controls button, .friend-controls select { min-height: 44px; border: 1px solid hsl(var(--border)); border-radius: 14px; background: hsl(var(--background)); color: hsl(var(--foreground)); font: inherit; font-size: var(--font-size-xs); }
  .friend-controls button { display: grid; place-items: center; cursor: pointer; }
  .friend-controls select { width: 100%; padding-inline: 12px; }
  @media (max-width: 560px) {
    .phone-friends { display: block; }
    .friends-circle :global(select) { font-size: var(--font-size-base); }
    .connection-map { margin-bottom: 112px !important; }
    .connection-person { min-width: 48px; min-height: 48px; }
    .orbit-pause { min-height: 44px; }
  }
  .friends-circle { min-width: 0; }
  .connection-map { position: relative; height: auto; aspect-ratio: 1; margin: 40px 16px 112px; isolation: isolate; }
  .connection-threads { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .connection-threads path { stroke: var(--connection-color); opacity:.22; stroke-width: 1.1; vector-effect: non-scaling-stroke; transition: stroke 240ms ease, stroke-width 240ms ease; }
  .connection-threads path.active { opacity:1; stroke-width:2.25; }
  .connection-center { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); display: grid; justify-items: center; gap: 8px; padding: 0; border:0; font:inherit; color:inherit; cursor:pointer; background: transparent; }
  .connection-center img { width: 64px; height: 64px; border-radius: 50%; box-shadow: none; }
  .connection-center strong { font-size: var(--font-size-xs); font-weight: 600; }
  .connection-person { opacity:1; transition:opacity 240ms ease; position: absolute; transform: translate(-50%,-50%); display: grid; justify-items: center; gap: 9px; padding: 4px; border: 0; background: transparent; cursor: pointer; color: hsl(var(--muted-foreground)); }
  .connection-avatar { position: relative; display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%; background: hsl(var(--muted)); box-shadow: 0 0 0 4px hsl(var(--background)), 0 0 0 5px var(--connection-color); transition: transform 420ms cubic-bezier(.34,1.56,.64,1), box-shadow 220ms ease; }
  .connection-avatar > span { text-transform: uppercase; font-size: var(--font-size-2xs); }
  .connection-avatar img { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: inherit; object-fit: cover; }
  .connection-person:hover .connection-avatar, .connection-person:focus-visible .connection-avatar { transform: translateY(-3px) scale(1.08); }
  .connection-person.chosen .connection-avatar { box-shadow: 0 0 0 4px hsl(var(--background)), 0 0 0 6px var(--connection-color); }
  .connection-person.chosen .connection-name, .connection-person:hover .connection-name { color: var(--connection-color); }
  .connection-name { max-width: 108px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: var(--font-size-2xs); line-height: 1.4; background: hsl(var(--background)); padding-inline: 3px; }
  .connection-detail { max-width: 40rem; margin-inline: auto; }
  .connection-map.has-selection .connection-person:not(.chosen) { opacity:.42; }
  .connection-map.has-selection .connection-person:hover, .connection-map.has-selection .connection-person:focus-visible { opacity:.85; }
  .connection-person.chosen { opacity:1; }
  @media(min-width:1000px) {
    .friends-stage { display:grid; grid-template-columns:minmax(0,1fr) 290px; gap:32px; align-items:center; }
    .friends-sidebar { position:sticky; top:40px; align-self:center; margin-top:0; display:grid; gap:20px; }
    .connection-map { height:440px; aspect-ratio:auto; margin:0 0 80px; }
    .friends-sidebar :global(.thought-cloud.inline) { margin:0; }
    .connection-detail { width:100%; max-width:none; align-self:start; padding:22px; box-sizing:border-box; border:1px solid hsl(var(--border)/.7); border-radius:18px; background:hsl(var(--background)/.92); box-shadow:0 12px 40px hsl(var(--foreground)/.035); }
    .connection-detail :global(.friend-note) { border-top:0; padding:0; }
    .connection-detail :global(.friend-note header) { align-items:flex-start; flex-wrap:wrap; gap:10px; }
    .connection-detail :global(.friend-note header > div) { gap:8px; }
    .connection-detail :global(.friend-note p) { font-size:var(--font-size-sm); line-height:1.65; }
  }
  @media(min-width:561px) and (max-width:999px) { .connection-detail { max-width:40rem; } }

  @media (max-width: 560px) { .connection-map { height: auto; aspect-ratio:1; margin-inline: 0; } .connection-avatar { width: 38px; height: 38px; } .connection-center img { width: 52px; height: 52px; } .connection-name { max-width: 83px; font-size: var(--font-size-2xs); } .connection-person { gap: 7px; } }
  @media (prefers-reduced-motion: reduce) { .connection-avatar, .connection-threads path { transition: none; } }
  /* Tilt the plane into depth, then counter-rotate portraits to keep them readable. */
  .connection-map { perspective: 850px; perspective-origin: 50% 50%; }
  .connection-world { position: absolute; inset: 56px; transform: rotateX(20deg) rotateZ(-8deg); transform-style: preserve-3d; }
  .connection-orbit { position: absolute; inset: 0; transform-style: preserve-3d; animation: world-orbit 80s linear infinite; will-change: transform; }
  .connection-person { transform-style: preserve-3d; animation: portrait-facing 80s linear infinite; will-change: transform; }
  .connection-map.paused .connection-orbit, .connection-map.paused .connection-person { animation-play-state: paused; }
  .connection-center { z-index: 2; background: transparent; box-shadow: none; }
  .orbit-pause { position: absolute; left: 50%; transform: translateX(-50%); bottom: -48px; display: inline-flex; align-items: center; gap: 5px; border: 0; border-radius: 8px; background: transparent; color: hsl(var(--muted-foreground)); min-height: 36px; padding: 6px 9px; font-size: var(--font-size-2xs); cursor: pointer; }
  .orbit-pause:hover { background: hsl(var(--muted)); }
  @keyframes world-orbit { from { transform: rotateZ(0deg); } to { transform: rotateZ(360deg); } }
  @keyframes portrait-facing { from { transform: translate(-50%,-50%) rotateZ(8deg) rotateX(-20deg); } to { transform: translate(-50%,-50%) rotateZ(-352deg) rotateX(-20deg); } }
  .anchored-thought { display:none; position:absolute; left:0; top:0; width:300px; max-width:calc(100% - 16px); z-index:8; transition:transform 90ms linear; }
  @media (min-width:1000px) {
    .anchored-thought { display:block; }
    .profile-thoughts { display:none; }
    .connection-person { animation-name:portrait-facing-wide; }
    .connection-world { width:calc(100% - 64px); max-width:720px; height:auto; aspect-ratio:1; inset:auto; left:50%; top:50%; transform:translate(-50%,-50%) scaleY(.62) rotateZ(-4deg); }
  }
  @media (max-width:560px) {
    .connection-map { height:580px; aspect-ratio:auto; margin-top:48px; margin-bottom:112px !important; }
    .connection-world { inset:40px 24px; transform:rotateX(8deg); }
    .connection-orbit { animation:mobile-orbit-drift 18s ease-in-out infinite alternate; }
    .connection-person { animation:none; transform:translate(-50%,-50%) rotateX(-8deg); }
    .connection-map.has-selection .connection-person:not(.chosen) { opacity:.38; }
    .connection-detail { margin-top:24px; }
    .friends-sidebar { margin-top:24px; }
  }
  @keyframes portrait-facing-wide { from { transform:translate(-50%,-50%) rotateZ(4deg) scaleY(1.612903); } to { transform:translate(-50%,-50%) rotateZ(-356deg) scaleY(1.612903); } }
  @media(prefers-reduced-motion:reduce) and (min-width:1000px) { .connection-person { transform:translate(-50%,-50%) rotateZ(4deg) scaleY(1.612903); } .anchored-thought { transition:none; } }
  @keyframes mobile-orbit-drift { from { transform:translateY(-5px); } to { transform:translateY(5px); } }
  @media (prefers-reduced-motion: reduce) {
    .connection-orbit, .connection-person { animation: none; will-change: auto; }
    .connection-person { transform: translate(-50%,-50%) rotateZ(8deg) rotateX(-20deg); }
    .orbit-pause { display: none; }
  }
</style>
