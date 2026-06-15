<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';
  import { initialPrompts } from '@mikeblocky/site-data';
  import BoardShell from './BoardShell.svelte';
  import DrawPromptForm from './DrawPromptForm.svelte';
  import DrawPromptItem from './DrawPromptItem.svelte';
  import { snapTalkCard } from '$lib/utils/snap'; // Wait, let's check if snapTalkCard works for draw as well or if there is a snapDrawCard. Actually in Next.js DrawBoard it creates a custom snap element logic. Let's see if we should write a custom snap logic inside Svelte or reuse snap.
  import { sortByCreatedAt } from '$lib/boards/board-utils';
  import { toPng } from 'html-to-image';

  export let singleMode = false;
  export let initialPromptsData: any[] = sortByCreatedAt(initialPrompts);
  export let isAdminMode = false;
  export let passcode = '';

  let prompts = initialPromptsData;
  let errorMessage: string | null = null;
  let isLoading = prompts.length === 0;
  let isRefreshing = prompts.length > 0;
  let isPending = false;

  let currentPage = 1;
  const ITEMS_PER_PAGE = 5;

  let buttonFeedback: Record<string, string> = {};
  let notification: string | null = null;

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

  async function loadPrompts() {
    if (singleMode) {
      isLoading = false;
      isRefreshing = false;
      return;
    }

    try {
      const response = await fetch('/api/draw');
      if (!response.ok) throw new Error();
      const payload = await response.json();
      if (Array.isArray(payload.prompts)) {
        prompts = sortByCreatedAt(payload.prompts);
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
    loadPrompts();
    return () => {
      if (cooldownTimer) clearInterval(cooldownTimer);
    };
  });

  // Highlight hash comment on mount/hash change
  $: if (prompts.length > 0 && typeof window !== 'undefined' && window.location.hash) {
    const hash = window.location.hash;
    if (hash.startsWith('#prompt-')) {
      const id = hash.replace('#prompt-', '');
      const index = prompts.findIndex(p => p.id === id);
      if (index !== -1) {
        currentPage = Math.ceil((index + 1) / ITEMS_PER_PAGE);
        setTimeout(() => {
          const element = document.getElementById(`prompt-${id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-4', 'ring-violet-500/30', 'border-violet-500');
            setTimeout(() => {
              element.classList.remove('ring-4', 'ring-violet-500/30', 'border-violet-500');
            }, 4000);
          }
        }, 600);
      }
    }
  }

  async function handleSubmit(payload: { author: string; body: string; character: string; media: string; imageUrls: string[] }) {
    isPending = true;
    errorMessage = null;

    try {
      const response = await fetch('/api/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: payload.author,
          body: payload.body,
          character: payload.character || undefined,
          media: payload.media || undefined,
          imageUrls: payload.imageUrls.length > 0 ? payload.imageUrls : undefined
        })
      });

      const result = await response.json();
      applyCooldown(result.cooldown);

      if (!response.ok || !result.prompt) {
        throw new Error(result.error || 'Something went wrong while posting.');
      }

      prompts = [result.prompt, ...prompts];
      currentPage = 1;
      showNotification('Prompt suggestion sent successfully!');
    } catch (error: any) {
      errorMessage = error.message || 'Unable to send your prompt.';
    } finally {
      isPending = false;
    }
  }

  async function handleReplySubmit(id: string, replyBody: string, replyImageUrls: string[]) {
    isPending = true;
    try {
      const response = await fetch('/api/draw', {
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
      const { prompt } = await response.json();
      prompts = prompts.map(p => p.id === id ? prompt : p);
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
      const response = await fetch('/api/draw', {
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

      if (!response.ok || !result.prompt) {
        throw new Error(result.error || 'Failed to send follow-up');
      }

      prompts = prompts.map(p => p.id === id ? result.prompt : p);
      showNotification('Follow-up sent!');
    } catch (error: any) {
      showNotification(error.message || 'Could not send follow-up.');
    } finally {
      isPending = false;
    }
  }

  async function handleEditSubmit(promptId: string, messageId: string, editBody: string, editImageUrls: string[]) {
    isPending = true;
    try {
      const response = await fetch('/api/draw', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: promptId,
          messageId,
          body: editBody,
          passcode,
          imageUrls: editImageUrls.length > 0 ? editImageUrls : undefined
        })
      });

      if (!response.ok) throw new Error();
      const { prompt } = await response.json();
      prompts = prompts.map(p => p.id === promptId ? prompt : p);
      showNotification('Message updated!');
    } catch (error) {
      showNotification('Could not update message.');
    } finally {
      isPending = false;
    }
  }

  async function shareAndSnap(id: string) {
    const url = `${window.location.origin}/draw/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Drawing prompt suggestion',
          text: 'Drawing prompt suggestion on mikeblocky.com',
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
    const element = document.getElementById(`prompt-${id}`);
    if (!element) return;

    const url = `${window.location.origin}/draw/${id}`;
    const isDark = document.documentElement.classList.contains('dark');
    const actionsDiv = element.querySelector('.prompt-actions') as HTMLElement;
    if (actionsDiv) actionsDiv.style.visibility = 'hidden';

    const moreOverlays = element.querySelectorAll('.gallery-more-overlay') as NodeListOf<HTMLElement>;
    const zoomOverlays = element.querySelectorAll('.gallery-zoom-overlay') as NodeListOf<HTMLElement>;
    moreOverlays.forEach(el => el.style.display = 'none');
    zoomOverlays.forEach(el => el.style.display = 'none');

    const linkBar = document.createElement('div');
    linkBar.style.cssText = `margin-top:12px;padding-top:10px;border-top:1px solid ${isDark ? '#ffffff15' : '#00000010'};font-size:12px;color:${isDark ? '#94a3b8' : '#64748b'};font-family:system-ui,sans-serif;letter-spacing:0.02em;`;
    linkBar.textContent = `Link: ${url}`;
      element.appendChild(linkBar);
  
      try {
        const dataUrl = await toPng(element, {
        backgroundColor: isDark ? '#110c1c' : '#ffffff',
        style: {
          borderRadius: '16px',
          border: isDark ? '1px solid #4c2f77' : '1px solid #f3e8ff',
          boxShadow: 'none',
          padding: '24px',
          margin: '0',
          display: 'block',
          color: isDark ? '#f5f3ff' : '#1e1b4b'
        }
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showButtonFeedback(`snap-${id}`, '✓ Snapped');
      } catch (err) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `draw-${id}.png`;
        a.click();
        showButtonFeedback(`snap-${id}`, '✓ Saved');
      }
    } catch (e) {
      console.error('Snap failed', e);
      showButtonFeedback(`snap-${id}`, 'Could not snap');
    } finally {
      if (actionsDiv) actionsDiv.style.visibility = '';
      moreOverlays.forEach(el => el.style.display = '');
      zoomOverlays.forEach(el => el.style.display = '');
      linkBar.remove();
    }
  }

  $: totalPages = Math.ceil(prompts.length / ITEMS_PER_PAGE);
  $: paginatedPrompts = prompts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
</script>

<BoardShell
  title={singleMode ? "Drawing prompt" : "Drawing prompts"}
  count={prompts.length}
  {isRefreshing}
  {isLoading}
  bind:isAdminMode
  bind:passcode
  accent="violet"
  formButtonLabel="suggest a drawing prompt"
  {singleMode}
  {notification}
  {clearNotification}
>
  <svelte:fragment slot="form">
    <DrawPromptForm
      onSubmit={handleSubmit}
      {isPending}
      {isCooldownActive}
      {cooldownLabel}
      {showNotification}
    />
  </svelte:fragment>

  {#if errorMessage}
    <div class="rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800 dark:border-orange-500/50 dark:bg-orange-900/20 dark:text-orange-100 mb-4 text-left font-sans">
      {errorMessage}
    </div>
  {/if}

  <div class="space-y-4">
    {#if isLoading && prompts.length === 0}
      <div class="py-8 text-center">
        <span class="text-sm text-muted-foreground font-sans">
          Loading prompts...
        </span>
      </div>
    {:else}
      {#each paginatedPrompts as prompt (prompt.id)}
        <DrawPromptItem
          {prompt}
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
          No drawing prompts yet.
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
        class="p-2 rounded-lg text-slate-500 hover:bg-violet-100 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-violet-900/30 transition-colors cursor-pointer border-0 bg-transparent"
        aria-label="Previous page"
      >
        <ChevronLeft size={20} strokeWidth={1.8} />
      </button>
      
      <div class="flex gap-2">
        {#each Array.from({ length: totalPages }) as _, i}
          <button
            on:click={() => (currentPage = i + 1)}
            class="w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer border-0 {currentPage === i + 1 ? 'bg-violet-500 text-white' : 'text-slate-600 hover:bg-violet-100 dark:text-slate-400 dark:hover:bg-violet-900/30 bg-transparent'}"
          >
            {i + 1}
          </button>
        {/each}
      </div>

      <button
        on:click={() => (currentPage = Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        class="p-2 rounded-lg text-slate-500 hover:bg-violet-100 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-violet-900/30 transition-colors cursor-pointer border-0 bg-transparent"
        aria-label="Next page"
      >
        <ChevronRight size={20} strokeWidth={1.8} />
      </button>
    </div>
  {/if}
</BoardShell>
