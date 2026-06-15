<script lang="ts">
  import { onMount } from 'svelte';
  import BoardShell from './BoardShell.svelte';
  import SketchbookCanvas from './SketchbookCanvas.svelte';
  import SketchbookCard from './SketchbookCard.svelte';

  export let isAdminMode = false;
  export let passcode = '';

  let drawings: any[] = [];
  let isLoading = true;
  let isRefreshing = false;
  let isPending = false;

  let likedList: string[] = [];
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

  async function loadData() {
    try {
      const res = await fetch('/api/sketchbook');
      if (res.ok) {
        const payload = await res.json();
        if (Array.isArray(payload.drawings)) {
          drawings = payload.drawings;
        }
        applyCooldown(payload.cooldown);
      }
    } catch (err) {
      console.error('Failed loading sketchbook drawings', err);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    // Load local storage liked list
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mikeblocky:liked-drawings');
      if (stored) {
        try {
          likedList = JSON.parse(stored);
        } catch (_) {}
      }
    }
    loadData();
    return () => {
      if (cooldownTimer) clearInterval(cooldownTimer);
    };
  });

  $: if (drawings.length > 0 && typeof window !== 'undefined' && window.location.hash) {
    const hash = window.location.hash;
    if (hash.startsWith('#drawing-')) {
      const id = hash.replace('#drawing-', '');
      const element = document.getElementById(`drawing-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-4', 'ring-amber-500/30', 'border-amber-500');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-amber-500/30', 'border-amber-500');
        }, 4000);
      }
    }
  }

  async function handleSubmit(payload: { author: string; body: string; imageUrl: string }) {
    isPending = true;
    try {
      const response = await fetch('/api/sketchbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: payload.author,
          body: payload.body || undefined,
          imageUrl: payload.imageUrl
        })
      });

      const result = await response.json();
      applyCooldown(result.cooldown);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit artwork.');
      }

      drawings = [result.drawing, ...drawings];
      showNotification('Drawing published successfully!');
    } finally {
      isPending = false;
    }
  }

  async function handleLike(id: string, e: MouseEvent) {
    e.stopPropagation();
    if (likedList.includes(id)) return;

    // Update local state instantly (Optimistic UI)
    drawings = drawings.map(d => d.id === id ? { ...d, likes: (d.likes || 0) + 1 } : d);
    likedList = [...likedList, id];
    localStorage.setItem('mikeblocky:liked-drawings', JSON.stringify(likedList));
    showButtonFeedback(`like-${id}`, 'Liked!');

    try {
      await fetch('/api/sketchbook', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'like' })
      });
    } catch (err) {
      console.error('Failed to register like on server', err);
    }
  }

  async function handleReplySubmit(id: string, replyBody: string) {
    isPending = true;
    try {
      const response = await fetch('/api/sketchbook', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          reply: replyBody,
          passcode
        })
      });

      if (!response.ok) throw new Error('Reply failed');

      const result = await response.json();
      drawings = drawings.map(d => d.id === id ? result.drawing : d);
      showNotification('Reply posted successfully!');
    } catch (err) {
      showNotification('Could not post reply.');
    } finally {
      isPending = false;
    }
  }

  async function handleDeleteDrawing(id: string, e: MouseEvent) {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this drawing?')) return;

    try {
      const response = await fetch(`/api/sketchbook?id=${id}&passcode=${encodeURIComponent(passcode)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        drawings = drawings.filter(d => d.id !== id);
        showNotification('Drawing deleted.');
      } else {
        showNotification('Failed to delete drawing.');
      }
    } catch (err) {
      showNotification('Error deleting drawing.');
    }
  }

  async function handleShareDrawing(id: string, e: MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}/sketchbook/${id}`;
    
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'Sketchbook drawing',
          text: 'Collaborative sketchbook drawing on mikeblocky.com',
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
      showButtonFeedback(`share-${id}`, 'Copied!');
      showNotification('Link copied to clipboard!');
    } catch (err) {
      console.error('Share failed', err);
      showButtonFeedback(`share-${id}`, 'Failed');
    }
  }

  async function handleSnapDrawing(id: string, e: MouseEvent) {
    e.stopPropagation();
    const element = document.getElementById(`drawing-${id}`);
    if (!element) return;

    const url = `${window.location.origin}/sketchbook/${id}`;
    const isDark = document.documentElement.classList.contains('dark');

    // Hide action buttons
    const actionsDiv = element.querySelector('.drawing-actions') as HTMLElement;
    if (actionsDiv) actionsDiv.style.visibility = 'hidden';

    const moreOverlays = element.querySelectorAll('.gallery-more-overlay') as NodeListOf<HTMLElement>;
    const zoomOverlays = element.querySelectorAll('.gallery-zoom-overlay') as NodeListOf<HTMLElement>;
    moreOverlays.forEach(el => el.style.display = 'none');
    zoomOverlays.forEach(el => el.style.display = 'none');

    // Add link bar at the bottom
    const linkBar = document.createElement('div');
    linkBar.style.cssText = `flex:0 0 100%;width:100%;box-sizing:border-box;margin-top:12px;padding:10px 24px 16px;border-top:1px solid ${isDark ? '#ffffff15' : '#00000010'};font-size:var(--font-size-2xs);color:${isDark ? '#94a3b8' : '#64748b'};font-family:system-ui,sans-serif;letter-spacing:0.02em;`;
    linkBar.textContent = `Link: ${url}`;
    element.appendChild(linkBar);

    // Set element flex-wrap temporarily so that linkBar sits on its own row below the main card content
    const previousFlexWrap = element.style.flexWrap;
      element.style.flexWrap = 'wrap';
  
      try {
        const { toPng } = await import('html-to-image');
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
        showButtonFeedback(`snap-${id}`, 'Snapped!');
        showNotification('Artwork card copied to clipboard!');
      } catch (_error) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `artwork-${id}.png`;
        a.click();
        showButtonFeedback(`snap-${id}`, 'Saved!');
        showNotification('Artwork card saved as image!');
      }
    } catch (err) {
      console.error('Snap failed', err);
      showButtonFeedback(`snap-${id}`, 'Failed');
    } finally {
      if (actionsDiv) actionsDiv.style.visibility = '';
      moreOverlays.forEach(el => el.style.display = '');
      zoomOverlays.forEach(el => el.style.display = '');
      element.style.flexWrap = previousFlexWrap;
      linkBar.remove();
    }
  }

  function handleDownloadDrawing(imageUrl: string, id: string, e: MouseEvent) {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `mikeblocky-sketchbook-${id}.png`;
    a.click();
  }
</script>

<BoardShell
  title="Artworks"
  count={drawings.length}
  {isRefreshing}
  {isLoading}
  bind:isAdminMode
  bind:passcode
  accent="yellow"
  formButtonLabel="open drawing canvas"
  {notification}
  {clearNotification}
>
  <svelte:fragment slot="form">
    <SketchbookCanvas
      onSubmit={handleSubmit}
      {isPending}
      {isCooldownActive}
      {cooldownLabel}
      {showNotification}
    />
  </svelte:fragment>

  {#if isLoading}
    <div class="py-16 text-center text-sm text-muted-foreground font-sans">
      Loading artworks...
    </div>
  {:else if drawings.length === 0}
    <div class="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl font-sans">
      <span class="text-sm text-muted-foreground font-sans">No drawings found. Be the first to draw on the canvas!</span>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-6">
      {#each drawings as drawing (drawing.id)}
        <SketchbookCard
          {drawing}
          {isAdminMode}
          {likedList}
          {passcode}
          {isPending}
          {buttonFeedback}
          onLike={handleLike}
          onShare={handleShareDrawing}
          onSnap={handleSnapDrawing}
          onDownload={handleDownloadDrawing}
          onReplySubmit={handleReplySubmit}
          onDeleteDrawing={handleDeleteDrawing}
        />
      {/each}
    </div>
  {/if}
</BoardShell>
