<script lang="ts">
  import { friendOrbit, connectionGroups } from '$lib/friend-orbit';
  import FriendThoughts from '$lib/components/FriendThoughts.svelte';
  import FriendCard from '$lib/components/FriendCard.svelte';
  import PillTabs from '$lib/components/PillTabs.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';
  import { onMount } from 'svelte';
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
  onMount(() => { if (window.matchMedia('(pointer: coarse)').matches) paused = true; });
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
  let thoughtHeight = 0;
  let thoughtX = 0;
  let thoughtY = 0;
  let thoughtDotX = 0;
  let thoughtDotY = 0;
  let previousTab = 'all';
  $: if (activeTab !== previousTab) { thoughtUsername = ''; previousTab = activeTab; }
  function selectFriend(event: MouseEvent, username: string) {
    selectedUsername = username;
    if (thoughtUsername === username && !window.matchMedia('(max-width: 560px), (pointer: coarse)').matches) { thoughtUsername = ''; return; }
    const map = mapElement.getBoundingClientRect();
    const person = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const anchorX = person.left + person.width / 2 - map.left;
    const anchorY = person.top + person.height / 2 - map.top;
    const width = Math.min(340, map.width - 24);
    thoughtX = Math.max(12, Math.min(map.width - width - 12, anchorX < map.width / 2 ? anchorX + 32 : anchorX - width - 32));
    thoughtY = username === 'octobersfilm' ? 12 : Math.max(12, Math.min(map.height - 270, anchorY - 70));
    thoughtDotX = anchorX;
    thoughtDotY = anchorY - 28;
    thoughtUsername = username;
  }
  function dismissOutside(event: PointerEvent) {
    if (window.matchMedia('(max-width: 560px), (pointer: coarse)').matches) return;
    if (!(event.target instanceof Element) || event.target.closest('.connection-person, .thought-cloud, .friend-controls')) return;
    thoughtUsername = '';
  }
  function noteFade(node: Element) { return fade(node, { duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 160 }); }
  $: visibleFriends = activeTab === 'all' ? everyone : everyone.filter(friend => friend.groupId === activeTab);
  $: selected = visibleFriends.find(friend => friend.username === selectedUsername) || visibleFriends[0];
  $: nodes = friendOrbit(visibleFriends, activeTab === 'all');
  $: rings = data.friendGroups.filter(group => activeTab === 'all' || group.id === activeTab).map(group => ({ ...group, ...connectionGroups[group.id], radius: activeTab === 'all' ? connectionGroups[group.id].radius : 36 }));

</script>

<svelte:window on:pointerdown={dismissOutside} on:keydown={(event) => { if (event.key === 'Escape') thoughtUsername = ''; }} on:resize={() => { if (!window.matchMedia('(max-width: 560px), (pointer: coarse)').matches) thoughtUsername = ''; }} />

