<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';
  import { initialTalks } from '@mikeblocky/site-data';
  import BoardShell from './BoardShell.svelte';
  import TalkPostForm from './TalkPostForm.svelte';
  import TalkPostItem from './TalkPostItem.svelte';
  import { isPushSupported, subscribeToPush, registerServiceWorker } from '$lib/push/client';
  import { snapTalkCard } from '$lib/utils/snap';
  import { sortByCreatedAt } from '$lib/boards/board-utils';

  export let singleMode = false;
  export let initialTalksData: any[] = sortByCreatedAt(initialTalks);
  export let isAdminMode = false;
  export let passcode = '';

  let talks = initialTalksData;
  let errorMessage: string | null = null;
  let isLoading = talks.length === 0;
  let isRefreshing = talks.length > 0;
  let isPending = false;

  let currentPage = 1;
  const ITEMS_PER_PAGE = 5;

  let pushSupported = false;
  let wantNotification = true;
  let notification: string | null = null;
  let buttonFeedback: Record<string, string> = {};

  let cooldownLabel = '';
  let isCooldownActive = false;
  let cooldownEnd = 0;
  let cooldownTimer: any;

  function showNotification(msg: string) {
    notification = msg;
    setTimeout(() => {
      if (notification === msg) notification = null;
    }, 4000);
  }

  function clearNotification() {
    notification = null;
  }

  function applyCooldown(cooldown: any) {
    if (!cooldown || !cooldown.active) {
      isCooldownActive = false;
      cooldownLabel = '';
      return;
    }
    cooldownEnd = Date.now() + (cooldown.remaining || 0);
    isCooldownActive = true;
    updateCooldownTimer();
  }

  function updateCooldownTimer() {
    if (cooldownTimer) clearInterval(cooldownTimer);
    cooldownTimer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
      if (remaining <= 0) {
        isCooldownActive = false;
        cooldownLabel = '';
        clearInterval(cooldownTimer);
      } else {
        cooldownLabel = `${remaining}s`;
      }
    }, 1000);
  }

  function showButtonFeedback(key: string, message: string) {
    buttonFeedback = { ...buttonFeedback, [key]: message };
    setTimeout(() => {
      buttonFeedback = { ...buttonFeedback, [key]: '' };
    }, 3000);
  }

  async function loadTalks() {
    if (singleMode) {
      isLoading = false;
      isRefreshing = false;
      return;
    }

    try {
      const response = await fetch('/api/talk');
      if (!response.ok) throw new Error();
      const payload = await response.json();
      if (Array.isArray(payload.questions)) {
        talks = sortByCreatedAt(payload.questions);
        applyCooldown(payload.cooldown);
      }
    } catch (error) {
      console.error(error);
      showNotification('Unable to refresh the archive. Showing cached list.');
    } finally {
      isLoading = false;
      isRefreshing = false;
    }
  }

  onMount(() => {
    pushSupported = isPushSupported();
    registerServiceWorker();
    loadTalks();
    return () => {
      if (cooldownTimer) clearInterval(cooldownTimer);
    };
  });

  // Highlight hash comment on mount/hash change
  $: if (talks.length > 0 && typeof window !== 'undefined' && window.location.hash) {
    const hash = window.location.hash;
    if (hash.startsWith('#talk-')) {
      const id = hash.replace('#talk-', '');
      const index = talks.findIndex(t => t.id === id);
      if (index !== -1) {
        currentPage = Math.ceil((index + 1) / ITEMS_PER_PAGE);
        setTimeout(() => {
          const element = document.getElementById(`talk-${id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-4', 'ring-blue-500/30', 'border-blue-500');
            setTimeout(() => {
              element.classList.remove('ring-4', 'ring-blue-500/30', 'border-blue-500');
            }, 4000);
          }
        }, 600);
      }
    }
  }

  async function handleSubmit(payload: { author: string; body: string; imageUrls: string[] }) {
    isPending = true;
    errorMessage = null;

    try {
      const response = await fetch('/api/talk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: payload.author,
          body: payload.body,
          imageUrls: payload.imageUrls.length > 0 ? payload.imageUrls : undefined
        })
      });

      const result = await response.json();
      applyCooldown(result.cooldown);

      if (!response.ok || !result.question) {
        throw new Error(result.error || 'Something went wrong while posting.');
      }

      talks = [result.question, ...talks];
      currentPage = 1;

      if (wantNotification && pushSupported) {
        const subscribed = await subscribeToPush(result.question.id);
        if (subscribed) {
          talks = talks.map(t => t.id === result.question.id ? { ...t, notifying: true } : t);
          showNotification('Post sent! You will be notified when replied.');
        } else {
          showNotification('Post sent! (Notifications could not be enabled)');
        }
      } else {
        showNotification('Post sent successfully!');
      }
    } catch (error: any) {
      errorMessage = error.message || 'Unable to send your post.';
    } finally {
      isPending = false;
    }
  }

  async function handleReplySubmit(id: string, replyBody: string, replyImageUrls: string[]) {
    isPending = true;
    try {
      const response = await fetch('/api/talk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          reply: replyBody,
          passcode,
          imageUrls: replyImageUrls.length > 0 ? replyImageUrls : undefined
        })
      });

      if (!response.ok) throw new Error();
      const { question } = await response.json();
      talks = talks.map(t => t.id === id ? question : t);
      showNotification('Response posted successfully!');
    } catch (error) {
      showNotification('Could not post reply.');
    } finally {
      isPending = false;
    }
  }

  async function handleFollowUpSubmit(id: string, followUpBody: string, followUpImageUrls: string[]) {
    isPending = true;
    try {
      const response = await fetch('/api/talk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          body: followUpBody,
          imageUrls: followUpImageUrls.length > 0 ? followUpImageUrls : undefined
        })
      });

      const result = await response.json();
      applyCooldown(result.cooldown);

      if (!response.ok || !result.question) {
        throw new Error(result.error || 'Failed to send follow-up');
      }

      talks = talks.map(t => t.id === id ? result.question : t);
      showNotification('Follow-up sent!');
    } catch (error: any) {
      showNotification(error.message || 'Could not send follow-up.');
    } finally {
      isPending = false;
    }
  }

  async function handleEditSubmit(talkId: string, messageId: string, editBody: string, editImageUrls: string[]) {
    isPending = true;
    try {
      const response = await fetch('/api/talk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: talkId,
          messageId,
          body: editBody,
          passcode,
          imageUrls: editImageUrls.length > 0 ? editImageUrls : undefined
        })
      });

      if (!response.ok) throw new Error();
      const { question } = await response.json();
      talks = talks.map(t => t.id === talkId ? question : t);
      showNotification('Message updated!');
    } catch (error) {
      showNotification('Could not update message.');
    } finally {
      isPending = false;
    }
  }

  async function shareAndSnap(id: string) {
    const url = `${window.location.origin}/talk/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Talk board post',
          text: 'Talk board post on mikeblocky.com',
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
      showButtonFeedback(`share-${id}`, '✓ Link copied');
    } catch (e) {
      console.error('Share failed', e);
      showButtonFeedback(`share-${id}`, 'Could not share');
    }
  }

  async function snapAndCopy(id: string) {
    try {
      const result = await snapTalkCard(id);
      if (result === 'snapped') showButtonFeedback(`snap-${id}`, '✓ Snapped');
      if (result === 'saved') showButtonFeedback(`snap-${id}`, '✓ Saved');
    } catch (e) {
      console.error('Snap failed', e);
      showButtonFeedback(`snap-${id}`, 'Could not snap');
    }
  }

  $: totalPages = Math.ceil(talks.length / ITEMS_PER_PAGE);
  $: paginatedTalks = talks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
</script>

<BoardShell
  title={singleMode ? "Post" : "Talk archive"}
  count={talks.length}
  {isRefreshing}
  {isLoading}
  bind:isAdminMode
  bind:passcode
  accent="blue"
  formButtonLabel="write in the guestbook"
  {singleMode}
  {notification}
  {clearNotification}
>
  <svelte:fragment slot="form">
    <TalkPostForm
      onSubmit={handleSubmit}
      {isPending}
      {isCooldownActive}
      {cooldownLabel}
      {pushSupported}
      bind:wantNotification
      {showNotification}
    />
  </svelte:fragment>

  {#if errorMessage}
    <div class="rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800 dark:border-orange-500/50 dark:bg-orange-900/20 dark:text-orange-100 mb-4 text-left">
      {errorMessage}
    </div>
  {/if}

  <div class="space-y-4">
    {#if isLoading && talks.length === 0}
      <div class="py-8 text-center">
        <span class="text-sm text-muted-foreground font-sans">
          Loading history...
        </span>
      </div>
    {:else}
      {#each paginatedTalks as talk (talk.id)}
        <TalkPostItem
          {talk}
          {isAdminMode}
          bind:passcode
          {isPending}
          {buttonFeedback}
          {isCooldownActive}
          {cooldownLabel}
          onShare={shareAndSnap}
          onSnap={snapAndCopy}
          onReplySubmit={handleReplySubmit}
          onFollowUpSubmit={handleFollowUpSubmit}
          onEditSubmit={handleEditSubmit}
          {showNotification}
        />
      {:else}
        <div class="py-8 text-center text-sm text-muted-foreground font-sans">
          No guestbook entries yet.
        </div>
      {/each}
    {/if}
  </div>

  <!-- Pagination Controls -->
  {#if !isLoading && totalPages > 1}
    <div class="mt-8 flex items-center justify-center gap-4 border-t border-border/60 pt-6">
      <button
        on:click={() => (currentPage = Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        class="p-2 rounded-lg text-slate-500 hover:bg-blue-100 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-blue-900/30 transition-colors cursor-pointer border-0 bg-transparent"
        aria-label="Previous page"
      >
        <ChevronLeft size={20} strokeWidth={1.8} />
      </button>
      
      <div class="flex gap-2">
        {#each Array.from({ length: totalPages }) as _, i}
          <button
            on:click={() => (currentPage = i + 1)}
            class="w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer border-0 {currentPage === i + 1 ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-blue-100 dark:text-slate-400 dark:hover:bg-blue-900/30 bg-transparent'}"
          >
            {i + 1}
          </button>
        {/each}
      </div>

      <button
        on:click={() => (currentPage = Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        class="p-2 rounded-lg text-slate-500 hover:bg-blue-100 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-blue-900/30 transition-colors cursor-pointer border-0 bg-transparent"
        aria-label="Next page"
      >
        <ChevronRight size={20} strokeWidth={1.8} />
      </button>
    </div>
  {/if}
</BoardShell>
