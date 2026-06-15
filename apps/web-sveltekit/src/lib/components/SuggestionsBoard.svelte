<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';
  import { initialSuggestions } from '@mikeblocky/site-data';
  import BoardShell from './BoardShell.svelte';
  import SuggestionCard from './SuggestionCard.svelte';
  import SuggestionForm from './SuggestionForm.svelte';
  import { sortByCreatedAt } from '$lib/boards/board-utils';
  import { toPng } from 'html-to-image';

  export let initialItems: any[] = sortByCreatedAt(initialSuggestions);
  export let isAdminMode = false;
  export let passcode = '';

  let suggestions = initialItems;
  let currentPage = 1;
  const ITEMS_PER_PAGE = 8;
  let isLoading = suggestions.length === 0;
  let isRefreshing = suggestions.length > 0;
  let isPending = false;
  let errorMessage: string | null = null;
  let notification: string | null = null;

  let cooldownLabel = '';
  let isCooldownActive = false;
  let cooldownEnd = 0;
  let cooldownTimer: any;

  let activeStatusDropdown: string | null = null;
  let buttonFeedback: Record<string, string> = {};

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

  function handleDropdownClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (activeStatusDropdown && !target.closest('.status-dropdown-container')) {
      activeStatusDropdown = null;
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      const response = await fetch('/api/suggestions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, passcode })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Could not update status.');
      }

      suggestions = suggestions.map(s => s.id === id ? { ...s, status: newStatus } : s);
      showNotification(`Status updated to: ${newStatus}`);
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Could not update status.');
    } finally {
      activeStatusDropdown = null;
    }
  }

  async function loadSuggestions() {
    try {
      const response = await fetch('/api/suggestions');
      if (!response.ok) throw new Error();
      const payload = await response.json();
      if (Array.isArray(payload.suggestions)) {
        suggestions = sortByCreatedAt(payload.suggestions);
        applyCooldown(payload.cooldown);
      }
    } catch (error) {
      console.error('Unable to load suggestions', error);
      showNotification('Unable to refresh suggestions. Showing the cached list.');
    } finally {
      isLoading = false;
      isRefreshing = false;
    }
  }

  onMount(() => {
    loadSuggestions();
    window.addEventListener('click', handleDropdownClick);
    return () => {
      window.removeEventListener('click', handleDropdownClick);
      if (cooldownTimer) clearInterval(cooldownTimer);
    };
  });

  $: if (suggestions.length > 0 && typeof window !== 'undefined' && window.location.hash) {
    const hash = window.location.hash;
    if (hash.startsWith('#suggestion-')) {
      const id = hash.replace('#suggestion-', '');
      const index = suggestions.findIndex(s => s.id === id);
      if (index !== -1) {
        currentPage = Math.ceil((index + 1) / ITEMS_PER_PAGE);
        setTimeout(() => {
          const element = document.getElementById(`suggestion-${id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-4', 'ring-teal-500/30', 'border-teal-500');
            setTimeout(() => {
              element.classList.remove('ring-4', 'ring-teal-500/30', 'border-teal-500');
            }, 4000);
          }
        }, 600);
      }
    }
  }

  async function handleSubmit(payload: {
    title: string;
    category: any;
    reference?: any;
    author: string;
    bestPart: string;
    note: string;
    imageUrls: string[];
  }) {
    isPending = true;
    errorMessage = null;

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: payload.title,
          category: payload.category,
          note: payload.note || undefined,
          bestPart: payload.bestPart || undefined,
          reference: payload.reference,
          imageUrls: payload.imageUrls.length > 0 ? payload.imageUrls : undefined
        })
      });

      const result = await response.json();
      applyCooldown(result.cooldown);

      if (!response.ok || !result.suggestion) {
        throw new Error(result.error || 'Something went wrong while sending your suggestion.');
      }

      suggestions = [result.suggestion, ...suggestions];
      currentPage = 1;
      showNotification('Suggestion sent successfully!');
    } catch (error: any) {
      errorMessage = error.message || 'Unable to send your suggestion.';
    } finally {
      isPending = false;
    }
  }

  async function shareAndSnap(id: string) {
    const url = `${window.location.origin}/suggestions/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Media Suggestion',
          text: 'Media suggestion on mikeblocky.com',
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
    const element = document.getElementById(`suggestion-${id}`);
    if (!element) return;

    const url = `${window.location.origin}/suggestions/${id}`;
    const isDark = document.documentElement.classList.contains('dark');
    const actionsDiv = element.querySelector('.suggestion-actions') as HTMLElement;
    const previousFlexWrap = element.style.flexWrap;

    if (actionsDiv) actionsDiv.style.visibility = 'hidden';
    element.style.flexWrap = 'wrap';

    const moreOverlays = element.querySelectorAll('.gallery-more-overlay') as NodeListOf<HTMLElement>;
    const zoomOverlays = element.querySelectorAll('.gallery-zoom-overlay') as NodeListOf<HTMLElement>;
    moreOverlays.forEach(el => el.style.display = 'none');
    zoomOverlays.forEach(el => el.style.display = 'none');

    const linkBar = document.createElement('div');
    linkBar.style.cssText = `flex:0 0 100%;width:100%;box-sizing:border-box;margin-top:12px;padding:10px 24px 16px;border-top:1px solid ${isDark ? '#ffffff15' : '#00000010'};font-size:12px;color:${isDark ? '#94a3b8' : '#64748b'};font-family:system-ui,sans-serif;letter-spacing:0.02em;`;
    linkBar.textContent = `Link: ${url}`;
      element.appendChild(linkBar);
  
      try {
        const dataUrl = await toPng(element, {
        backgroundColor: isDark ? '#1a1525' : '#ffffff',
        style: {
          borderRadius: '16px',
          border: isDark ? '1px solid #3b2d5a' : '1px solid #e2e8f0',
          boxShadow: 'none',
          margin: '0',
          color: isDark ? '#f1f5f9' : '#0f172a'
        }
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showButtonFeedback(`snap-${id}`, '✓ Snapped');
      } catch (_error) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `suggestion-${id}.png`;
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
      element.style.flexWrap = previousFlexWrap;
      linkBar.remove();
    }
  }

  async function handleReplySubmit(id: string, replyBody: string, replyImageUrls: string[]) {
    isPending = true;
    try {
      const response = await fetch('/api/suggestions', {
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
      const { suggestion } = await response.json();
      suggestions = suggestions.map(s => s.id === id ? suggestion : s);
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
      const response = await fetch('/api/suggestions', {
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

      if (!response.ok || !result.suggestion) {
        throw new Error(result.error || 'Failed to send follow-up');
      }

      suggestions = suggestions.map(s => s.id === id ? result.suggestion : s);
      showNotification('Follow-up sent!');
    } catch (error: any) {
      showNotification(error.message || 'Could not send follow-up.');
    } finally {
      isPending = false;
    }
  }

  async function handleEditSubmit(suggestionId: string, messageId: string, editBody: string, editImageUrls: string[]) {
    isPending = true;
    try {
      const response = await fetch('/api/suggestions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: suggestionId,
          messageId,
          body: editBody,
          passcode,
          imageUrls: editImageUrls.length > 0 ? editImageUrls : undefined
        })
      });

      if (!response.ok) throw new Error();
      const { suggestion } = await response.json();
      suggestions = suggestions.map(s => s.id === suggestionId ? suggestion : s);
      showNotification('Message updated!');
    } catch (error) {
      showNotification('Could not update message.');
    } finally {
      isPending = false;
    }
  }

  $: totalPages = Math.ceil(suggestions.length / ITEMS_PER_PAGE);
  $: paginatedSuggestions = suggestions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
</script>

<BoardShell
  title="Suggestion archive"
  count={suggestions.length}
  {isRefreshing}
  {isLoading}
  bind:isAdminMode
  bind:passcode
  accent="teal"
  formButtonLabel="suggest a book, manga, anime, film..."
  {notification}
  {clearNotification}
>
  <svelte:fragment slot="form">
    <SuggestionForm
      onSubmit={handleSubmit}
      {isPending}
      {isCooldownActive}
      {cooldownLabel}
      {showNotification}
    />
  </svelte:fragment>

  {#if errorMessage}
    <div class="rounded-lg border border-orange-355 bg-orange-50 px-3 py-2 text-sm text-orange-800 dark:border-orange-500/50 dark:bg-orange-955/20 dark:text-orange-100 mb-4 text-left font-sans">
      {errorMessage}
    </div>
  {/if}

  <div class="grid gap-4">
    {#if isLoading && suggestions.length === 0}
      <div class="py-8 text-center">
        <span class="text-sm text-muted-foreground font-sans">
          Loading suggestions...
        </span>
      </div>
    {:else}
      {#each paginatedSuggestions as suggestion (suggestion.id)}
        <SuggestionCard
          {suggestion}
          {isAdminMode}
          bind:activeStatusDropdown
          setActiveStatusDropdown={(val) => (activeStatusDropdown = val)}
          onStatusChange={handleStatusChange}
          bind:passcode
          {isPending}
          {buttonFeedback}
          onShare={shareAndSnap}
          onSnap={snapAndCopy}
          onReplySubmit={handleReplySubmit}
          onFollowUpSubmit={handleFollowUpSubmit}
          onEditSubmit={handleEditSubmit}
          {isCooldownActive}
          {cooldownLabel}
          {showNotification}
        />
      {:else}
        <div class="py-8 text-center text-sm text-muted-foreground font-sans">
          No suggestions yet.
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
        class="p-2 rounded-lg text-slate-500 hover:bg-teal-100 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-teal-900/30 transition-colors cursor-pointer border-0 bg-transparent"
        aria-label="Previous page"
      >
        <ChevronLeft size={20} strokeWidth={1.8} />
      </button>
      
      <span class="text-xs text-muted-foreground font-mono">
        {currentPage} / {totalPages}
      </span>

      <button
        on:click={() => (currentPage = Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        class="p-2 rounded-lg text-slate-500 hover:bg-teal-100 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-teal-900/30 transition-colors cursor-pointer border-0 bg-transparent"
        aria-label="Next page"
      >
        <ChevronRight size={20} strokeWidth={1.8} />
      </button>
    </div>
  {/if}
</BoardShell>
