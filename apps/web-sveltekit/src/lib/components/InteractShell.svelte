<script lang="ts">
  import '$lib/styles/interact.css';
  import { onMount, tick } from 'svelte';
  import { page } from '$app/stores';
  import { Search, RefreshCw, X } from '@lucide/svelte';
  import { initialTalks, initialPrompts, initialSuggestions } from '@mikeblocky/site-data';
  import InteractComposer from './InteractComposer.svelte';
  import InteractPost from './InteractPost.svelte';
  import AdminLockToggle from './AdminLockToggle.svelte';
  import { feedKinds, feedConfig, combineFeed, cooldownDeadline, linkedFeedKey } from '$lib/boards/interact-feed';
  import type { FeedKind, FeedSources } from '$lib/boards/interact-feed';
  import { snapTalkCard, snapDrawCard, snapSuggestionCard, snapSketchbookCard } from '$lib/utils/snap';
  import { isPushSupported, subscribeToPush, registerServiceWorker } from '$lib/push/client';

  let sources: FeedSources = { talk: initialTalks, draw: initialPrompts, suggestions: initialSuggestions, sketchbook: [] };
  let kind: FeedKind = 'talk';
  let filter = 'all';
  let search = '';
  let visibleCount = 12;
  let isAdminMode = false;
  let passcode = '';
  let showPasscodeInput = false;

  let pending = 0;
  let refreshing = true;
  let failedSources: string[] = [];
  let notification = '';
  let notificationTimer: ReturnType<typeof setTimeout>;
  let now = Date.now();
  let deadlines: Record<FeedKind, number> = { talk: 0, draw: 0, suggestions: 0, sketchbook: 0 };
  let feedback: Record<FeedKind, Record<string, string>> = { talk: {}, draw: {}, suggestions: {}, sketchbook: {} };
  let likedList: string[] = [];
  let pushSupported = false;
  let wantNotification = false;
  let handledHash = '';
  let mounted = false;
  let controller: AbortController;

  $: feed = combineFeed(sources);
  $: filtered = feed.filter(entry => (filter === 'all' || (filter === 'posts' ? entry.kind !== 'sketchbook' : entry.kind === 'sketchbook')) &&
    [entry.post.author, entry.post.body, entry.post.title, entry.post.note, entry.post.bestPart, entry.post.character, entry.post.media]
      .some(value => String(value ?? '').toLowerCase().includes(search.trim().toLowerCase())));
  $: visible = filtered.slice(0, visibleCount);
  $: isPending = pending > 0;
  $: remaining = Math.max(0, deadlines[kind] - now);
  $: cooldownLabel = `${Math.ceil(remaining / 1000)}s`;
  $: if (mounted && $page.url.hash && $page.url.hash !== handledHash && feed.some(entry => entry.key === linkedFeedKey($page.url.hash))) {
    const hash = $page.url.hash;
    const index = feed.findIndex(entry => entry.key === linkedFeedKey(hash));
    handledHash = hash;
    filter = 'all'; search = ''; visibleCount = Math.max(12, index + 1);
    tick().then(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  }

  function showNotification(message: string) {
    notification = message;
    clearTimeout(notificationTimer);
    notificationTimer = setTimeout(() => notification = '', 5000);
  }

  function feedbackFor(type: FeedKind, action: string, id: string, message: string) {
    feedback = { ...feedback, [type]: { ...feedback[type], [`${action}-${id}`]: message } };
  }

  async function refresh() {
    if (pending) return;
    refreshing = true;
    const failed: string[] = [];
    await Promise.all(feedKinds.map(async (type) => {
      try {
        const response = await fetch(`/api/${type}`, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10000)]) });
        if (!response.ok) throw new Error('Refresh failed');
        const payload = await response.json();
        const list = payload[feedConfig[type].list];
        if (!Array.isArray(list)) throw new Error('Invalid response');
        sources = { ...sources, [type]: list.filter(post => post && typeof post.id === 'string') };
        now = Date.now();
        deadlines = { ...deadlines, [type]: cooldownDeadline(payload.cooldown, now) };
      } catch (error) {
        if (!controller?.signal.aborted) failed.push(feedConfig[type].label);
      }
    }));
    failedSources = failed;
    refreshing = false;
  }

  onMount(() => {
    controller = new AbortController();
    mounted = true;
    // Old board links can still open the appropriate composer without splitting the feed.
    const legacy = $page.url.searchParams.get('tab');


    if (legacy === 'sketchbook') kind = 'sketchbook';
    try { const stored = JSON.parse(localStorage.getItem('mikeblocky:liked-drawings') || '[]'); if (Array.isArray(stored)) likedList = stored.filter(value => typeof value === 'string'); } catch {}
    pushSupported = isPushSupported();
    void registerServiceWorker();
    void refresh();
    const timer = setInterval(() => now = Date.now(), 1000);
    return () => { mounted = false; controller.abort(); clearInterval(timer); clearTimeout(notificationTimer); };
  });

  async function mutate(type: FeedKind, method: string, payload: Record<string, any>) {
    pending += 1;
    try {
      const response = await fetch(`/api/${type}`, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.cooldown) {
        now = Date.now();
        deadlines = { ...deadlines, [type]: cooldownDeadline(result.cooldown, now) };
      }
      if (!response.ok) throw new Error(result.error || 'Could not save. Please try again.');
      const post = result[feedConfig[type].item];
      if (!post || typeof post.id !== 'string') throw new Error('Unexpected response. Your draft is preserved.');
      sources = { ...sources, [type]: [post, ...sources[type].filter(item => item.id !== post.id)] };
      return result;
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Connection failed. Your draft is preserved.');
      throw error;
    } finally { pending -= 1; }
  }

  async function submit(type: FeedKind, payload: Record<string, any>) {
    const data = payload;
    const result = await mutate(type, 'POST', data);
    filter = 'all'; search = ''; visibleCount = 12;
    showNotification('Posted.');
    if (type === 'talk' && wantNotification && pushSupported) {
      try {
        const subscribed = await subscribeToPush(result.question.id);
        if (subscribed) sources = { ...sources, talk: sources.talk.map(post => post.id === result.question.id ? { ...post, notifying: true } : post) };
        else showNotification('Posted. Notifications could not be enabled.');
      } catch { showNotification('Posted. Notifications could not be enabled.'); }
    }
  }

  const reply = (type: FeedKind, id: string, body: string, imageUrls: string[] = []) => mutate(type, 'PUT', { id, reply: body, ...(type === 'sketchbook' ? { imageUrl: imageUrls[0] } : { imageUrls }), passcode }).then(() => {});
  const followUp = (type: FeedKind, id: string, body: string, imageUrls: string[]) => mutate(type, 'PATCH', { id, body, imageUrls }).then(() => {});
  const edit = (type: FeedKind, id: string, messageId: string, body: string, imageUrls: string[]) => mutate(type, type === 'sketchbook' ? 'PUT' : 'PATCH', { id, messageId, body, ...(type === 'sketchbook' ? { imageUrl: imageUrls[0] } : { imageUrls }), passcode }).then(() => {});

  async function status(id: string, value: string) {
    try {
      await mutate('suggestions', 'PATCH', { id, status: value, passcode });
      sources = { ...sources, suggestions: sources.suggestions.map(post => post.id === id ? { ...post, status: value } : post) };
    } catch {}
  }

  async function share(type: FeedKind, id: string) {
    const url = `${window.location.origin}/${type}/${encodeURIComponent(id)}`;
    try {
      if (navigator.share) await navigator.share({ title: feedConfig[type].label, url });
      else await navigator.clipboard.writeText(url);
      feedbackFor(type, 'share', id, 'Shared');
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) showNotification('Could not share the post.'); }
  }

  async function snap(type: FeedKind, id: string) {
    try {
      const result = await ({ talk: snapTalkCard, draw: snapDrawCard, suggestions: snapSuggestionCard, sketchbook: snapSketchbookCard }[type])(id);
      feedbackFor(type, 'snap', id, result === 'saved' ? 'Saved' : 'Copied');
    } catch { showNotification('Could not capture the post.'); }
  }

  async function like(id: string, event: MouseEvent) {
    event.stopPropagation();
    if (likedList.includes(id) || isPending) return;
    try {
      await mutate('sketchbook', 'PUT', { id, action: 'like' });
      likedList = [...likedList, id];
      try { localStorage.setItem('mikeblocky:liked-drawings', JSON.stringify(likedList)); } catch {}
    } catch {}
  }

  async function remove(id: string, event: MouseEvent) {
    event.stopPropagation();
    if (!confirm('Delete this drawing?')) return;
    pending += 1;
    try {
      const response = await fetch(`/api/sketchbook?id=${encodeURIComponent(id)}&passcode=${encodeURIComponent(passcode)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not delete drawing.');
      sources = { ...sources, sketchbook: sources.sketchbook.filter(post => post.id !== id) };
    } catch (error) { showNotification(error instanceof Error ? error.message : 'Could not delete drawing.'); }
    finally { pending -= 1; }
  }

  function download(imageUrl: string, id: string, event: MouseEvent) {
    event.stopPropagation();
    const link = document.createElement('a'); link.href = imageUrl; link.download = `sketchbook-${id}.png`; link.click();
  }
</script>


<section class="interact-timeline" aria-label="Community feed">
  <InteractComposer bind:kind onSubmit={submit} isPending={isPending || refreshing}
    isCooldownActive={remaining > 0} {cooldownLabel} {pushSupported} bind:wantNotification {showNotification} />
  {#if notification}
    <div class="interact-notice" role="status"><span>{notification}</span><button type="button" aria-label="Dismiss notification" on:click={() => notification = ''}><X size={16} /></button></div>
  {/if}
  <div class="interact-feed-toolbar">
    <label class="interact-search"><Search size={16} aria-hidden="true" /><input type="search" aria-label="Search posts" placeholder="Search posts" bind:value={search} on:input={() => visibleCount = 12} /></label>
    <select class="site-native-select" aria-label="Filter posts" bind:value={filter} on:change={() => visibleCount = 12}>
      <option value="all">All posts</option>
      <option value="posts">Posts</option><option value="sketchbook">Drawings</option>
    </select>
    <button type="button" aria-label="Refresh feed" title="Refresh" disabled={refreshing || isPending} on:click={refresh}><RefreshCw size={17} class={refreshing ? 'animate-spin' : ''} /></button>
    <AdminLockToggle showLabel bind:isAdminMode bind:passcode bind:showPasscodeInput accent="blue" />
  </div>
  {#if failedSources.length}<div class="interact-feed-warning" role="status">Could not refresh: {failedSources.join(', ')}. Showing available posts. <button type="button" on:click={refresh} disabled={refreshing}>Retry</button></div>{/if}
  <div class="interact-feed" aria-busy={refreshing}>
    {#each visible as entry (entry.key)}
      {@const type = entry.kind}
      {@const post = entry.post}
      {@const cooling = deadlines[type] > now}
      {@const wait = `${Math.ceil(Math.max(0, deadlines[type] - now) / 1000)}s`}
      <InteractPost {entry} {isAdminMode} {isPending} liked={likedList.includes(post.id)} buttonFeedback={feedback[type]}
        isCooldownActive={cooling} cooldownLabel={wait} {showNotification}
        onShare={(id) => share(type, id)} onSnap={(id) => snap(type, id)} onLike={like} onDelete={remove} onDownload={download}
        onRespond={(id, body, images) => isAdminMode ? reply(type, id, body, images) : followUp(type, id, body, images)}
        onEdit={(id, messageId, body, images) => edit(type, id, messageId, body, images)} onStatus={status} />
    {:else}
      <p class="interact-empty">{refreshing ? 'Loading posts…' : search || filter !== 'all' ? 'No matching posts.' : 'No posts yet.'}</p>
    {/each}
  </div>
  {#if filtered.length > visibleCount}<button type="button" class="interact-load-more" on:click={() => visibleCount += 12}>Show more</button>{/if}
</section>
