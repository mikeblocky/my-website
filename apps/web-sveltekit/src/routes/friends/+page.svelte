<script lang="ts">
  import FriendCard from '$lib/components/FriendCard.svelte';
  import PillTabs from '$lib/components/PillTabs.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';
  import { fade } from 'svelte/transition';
  import { Pause, Play } from '@lucide/svelte';
  export let data;
  const groupLabels: Record<string, { label: string; tag: string }> = {
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
  function noteFade(node: Element) { return fade(node, { duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 160 }); }
  $: visibleFriends = activeTab === 'all' ? everyone : everyone.filter(friend => friend.groupId === activeTab);
  $: selected = visibleFriends.find(friend => friend.username === selectedUsername) || visibleFriends[0];
  $: nodes = visibleFriends.map((friend, index) => {
    const angle = -Math.PI / 2 + (index / Math.max(1, visibleFriends.length)) * Math.PI * 2;
    return { friend, x: 50 + Math.cos(angle) * 39, y: 50 + Math.sin(angle) * 36 };
  });
</script>

<SeoHead title="friends" path="/friends" description="Friends, artists, and creators in Mike's corner of the internet." />
<SectionPageShell title="Friends" currentLabel="Friends" footerColor="blue">
  <section class="friends-circle">
    <PillTabs bind:activeTab {tabs} ariaLabel="Friend groups" storageKey="mikeblocky:friends-tab" syncUrl />
    <div class="connection-map" class:paused aria-label="People connected to Mike">
      {#key activeTab}<div class="connection-world"><div class="connection-orbit">
      <svg class="connection-threads" viewBox="0 0 800 460" preserveAspectRatio="none" fill="none" aria-hidden="true">
        {#each nodes as node (node.friend.username)}
          <path d={`M400 230 Q${400 + (node.x - 50) * 3} ${230 + (node.y - 50) * 1.1} ${node.x * 8} ${node.y * 4.6}`} class:active={highlighted === node.friend.username || selected?.username === node.friend.username} class:upcoming={node.friend.groupId === 'upcoming'} />
        {/each}
      </svg>
      {#each nodes as node (node.friend.username)}
        <button class="connection-person" class:chosen={selected?.username === node.friend.username} style={`left: ${node.x}%; top: ${node.y}%;`} type="button" aria-label={`Read about @${node.friend.username}`} aria-pressed={selected?.username === node.friend.username} aria-controls="friend-detail" on:click={() => selectedUsername = node.friend.username} on:mouseenter={() => highlighted = node.friend.username} on:mouseleave={() => highlighted = ''} on:focus={() => highlighted = node.friend.username} on:blur={() => highlighted = ''}>
          <span class="connection-avatar"><span aria-hidden="true">{node.friend.username.replace(/_/g, '').slice(0, 2)}</span><img src={`https://unavatar.io/twitter/${node.friend.username}`} alt="" loading="lazy" on:error={(event) => (event.currentTarget as HTMLImageElement).style.display = 'none'} /></span>
          <span class="connection-name">@{node.friend.username}</span>
        </button>
      {/each}
      </div></div>{/key}
      <div class="connection-center"><img src="/mike-avatar.jpg" alt="Mike" width="64" height="64" /><strong>Mike</strong></div>
      <button class="orbit-pause" type="button" aria-label={paused ? 'Resume orbit' : 'Pause orbit'} aria-pressed={paused} on:click={() => paused = !paused}><svelte:component this={paused ? Play : Pause} size={14} /><span>{paused ? 'Resume' : 'Pause'}</span></button>
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
  .friends-circle { min-width: 0; }
  .connection-map { position: relative; height: 460px; margin: 1.5rem -12px 1rem; isolation: isolate; }
  .connection-threads { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  .connection-threads path { stroke: hsl(var(--border)); stroke-width: 1; vector-effect: non-scaling-stroke; transition: stroke 240ms ease, stroke-width 240ms ease; }
  .connection-threads path.active { stroke: hsl(var(--site-blue) / .5); stroke-width: 1.5; }
  .connection-threads path.upcoming { stroke-dasharray: 3 5; }
  .connection-center { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); display: grid; justify-items: center; gap: 8px; padding: 14px; background: hsl(var(--background)); border-radius: 50%; }
  .connection-center img { width: 64px; height: 64px; border-radius: 50%; box-shadow: 0 0 0 7px hsl(var(--background)), 0 0 0 8px hsl(var(--border) / .65); }
  .connection-center strong { font-size: .8rem; font-weight: 600; }
  .connection-person { position: absolute; transform: translate(-50%,-50%); display: grid; justify-items: center; gap: 9px; padding: 4px; border: 0; background: transparent; cursor: pointer; color: hsl(var(--muted-foreground)); }
  .connection-avatar { position: relative; display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%; background: hsl(var(--muted)); box-shadow: 0 0 0 5px hsl(var(--background)); transition: transform 420ms cubic-bezier(.34,1.56,.64,1), box-shadow 220ms ease; }
  .connection-avatar > span { text-transform: uppercase; font-size: .7rem; }
  .connection-avatar img { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: inherit; object-fit: cover; }
  .connection-person:hover .connection-avatar, .connection-person:focus-visible .connection-avatar { transform: translateY(-3px) scale(1.08); }
  .connection-person.chosen .connection-avatar { box-shadow: 0 0 0 4px hsl(var(--background)), 0 0 0 5px hsl(var(--site-blue) / .55); }
  .connection-person.chosen .connection-name, .connection-person:hover .connection-name { color: hsl(var(--site-blue)); }
  .connection-name { max-width: 108px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .65rem; line-height: 1.4; background: hsl(var(--background)); padding-inline: 3px; }
  .connection-detail { max-width: 40rem; margin-inline: auto; }
  @media (max-width: 560px) { .connection-map { height: 430px; margin-inline: -8px; } .connection-avatar { width: 38px; height: 38px; } .connection-center img { width: 52px; height: 52px; } .connection-name { max-width: 83px; font-size: .58rem; } .connection-person { gap: 7px; } }
  @media (prefers-reduced-motion: reduce) { .connection-avatar, .connection-threads path { transition: none; } }
  /* Tilt the plane into depth, then counter-rotate portraits to keep them readable. */
  .connection-map { perspective: 850px; perspective-origin: 50% 50%; }
  .connection-world { position: absolute; inset: 0; transform: rotateX(38deg) rotateZ(-8deg); transform-style: preserve-3d; }
  .connection-orbit { position: absolute; inset: 0; transform-style: preserve-3d; animation: world-orbit 80s linear infinite; will-change: transform; }
  .connection-person { transform-style: preserve-3d; animation: portrait-facing 80s linear infinite; will-change: transform; }
  .connection-map.paused .connection-orbit, .connection-map.paused .connection-person,
  .connection-map:has(.connection-person:focus-visible) .connection-orbit, .connection-map:has(.connection-person:focus-visible) .connection-person { animation-play-state: paused; }
  @media (hover: hover) { .connection-map:hover .connection-orbit, .connection-map:hover .connection-person { animation-play-state: paused; } }
  .connection-center { z-index: 2; background: hsl(var(--background) / .95); box-shadow: 0 8px 25px hsl(var(--foreground) / .04); }
  .orbit-pause { position: absolute; left: 50%; transform: translateX(-50%); bottom: 0; display: inline-flex; align-items: center; gap: 5px; border: 0; border-radius: 8px; background: transparent; color: hsl(var(--muted-foreground)); min-height: 36px; padding: 6px 9px; font-size: .65rem; cursor: pointer; }
  .orbit-pause:hover { background: hsl(var(--muted)); }
  @keyframes world-orbit { from { transform: rotateZ(0deg); } to { transform: rotateZ(360deg); } }
  @keyframes portrait-facing { from { transform: translate(-50%,-50%) rotateZ(8deg) rotateX(-38deg); } to { transform: translate(-50%,-50%) rotateZ(-352deg) rotateX(-38deg); } }
  @media (prefers-reduced-motion: reduce) {
    .connection-orbit, .connection-person { animation: none; will-change: auto; }
    .connection-person { transform: translate(-50%,-50%) rotateZ(8deg) rotateX(-38deg); }
    .orbit-pause { display: none; }
  }
</style>
