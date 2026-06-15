<script lang="ts">
  import FriendCard from '$lib/components/FriendCard.svelte';
  import PillTabs from '$lib/components/PillTabs.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';

  export let data;
  const groupLabels: Record<string, { label: string; tag: string }> = {
    developed: { label: 'Mutuals & close friends', tag: 'Mutual' },
    budding: { label: 'Budding connections', tag: 'Budding' },
    growing: { label: 'Growing bonds', tag: 'Growing' },
    upcoming: { label: 'Future plans to connect', tag: 'Upcoming' }
  };
  $: tabs = data.friendGroups.map((group) => ({
    id: group.id,
    label: groupLabels[group.id]?.label ?? group.title,
    count: group.friends.length
  }));
  let activeTab = data.friendGroups[0]?.id ?? 'developed';
  $: activeGroup = data.friendGroups.find((group) => group.id === activeTab) ?? data.friendGroups[0];
  $: activeTag = groupLabels[activeGroup?.id]?.tag ?? activeGroup?.title ?? '';
</script>

<SeoHead
  title="friends"
  path="/friends"
  image="/friends/opengraph-image.jpg"
  description="A small map of friendships and people around mikeblocky.com."
/>

<SectionPageShell
  title="Friends"
  description="A directory of wonderful people, creators, and mutual friends I've built connections with along the way."
  currentLabel="Friends"
  footerColor="blue"
>
  <section class="friends-client">
    <PillTabs bind:activeTab {tabs} ariaLabel="Friend groups" storageKey="mikeblocky:friends-tab" syncUrl />
    {#key activeTab}
    <div class="smooth-panel friend-card-list">
      {#each activeGroup.friends as friend}
        <FriendCard username={friend.username} description={friend.description} tag={activeTag} />
      {/each}
    </div>
    {/key}
  </section>
</SectionPageShell>
