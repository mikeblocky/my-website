<script lang="ts">
  import { onMount } from 'svelte';
  import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from '@lucide/svelte';
  import { fade } from 'svelte/transition';

  export let urls: string[] = [];
  export let theme: 'blue' | 'violet' | 'teal' | 'amber' | 'indigo' | 'sky' = 'violet';

  export let activeIdx: number | null = null;
  export let showThumbnails = true;
  let isLightboxLoading = true;
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let imageRef: HTMLDivElement | undefined = undefined;

  let dragDismissY = 0;
  let dragDismissX = 0;
  let isDraggingDismiss = false;

  function portal(node: HTMLElement) {
    if (typeof document === 'undefined') return {};
    document.body.appendChild(node);
    return {
      destroy() {
        node.remove();
      }
    };
  }

  $: cleanUrls = urls.filter(url => typeof url === 'string' && url.trim().length > 0);
  const linkColors = {
    blue: 'border-blue-500',
    violet: 'border-violet-500',
    teal: 'border-teal-500',
    amber: 'border-amber-500',
    indigo: 'border-indigo-500',
    sky: 'border-sky-500',
  };

  $: linkColor = linkColors[theme];

  function resetZoom() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    dragDismissY = 0;
    dragDismissX = 0;
  }

  function openLightbox(idx: number) {
    isLightboxLoading = true;
    resetZoom();
    activeIdx = idx;
  }

  function closeLightbox() {
    activeIdx = null;
    resetZoom();
  }

  function showPrevious() {
    if (activeIdx === null) return;
    isLightboxLoading = true;
    resetZoom();
    activeIdx = (activeIdx - 1 + cleanUrls.length) % cleanUrls.length;
  }

  function showNext() {
    if (activeIdx === null) return;
    isLightboxLoading = true;
    resetZoom();
    activeIdx = (activeIdx + 1) % cleanUrls.length;
  }

  // Mouse & Touch Dragging
  function handleMouseDown(e: MouseEvent) {
    e.preventDefault();
    if (scale === 1) {
      isDraggingDismiss = true;
      dragStart = { x: e.clientX, y: e.clientY };
      return;
    }
    isDragging = true;
    dragStart = { x: e.clientX - translateX, y: e.clientY - translateY };
  }

  function handleMouseMove(e: MouseEvent) {
    e.preventDefault();
    if (isDraggingDismiss) {
      dragDismissY = e.clientY - dragStart.y;
      dragDismissX = e.clientX - dragStart.x;
      return;
    }
    if (!isDragging || scale === 1) return;
    const nextX = e.clientX - dragStart.x;
    const nextY = e.clientY - dragStart.y;
    const maxTx = (scale - 1) * 350;
    const maxTy = (scale - 1) * 350;
    translateX = Math.max(-maxTx, Math.min(maxTx, nextX));
    translateY = Math.max(-maxTy, Math.min(maxTy, nextY));
  }

  function handleMouseUp() {
    if (isDraggingDismiss) {
      isDraggingDismiss = false;
      const distance = Math.sqrt(dragDismissX * dragDismissX + dragDismissY * dragDismissY);
      if (distance > 80) {
        closeLightbox();
      } else {
        dragDismissY = 0;
        dragDismissX = 0;
      }
      return;
    }
    isDragging = false;
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (scale === 1) {
      isDraggingDismiss = true;
      dragStart = { x: touch.clientX, y: touch.clientY };
      return;
    }
    isDragging = true;
    dragStart = { x: touch.clientX - translateX, y: touch.clientY - translateY };
  }

  // Touch move handler
  function handleTouchMove(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (isDraggingDismiss) {
      dragDismissY = touch.clientY - dragStart.y;
      dragDismissX = touch.clientX - dragStart.x;
      return;
    }
    if (!isDragging || scale === 1) return;
    const nextX = touch.clientX - dragStart.x;
    const nextY = touch.clientY - dragStart.y;
    const maxTx = (scale - 1) * 350;
    const maxTy = (scale - 1) * 350;
    translateX = Math.max(-maxTx, Math.min(maxTx, nextX));
    translateY = Math.max(-maxTy, Math.min(maxTy, nextY));
  }

  function handleTouchEnd() {
    if (isDraggingDismiss) {
      isDraggingDismiss = false;
      const distance = Math.sqrt(dragDismissX * dragDismissX + dragDismissY * dragDismissY);
      if (distance > 70) {
        closeLightbox();
      } else {
        dragDismissY = 0;
        dragDismissX = 0;
      }
      return;
    }
    isDragging = false;
  }

  function handleDoubleClick(e: MouseEvent) {
    e.preventDefault();
    if (scale > 1) {
      resetZoom();
    } else {
      scale = 2.5;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clickX = e.clientX - rect.left - rect.width / 2;
      const clickY = e.clientY - rect.top - rect.height / 2;
      translateX = -clickX * 1.5;
      translateY = -clickY * 1.5;
    }
  }

  function toggleZoomButton() {
    if (scale > 1) {
      resetZoom();
    } else {
      scale = 2.5;
    }
  }

  // Wheel zoom handler
  function handleWheel(e: WheelEvent) {
    if (activeIdx === null) return;
    e.preventDefault();
    const delta = -e.deltaY * 0.005;
    scale = Math.max(1, Math.min(4, scale + delta));
    if (scale === 1) {
      translateX = 0;
      translateY = 0;
    }
  }

  $: if (activeIdx !== null) {
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  } else {
    if (typeof window !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (activeIdx === null) return;

    if (e.key === 'Escape') {
      closeLightbox();
    }

    if (scale > 1) {
      const panStep = 40;
      const maxTx = (scale - 1) * 350;
      const maxTy = (scale - 1) * 350;

      if (e.key === 'ArrowLeft') translateX = Math.min(maxTx, translateX + panStep);
      if (e.key === 'ArrowRight') translateX = Math.max(-maxTx, translateX - panStep);
      if (e.key === 'ArrowUp') translateY = Math.min(maxTy, translateY + panStep);
      if (e.key === 'ArrowDown') translateY = Math.max(-maxTy, translateY - panStep);
      if (e.key === '=' || e.key === '+') scale = Math.min(4, scale + 0.5);
      if (e.key === '-') {
        scale = Math.max(1, scale - 0.5);
        if (scale === 1) {
          translateX = 0;
          translateY = 0;
        }
      }
    } else {
      if (e.key === 'ArrowRight') showNext();
      else if (e.key === 'ArrowLeft') showPrevious();
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

{#if showThumbnails && cleanUrls.length > 0}
  <div class="w-full my-3">
    <!-- Grid System -->
    {#if cleanUrls.length === 1}
      <div 
        on:click={() => openLightbox(0)}
        on:keydown={(e) => e.key === 'Enter' && openLightbox(0)}
        role="button"
        tabindex="0"
        class="group relative cursor-zoom-in overflow-hidden rounded-md transition-all duration-300 flex items-center justify-center shadow-none border-0 w-full"
      >
        <img 
          src={cleanUrls[0]} 
          alt="Attachment" 
          loading="lazy"
          decoding="async"
          class="w-full h-auto max-h-[550px] object-contain rounded-md transition-transform duration-500 group-hover:scale-[1.01]"
        />
        <div class="gallery-zoom-overlay absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5 flex items-center justify-center pointer-events-none">
          <span class="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 shadow-none">
            <ZoomIn size={20} />
          </span>
        </div>
      </div>
    {:else}
      <div class="{cleanUrls.length === 2 ? 'columns-2 gap-3.5' : 'columns-2 sm:columns-3 gap-3'} w-full [column-fill:balance]">
        {#each cleanUrls.slice(0, Math.min(cleanUrls.length, 5)) as url, idx}
          {@const isLastSlot = idx === Math.min(cleanUrls.length, 5) - 1}
          {@const showOverlay = isLastSlot && cleanUrls.length > 5}

          <div 
            on:click={() => openLightbox(idx)}
            on:keydown={(e) => e.key === 'Enter' && openLightbox(idx)}
            role="button"
            tabindex="0"
            class="group relative break-inside-avoid mb-3.5 cursor-zoom-in overflow-hidden rounded-md transition-all duration-300 border-0 shadow-none"
          >
            <img 
              src={url} 
              alt={`Attachment ${idx + 1}`} 
              loading="lazy"
              decoding="async"
              class="w-full h-auto rounded-md transition-transform duration-500 group-hover:scale-[1.02]"
            />
            
            {#if showOverlay}
              <div class="gallery-more-overlay absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[1px] transition-all duration-300 hover:bg-black/45">
                <span class="text-lg font-semibold text-white tracking-wide">
                  +...
                </span>
              </div>
            {:else}
              <div class="gallery-zoom-overlay absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5 flex items-center justify-center pointer-events-none">
                <span class="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 shadow-none">
                  <ZoomIn size={18} />
                </span>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<!-- Lightbox Modal using Svelte portal -->
{#if activeIdx !== null}
  <div
    use:portal
    transition:fade={{ duration: 180 }}
    on:click={closeLightbox}
    on:wheel={handleWheel}
    on:keydown={handleKeyDown}
    class="fixed inset-0 z-50 flex items-center justify-center select-none backdrop-blur-md"
    style="background-color: rgba(10, 10, 10, {Math.max(0.35, 0.94 - Math.sqrt(dragDismissX * dragDismissX + dragDismissY * dragDismissY) / 500)});"
    role="dialog"
    aria-modal="true"
    aria-label="Image viewer"
    tabindex="-1"
  >
    <!-- Close target -->
    <button
      type="button"
      aria-label="Close lightbox backdrop"
      class="absolute inset-0 z-10 bg-transparent border-0 outline-none cursor-default"
      on:click={(e) => { if (scale === 1) { e.stopPropagation(); closeLightbox(); } }}
    />

    <!-- Minimal Close Button in Top Right -->
    <div class="absolute top-6 right-6 z-30">
      <button
        type="button"
        aria-label="Close"
        class="bg-transparent text-white/50 hover:text-white p-2 transition-colors border-0 outline-none cursor-pointer"
        on:click={closeLightbox}
      >
        <X size={22} strokeWidth={1.5} />
      </button>
    </div>

    <!-- Navigation buttons - Subtle and Elegant -->
    {#if scale === 1 && cleanUrls.length > 1}
      <button
        type="button"
        aria-label="Previous image"
        class="absolute top-1/2 left-6 -translate-y-1/2 z-30 text-white/20 hover:text-white/80 p-3 transition-colors border-0 outline-none cursor-pointer hidden sm:block"
        on:click={(e) => { e.stopPropagation(); showPrevious(); }}
      >
        <ChevronLeft size={36} strokeWidth={1} />
      </button>

      <button
        type="button"
        aria-label="Next image"
        class="absolute top-1/2 right-6 -translate-y-1/2 z-30 text-white/20 hover:text-white/80 p-3 transition-colors border-0 outline-none cursor-pointer hidden sm:block"
        on:click={(e) => { e.stopPropagation(); showNext(); }}
      >
        <ChevronRight size={36} strokeWidth={1} />
      </button>
    {/if}

    <!-- Image container -->
    <div class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none overflow-hidden">
      <div
        class="relative flex flex-col items-center justify-center w-full h-full"
      >
        <!-- Flat Lightbox Loader -->
        {#if isLightboxLoading}
          <div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span class="text-xs font-semibold text-white/40 uppercase tracking-widest font-mono animate-pulse">
              loading...
            </span>
          </div>
        {/if}

        <!-- Interactive Zoom/Pan container wrapper -->
        <div
          on:mousedown|stopPropagation={handleMouseDown}
          on:mousemove|stopPropagation={handleMouseMove}
          on:mouseup|stopPropagation={handleMouseUp}
          on:mouseleave|stopPropagation={handleMouseUp}
          on:touchstart|stopPropagation={handleTouchStart}
          on:touchmove|stopPropagation={handleTouchMove}
          on:touchend|stopPropagation={handleTouchEnd}
          on:dblclick|stopPropagation={handleDoubleClick}
          style="transform: scale({scale}) translate({(translateX + dragDismissX) / scale}px, {(translateY + dragDismissY) / scale}px); cursor: {scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'}; transition: {isDragging || isDraggingDismiss ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)'}"
          class="relative max-h-[88dvh] max-w-[92vw] flex items-center justify-center pointer-events-auto select-none"
          role="img"
          aria-label={`Expanded attachment ${activeIdx + 1}`}
        >
          <img
            src={cleanUrls[activeIdx]} 
            alt={`Expanded Attachment ${activeIdx + 1}`} 
            class="max-h-[88dvh] max-w-[92vw] h-auto w-auto object-contain pointer-events-none transition-opacity duration-300 ease-out shadow-none {isLightboxLoading ? 'opacity-0' : 'opacity-100'}"
            on:load={() => (isLightboxLoading = false)}
          />
        </div>
        
        {#if scale === 1 && cleanUrls.length > 1}
          <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-[11px] font-bold tracking-widest font-mono pointer-events-none uppercase">
            {activeIdx + 1} / {cleanUrls.length}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