<SeoHead title="friends" path="/friends" description="Friends, artists, and creators in Mike's corner of the internet." />
<SectionPageShell title="Friends" currentLabel="Friends" footerColor="blue">
  <section class="friends-circle">
    <PillTabs bind:activeTab {tabs} ariaLabel="Friend groups" storageKey="mikeblocky:friends-tab" syncUrl />
    <p id="orbit-meaning" class="orbit-explanation">Colors show how we connected. Select someone to highlight their connection.</p>
    <ul class="connection-key" aria-label="Connection key">
      {#each rings as ring}
        <li title={ring.meaning}><svg width="34" height="12" aria-hidden="true"><line x1="1" y1="6" x2="33" y2="6" stroke={ring.color} stroke-width="2" stroke-dasharray={ring.dash} /></svg><span><strong>{groupLabels[ring.id]?.label || ring.title}</strong></span></li>
      {/each}
    </ul>
    <div class="connection-map" bind:this={mapElement} class:has-thought={!!thoughtUsername} class:paused style={`margin-bottom: ${thoughtUsername ? Math.max(88, thoughtY + thoughtHeight - 560 + 24) : 88}px;`} aria-label="People connected to Mike" aria-describedby="orbit-meaning">
      {#key activeTab}<div class="connection-world"><div class="connection-orbit">
      <svg class="connection-threads" viewBox="0 0 800 560" preserveAspectRatio="none" fill="none" aria-hidden="true">
        {#each activeTab === 'all' ? [29, 43] : [39] as radius}<ellipse cx="400" cy="280" rx={radius * 8} ry={radius * .9 * 5.6} class="connection-ring" />{/each}
        {#each nodes as node (node.friend.username)}
          <path d={`M400 280 Q${400 + (node.x - 50) * 3} ${280 + (node.y - 50) * 1.3} ${node.x * 8} ${node.y * 5.6}`} class:active={highlighted === node.friend.username || selected?.username === node.friend.username} style={`--connection-color: ${node.color}; stroke-dasharray: ${node.dash};`} />
        {/each}
      </svg>
      {#each nodes as node (node.friend.username)}
        <button class="connection-person" class:chosen={selected?.username === node.friend.username} style={`left: ${node.x}%; top: ${node.y}%; --connection-color: ${node.color};`} type="button" aria-label={`Read about @${node.friend.username}`} aria-pressed={selected?.username === node.friend.username} aria-controls="friend-detail" aria-expanded={thoughtUsername === node.friend.username} on:click={(event) => selectFriend(event, node.friend.username)} on:mouseenter={() => highlighted = node.friend.username} on:mouseleave={() => highlighted = ''} on:focus={() => highlighted = node.friend.username} on:blur={() => highlighted = ''}>
          <span class="connection-avatar"><span aria-hidden="true">{node.friend.username.replace(/_/g, '').slice(0, 2)}</span><img src={`https://unavatar.io/twitter/${node.friend.username}`} alt="" loading="lazy" on:error={(event) => (event.currentTarget as HTMLImageElement).style.display = 'none'} /></span>
          <span class="connection-name">@{node.friend.username}</span>
        </button>
      {/each}
      </div></div>{/key}
      {#if thoughtUsername}
        <span class="thought-dots" style={`left: ${thoughtDotX}px; top: ${thoughtDotY}px;`} aria-hidden="true"><i></i><i></i></span>
        <div class="desktop-thoughts">{#key thoughtUsername}<FriendThoughts username={thoughtUsername} x={thoughtX} y={thoughtY} onHeight={(height) => thoughtHeight = height} onClose={() => thoughtUsername = ''} />{/key}</div>
      {/if}
      <div class="connection-center"><img src="/mike-avatar.jpg" alt="Mike" width="64" height="64" /><strong>Mike</strong></div>
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
      {#if thoughtUsername}{#key thoughtUsername}<FriendThoughts username={thoughtUsername} inline onClose={() => thoughtUsername = ''} />{/key}{/if}
    </div>
    <div id="friend-detail" class="connection-detail" aria-live="polite">
      {#if selected}
        {#key selected.username}
          <div in:noteFade><FriendCard username={selected.username} description={selected.description} tag={selected.tag} /></div>
        {/key}
      {/if}
    </div>
  </section>
</SectionPageShell>

<style>
  .orbit-explanation { margin:16px 0 18px; font-size:var(--font-size-xs); color:hsl(var(--muted-foreground)); line-height:1.6; }
  .connection-key { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px 20px; list-style:none; padding:0; margin:0 0 24px; }
  .connection-key li { display:flex; align-items:flex-start; gap:10px; }
  .connection-key svg { flex-shrink:0; margin-top:4px; }
  .connection-key span { display:grid; gap:4px; }
  .connection-key strong { font-size:var(--font-size-xs); font-weight:500; }
  .connection-ring { stroke:hsl(var(--border)); opacity:.45; stroke-width:1; vector-effect:non-scaling-stroke; }

  .phone-friends { display: none; }
  .friend-controls { display: grid; grid-template-columns: 44px minmax(0, 1fr) 44px; gap: 8px; margin-bottom: 16px; }
  .friend-controls button, .friend-controls select { min-height: 44px; border: 1px solid hsl(var(--border)); border-radius: 14px; background: hsl(var(--background)); color: hsl(var(--foreground)); font: inherit; font-size: var(--font-size-xs); }
  .friend-controls button { display: grid; place-items: center; cursor: pointer; }
  .friend-controls select { width: 100%; padding-inline: 12px; }
  @media (max-width: 560px) {
    .phone-friends { display: block; }
    .friends-circle :global(select) { font-size: var(--font-size-base); }
    .connection-map { margin-bottom: 88px !important; }
    .desktop-thoughts, .thought-dots { display: none; }
    .connection-person { min-width: 48px; min-height: 48px; }
    .orbit-pause { min-height: 44px; }
  }
  .friends-circle { min-width: 0; }
  .connection-map { position: relative; height: 560px; margin: 1.5rem -12px 1rem; isolation: isolate; }
  .connection-threads { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .connection-threads path { stroke: var(--connection-color); opacity:.22; stroke-width: 1.1; vector-effect: non-scaling-stroke; transition: stroke 240ms ease, stroke-width 240ms ease; }
  .connection-threads path.active { opacity:1; stroke-width:2.25; }
  .connection-center { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); display: grid; justify-items: center; gap: 8px; padding: 0; background: transparent; }
  .connection-center img { width: 64px; height: 64px; border-radius: 50%; box-shadow: none; }
  .connection-center strong { font-size: var(--font-size-xs); font-weight: 600; }
  .connection-person { position: absolute; transform: translate(-50%,-50%); display: grid; justify-items: center; gap: 9px; padding: 4px; border: 0; background: transparent; cursor: pointer; color: hsl(var(--muted-foreground)); }
  .connection-avatar { position: relative; display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%; background: hsl(var(--muted)); box-shadow: 0 0 0 4px hsl(var(--background)), 0 0 0 5px var(--connection-color); transition: transform 420ms cubic-bezier(.34,1.56,.64,1), box-shadow 220ms ease; }
  .connection-avatar > span { text-transform: uppercase; font-size: var(--font-size-2xs); }
  .connection-avatar img { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: inherit; object-fit: cover; }
  .connection-person:hover .connection-avatar, .connection-person:focus-visible .connection-avatar { transform: translateY(-3px) scale(1.08); }
  .connection-person.chosen .connection-avatar { box-shadow: 0 0 0 4px hsl(var(--background)), 0 0 0 6px var(--connection-color); }
  .connection-person.chosen .connection-name, .connection-person:hover .connection-name { color: var(--connection-color); }
  .connection-name { max-width: 108px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: var(--font-size-2xs); line-height: 1.4; background: hsl(var(--background)); padding-inline: 3px; }
  .connection-detail { max-width: 40rem; margin-inline: auto; }
  @media (max-width: 560px) { .connection-map { height: 430px; margin-inline: -8px; } .connection-avatar { width: 38px; height: 38px; } .connection-center img { width: 52px; height: 52px; } .connection-name { max-width: 83px; font-size: var(--font-size-2xs); } .connection-person { gap: 7px; } }
  @media (prefers-reduced-motion: reduce) { .connection-avatar, .connection-threads path { transition: none; } }
  /* Tilt the plane into depth, then counter-rotate portraits to keep them readable. */
  .connection-map { perspective: 850px; perspective-origin: 50% 50%; }
  .connection-world { position: absolute; inset: 0; transform: rotateX(20deg) rotateZ(-8deg); transform-style: preserve-3d; }
  .connection-orbit { position: absolute; inset: 0; transform-style: preserve-3d; animation: world-orbit 80s linear infinite; will-change: transform; }
  .connection-person { transform-style: preserve-3d; animation: portrait-facing 80s linear infinite; will-change: transform; }
  .thought-dots { position: absolute; z-index: 4; display: flex; gap: 4px; pointer-events: none; }
  .thought-dots i { width: 6px; height: 6px; border-radius: 50%; background: hsl(var(--background)); border: 1px solid hsl(var(--border)); }
  .thought-dots i + i { width: 10px; height: 10px; margin-top: -7px; }
  .connection-map.has-thought .connection-orbit, .connection-map.has-thought .connection-person,
  .connection-map.paused .connection-orbit, .connection-map.paused .connection-person,
  .connection-map:has(.connection-person:focus-visible) .connection-orbit, .connection-map:has(.connection-person:focus-visible) .connection-person { animation-play-state: paused; }
  @media (hover: hover) { .connection-map:hover .connection-orbit, .connection-map:hover .connection-person { animation-play-state: paused; } }
  .connection-center { z-index: 2; background: transparent; box-shadow: none; }
  .orbit-pause { position: absolute; left: 50%; transform: translateX(-50%); bottom: -64px; display: inline-flex; align-items: center; gap: 5px; border: 0; border-radius: 8px; background: transparent; color: hsl(var(--muted-foreground)); min-height: 36px; padding: 6px 9px; font-size: var(--font-size-2xs); cursor: pointer; }
  .orbit-pause:hover { background: hsl(var(--muted)); }
  @keyframes world-orbit { from { transform: rotateZ(0deg); } to { transform: rotateZ(360deg); } }
  @keyframes portrait-facing { from { transform: translate(-50%,-50%) rotateZ(8deg) rotateX(-20deg); } to { transform: translate(-50%,-50%) rotateZ(-352deg) rotateX(-20deg); } }
  @media (prefers-reduced-motion: reduce) {
    .connection-orbit, .connection-person { animation: none; will-change: auto; }
    .connection-person { transform: translate(-50%,-50%) rotateZ(8deg) rotateX(-20deg); }
    .orbit-pause { display: none; }
  }
</style>
