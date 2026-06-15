<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  import { ZoomIn, ZoomOut, X } from '@lucide/svelte';
  import { fade, scale } from 'svelte/transition';

  export let imageSrc: string;
  export let defaultAspectRatio: '3:4' | '16:9' | '1:1' | 'original' = '3:4';

  const dispatch = createEventDispatcher<{ close: void; crop: string }>();

  type CropAspectRatio = '3:4' | '16:9' | '1:1' | 'original';

  const ASPECT_RATIO_PRESETS: { key: CropAspectRatio; label: string }[] = [
    { key: '3:4', label: '3:4 cover' },
    { key: '16:9', label: '16:9 screen' },
    { key: '1:1', label: '1:1 square' },
    { key: 'original', label: 'original' },
  ];

  let aspectRatio: CropAspectRatio = defaultAspectRatio;
  let zoom = 1;
  let offsetX = 0;
  let offsetY = 0;
  let imgW = 0;
  let imgH = 0;
  let isLoading = true;
  let containerEl: HTMLDivElement;
  let containerW = 380;
  let containerH = 340;

  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOffsetStartX = 0;
  let dragOffsetStartY = 0;

  function portal(node: HTMLElement) {
    if (!browser) return {};
    document.body.appendChild(node);
    return {
      destroy() {
        node.remove();
      }
    };
  }

  $: arVal = imgW > 0
    ? aspectRatio === 'original' ? imgW / imgH
    : aspectRatio === '3:4' ? 0.75
    : aspectRatio === '16:9' ? 16 / 9
    : 1
    : 1;

  $: frameW = (() => {
    const maxW = containerW - 40;
    const maxH = containerH - 40;
    let fw = maxW;
    let fh = maxW / arVal;
    if (fh > maxH) { fh = maxH; fw = maxH * arVal; }
    return fw;
  })();

  $: frameH = (() => {
    const maxW = containerW - 40;
    const maxH = containerH - 40;
    let fw = maxW;
    let fh = maxW / arVal;
    if (fh > maxH) { fh = maxH; fw = maxH * arVal; }
    return fh;
  })();

  $: frameX = (containerW - frameW) / 2;
  $: frameY = (containerH - frameH) / 2;

  $: baseImgW = imgW > 0 ? imgW * Math.max(frameW / imgW, frameH / imgH) : 0;
  $: baseImgH = imgH > 0 ? imgH * Math.max(frameW / imgW, frameH / imgH) : 0;

  $: maxPanX = Math.max(0, (baseImgW * zoom - frameW) / 2);
  $: maxPanY = Math.max(0, (baseImgH * zoom - frameH) / 2);

  $: {
    offsetX = Math.max(-maxPanX, Math.min(maxPanX, offsetX));
    offsetY = Math.max(-maxPanY, Math.min(maxPanY, offsetY));
  }

  function loadImage() {
    isLoading = true;
    const img = new Image();
    img.onload = () => {
      imgW = img.naturalWidth;
      imgH = img.naturalHeight;
      isLoading = false;
      zoom = 1;
      offsetX = 0;
      offsetY = 0;
    };
    img.src = imageSrc;
  }

  function handleMouseDown(e: MouseEvent) {
    e.preventDefault();
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragOffsetStartX = offsetX;
    dragOffsetStartY = offsetY;
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartY = e.touches[0].clientY;
      dragOffsetStartX = offsetX;
      dragOffsetStartY = offsetY;
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    offsetX = Math.max(-maxPanX, Math.min(maxPanX, dragOffsetStartX + dx));
    offsetY = Math.max(-maxPanY, Math.min(maxPanY, dragOffsetStartY + dy));
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - dragStartX;
    const dy = e.touches[0].clientY - dragStartY;
    offsetX = Math.max(-maxPanX, Math.min(maxPanX, dragOffsetStartX + dx));
    offsetY = Math.max(-maxPanY, Math.min(maxPanY, dragOffsetStartY + dy));
  }

  function handleMouseUp() { isDragging = false; }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const step = 0.05;
    zoom = Math.max(1, Math.min(3, parseFloat((zoom - e.deltaY * step * 0.01).toFixed(2))));
  }

  function handleSave() {
    if (!imgW || !frameW || !frameH) return;
    const canvas = document.createElement('canvas');
    const baseScale = Math.max(frameW / imgW, frameH / imgH);
    const sTotal = baseScale * zoom;
    const wOrig = frameW / sTotal;
    const hOrig = frameH / sTotal;
    const lOrig = imgW / 2 - (frameW / 2 + offsetX) / sTotal;
    const tOrig = imgH / 2 - (frameH / 2 + offsetY) / sTotal;
    const safeL = Math.max(0, Math.min(imgW - 1, lOrig));
    const safeT = Math.max(0, Math.min(imgH - 1, tOrig));
    const safeW = Math.max(1, Math.min(imgW - safeL, wOrig));
    const safeH = Math.max(1, Math.min(imgH - safeT, hOrig));
    const ar = safeW / safeH;
    let tw = ar >= 1 ? 800 : Math.round(800 * ar);
    let th = ar >= 1 ? Math.round(800 / ar) : 800;
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, safeL, safeT, safeW, safeH, 0, 0, tw, th);
      dispatch('crop', canvas.toDataURL('image/jpeg', 0.85));
      dispatch('close');
    };
    img.src = imageSrc;
  }

  let resizeObserver: ResizeObserver;

  onMount(() => {
    loadImage();
    document.body.style.overflow = 'hidden';
    resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        containerW = entries[0].contentRect.width;
        containerH = entries[0].contentRect.height;
      }
    });
    if (containerEl) resizeObserver.observe(containerEl);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
  });

  onDestroy(() => {
    if (browser) {
      document.body.style.overflow = '';
      resizeObserver?.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
  });

  $: if (aspectRatio) { zoom = 1; offsetX = 0; offsetY = 0; }
</script>

<div use:portal class="cropper-overlay" transition:fade={{ duration: 180 }} on:click|self={() => dispatch('close')} role="dialog" aria-modal="true" tabindex="-1">
  <div class="cropper-modal" transition:scale={{ duration: 220, start: 0.95 }}>
    <!-- Header -->
    <div class="cropper-header">
      <span class="cropper-title">crop cover image</span>
      <button type="button" class="cropper-close" on:click={() => dispatch('close')}>
        <X size={16} />
      </button>
    </div>

    <!-- Workspace -->
    <div
      bind:this={containerEl}
      class="cropper-workspace"
      on:mousedown={handleMouseDown}
      on:touchstart={handleTouchStart}
      on:wheel={handleWheel}
      role="img"
      aria-label="Crop area"
    >
      {#if isLoading || !imgW}
        <div class="cropper-loading">
          <div class="cropper-spinner"></div>
          <span>loading cover...</span>
        </div>
      {:else}
        <!-- Image -->
        <img
          src={imageSrc}
          alt="Crop source"
          class="cropper-img"
          style="
            width: {baseImgW}px;
            height: {baseImgH}px;
            transform: translate({offsetX}px, {offsetY}px) scale({zoom});
            left: 50%;
            top: 50%;
            margin-left: {-baseImgW / 2}px;
            margin-top: {-baseImgH / 2}px;
          "
        />
        <!-- Overlays -->
        <div class="cropper-overlay-mask" style="left:0;top:0;width:{containerW}px;height:{frameY}px"></div>
        <div class="cropper-overlay-mask" style="left:0;top:{frameY + frameH}px;width:{containerW}px;bottom:0"></div>
        <div class="cropper-overlay-mask" style="left:0;top:{frameY}px;width:{frameX}px;height:{frameH}px"></div>
        <div class="cropper-overlay-mask" style="left:{frameX + frameW}px;top:{frameY}px;right:0;height:{frameH}px"></div>
        <!-- Crop frame -->
        <div class="cropper-frame" style="left:{frameX}px;top:{frameY}px;width:{frameW}px;height:{frameH}px">
          <div class="cropper-grid">
            {#each Array(9) as _, i}
              <div class="cropper-grid-cell"
                style="border-right: {i % 3 !== 2 ? '1px solid rgba(255,255,255,0.2)' : 'none'};
                       border-bottom: {i < 6 ? '1px solid rgba(255,255,255,0.2)' : 'none'}"
              ></div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Controls -->
    {#if !isLoading && imgW}
      <div class="cropper-controls">
        <!-- Zoom -->
        <div class="cropper-zoom-row">
          <ZoomOut size={14} class="text-slate-400" />
          <input
            type="range" min="1" max="3" step="0.01"
            bind:value={zoom}
            class="cropper-zoom-slider"
          />
          <ZoomIn size={14} class="text-slate-400" />
          <span class="cropper-zoom-label">{Math.round(zoom * 100)}%</span>
        </div>

        <!-- Aspect ratio -->
        <div class="cropper-ar-section">
          <span class="cropper-ar-label">aspect ratio</span>
          <div class="cropper-ar-presets">
            {#each ASPECT_RATIO_PRESETS as preset}
              <button
                type="button"
                class="cropper-ar-btn"
                class:active={aspectRatio === preset.key}
                on:click={() => (aspectRatio = preset.key)}
              >{preset.label}</button>
            {/each}
          </div>
        </div>
      </div>
    {/if}

    <!-- Footer -->
    <div class="cropper-footer">
      <button type="button" class="cropper-btn cropper-btn-outline" on:click={() => dispatch('close')}>cancel</button>
      <button type="button" class="cropper-btn cropper-btn-primary" on:click={handleSave} disabled={isLoading || !imgW}>
        crop & save cover
      </button>
    </div>
  </div>
</div>

<style>
  .cropper-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    overflow-y: auto;
    background: hsl(222 47% 11% / 0.8);
    backdrop-filter: blur(4px);
    padding: 4rem 1rem 2rem;
  }

  .cropper-modal {
    position: relative;
    width: 100%;
    max-width: min(42rem, calc(100vw - 2rem));
    border-radius: 0.75rem;
    border: 1px solid hsl(var(--border) / 0.78);
    background: hsl(0 0% 100% / 0.98);
    padding: 1.125rem;
    box-shadow: 0 14px 48px hsl(222 47% 4% / 0.22);
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    z-index: 10;
  }

  :global(.dark) .cropper-modal {
    border-color: hsl(217 28% 28% / 0.9);
    background: hsl(222 30% 14% / 0.98);
    box-shadow: 0 18px 58px hsl(222 47% 3% / 0.4);
  }

  .cropper-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid hsl(var(--border) / 0.5);
    padding-bottom: 0.75rem;
  }

  .cropper-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: hsl(var(--foreground));
    font-family: var(--font-sans);
    text-transform: lowercase;
  }

  .cropper-close {
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    background: none;
    border: none;
    display: flex;
    align-items: center;
    transition: color 0.15s;
  }
  .cropper-close:hover { color: hsl(var(--foreground)); }

  .cropper-workspace {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      linear-gradient(45deg, hsl(220 12% 88%) 25%, transparent 25%),
      linear-gradient(-45deg, hsl(220 12% 88%) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, hsl(220 12% 88%) 75%),
      linear-gradient(-45deg, transparent 75%, hsl(220 12% 88%) 75%),
      hsl(0 0% 96%);
    background-position: 0 0, 0 10px, 10px -10px, -10px 0;
    background-size: 20px 20px;
    border: 1px solid hsl(var(--border) / 0.65);
    border-radius: 0.5rem;
    height: min(52vh, 430px);
    min-height: 320px;
    width: 100%;
    overflow: hidden;
    cursor: move;
    touch-action: none;
    user-select: none;
  }

  :global(.dark) .cropper-workspace {
    background:
      linear-gradient(45deg, hsl(222 22% 20%) 25%, transparent 25%),
      linear-gradient(-45deg, hsl(222 22% 20%) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, hsl(222 22% 20%) 75%),
      linear-gradient(-45deg, transparent 75%, hsl(222 22% 20%) 75%),
      hsl(222 24% 17%);
    background-position: 0 0, 0 10px, 10px -10px, -10px 0;
    background-size: 20px 20px;
    border-color: hsl(217 28% 30% / 0.85);
  }

  .cropper-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    pointer-events: none;
    font-size: 0.625rem;
    letter-spacing: 0.1em;
    text-transform: lowercase;
    color: hsl(var(--muted-foreground));
    font-family: var(--font-mono);
  }

  .cropper-spinner {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    border: 2px solid hsl(var(--pride-glow-val));
    border-top-color: transparent;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .cropper-img {
    position: absolute;
    pointer-events: none;
    user-select: none;
    max-width: none;
    max-height: none;
    transform-origin: center center;
  }

  .cropper-overlay-mask {
    position: absolute;
    background: hsl(220 16% 8% / 0.46);
    backdrop-filter: blur(0.5px);
    pointer-events: none;
  }

  .cropper-frame {
    position: absolute;
    border: 1px solid white;
    pointer-events: none;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.3);
  }

  .cropper-grid {
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    pointer-events: none;
    opacity: 0.5;
  }

  .cropper-grid-cell { }

  .cropper-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.25rem 0;
  }

  .cropper-zoom-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .cropper-zoom-slider {
    flex: 1;
    height: 4px;
    background: hsl(var(--border));
    border-radius: 9999px;
    appearance: none;
    cursor: pointer;
    accent-color: hsl(var(--pride-glow-val));
  }

  .cropper-zoom-label {
    font-size: 0.5625rem;
    color: hsl(var(--muted-foreground));
    font-family: var(--font-mono);
    width: 2rem;
    text-align: right;
  }

  .cropper-ar-section {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .cropper-ar-label {
    font-size: 0.5625rem;
    text-transform: lowercase;
    letter-spacing: 0.1em;
    color: hsl(var(--muted-foreground));
    font-family: var(--font-mono);
    font-weight: 600;
  }

  .cropper-ar-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
  }

  .cropper-ar-btn {
    padding: 0.25rem 0.625rem;
    border-radius: 0.25rem;
    border: 1px solid hsl(var(--border));
    font-size: 0.625rem;
    letter-spacing: 0.05em;
    font-weight: 600;
    text-transform: lowercase;
    cursor: pointer;
    transition: all 0.15s;
    background: transparent;
    color: hsl(var(--muted-foreground));
    font-family: var(--font-sans);
  }
  .cropper-ar-btn:hover {
    border-color: hsl(var(--foreground) / 0.4);
    color: hsl(var(--foreground));
  }
  .cropper-ar-btn.active {
    color: hsl(var(--pride-glow-val));
    border-color: hsl(var(--pride-glow-val) / 0.45);
    background: hsl(var(--pride-glow-val) / 0.1);
    font-weight: 700;
  }

  .cropper-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    border-top: 1px solid hsl(var(--border) / 0.5);
    padding-top: 0.75rem;
  }

  .cropper-btn {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: lowercase;
    padding: 0 1rem;
    height: 2.25rem;
    border-radius: 9999px;
    cursor: pointer;
    border: 1px solid hsl(var(--border));
    font-family: var(--font-sans);
    transition: all 0.15s;
  }
  .cropper-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .cropper-btn-outline {
    background: transparent;
    color: hsl(var(--foreground));
  }
  .cropper-btn-outline:hover:not(:disabled) { background: hsl(var(--muted) / 0.5); }

  .cropper-btn-primary {
    background: hsl(var(--foreground));
    color: hsl(var(--background));
    border-color: hsl(var(--foreground));
  }
  .cropper-btn-primary:hover:not(:disabled) { opacity: 0.85; }
</style>
