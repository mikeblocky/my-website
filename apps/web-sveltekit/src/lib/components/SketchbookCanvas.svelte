<script lang="ts">
  import { onMount } from 'svelte';
  import { Palette, Undo2, Redo2, Eraser, Pencil, Trash2 } from '@lucide/svelte';

  export let onSubmit: (payload: { author: string; body: string; imageUrl: string }) => Promise<void>;
  export let isPending = false;
  export let isCooldownActive = false;
  export let cooldownLabel = '';
  export let showNotification: (msg: string) => void;
  export let active = true;
  export let embedded = false;

  export function getDrawingImage(): string | null {
    return canvasRef && historyIndex > 0 ? canvasRef.toDataURL('image/png') : null;
  }

  export function resetDrawing() { initCanvas(); }

  const MAX_BODY_LENGTH = 300;

  const PRESETS = [
    { name: 'Obsidian', hex: '#1e293b' },
    { name: 'Pure Snow', hex: '#f8fafc' },
    { name: 'Crimson', hex: '#ef4444' },
    { name: 'Coral', hex: '#f97316' },
    { name: 'Amber', hex: '#eab308' },
    { name: 'Emerald', hex: '#22c55e' },
    { name: 'Ocean', hex: '#3b82f6' },
    { name: 'Violet', hex: '#8b5cf6' },
    { name: 'Magenta', hex: '#ec4899' },
  ];

  // Refs
  let canvasRef: HTMLCanvasElement;
  let tempCanvasRef: HTMLCanvasElement;

  // Drawing tools state
  let brushColor = '#1e293b';
  let pencilSize = 5;
  let eraserSize = 15;
  let isDrawingTool: 'pencil' | 'eraser' = 'pencil';
  let errorMessage: string | null = null;

  $: brushSize = isDrawingTool === 'eraser' ? eraserSize : pencilSize;

  function setBrushSize(val: number) {
    if (isDrawingTool === 'eraser') {
      eraserSize = val;
    } else {
      pencilSize = val;
    }
  }

  // History stack for Undo / Redo
  let historyList: string[] = [];
  let historyIndex = -1;
  let canUndo = false;
  let canRedo = false;

  $: canUndo = historyIndex > 0;
  $: canRedo = historyIndex < historyList.length - 1;

  // Form State
  export let author = '';
  let caption = '';

  // Canvas context setups
  let isDrawing = false;
  let drawingPointer: number | null = null;
  let lastPos = { x: 0, y: 0 };
  let stabilizedPos = { x: 0, y: 0 };
  let lastRawPos = { x: 0, y: 0 };
  let points: { x: number; y: number }[] = [];

  // Coordinate normalizer for Pointer Events
  function getCoordinates(e: PointerEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  // Clear Canvas and paint background pure white
  function initCanvas() {
    if (!canvasRef) return;
    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.width, canvasRef.height);

    if (tempCanvasRef) {
      const tempCtx = tempCanvasRef.getContext('2d');
      if (tempCtx) {
        tempCtx.clearRect(0, 0, tempCanvasRef.width, tempCanvasRef.height);
      }
    }

    // Save initial state to history
    const dataUrl = canvasRef.toDataURL();
    historyList = [dataUrl];
    historyIndex = 0;
  }

  onMount(() => {
    initCanvas();
  });

  // Save drawing state to history stack
  function saveStateToHistory() {
    if (!canvasRef) return;
    const dataUrl = canvasRef.toDataURL();

    // Clear forward states if we were in the middle of history
    const newHistory = historyList.slice(0, historyIndex + 1);
    newHistory.push(dataUrl);

    // Keep history bounds max 40 items
    if (newHistory.length > 40) {
      newHistory.shift();
    }

    historyList = newHistory;
    historyIndex = newHistory.length - 1;
  }

  // Undo / Redo triggers
  function handleUndo() {
    if (historyIndex > 0) {
      historyIndex--;
      if (!canvasRef) return;
      const ctx = canvasRef.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = historyList[historyIndex];
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  }

  function handleRedo() {
    if (historyIndex < historyList.length - 1) {
      historyIndex++;
      if (!canvasRef) return;
      const ctx = canvasRef.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = historyList[historyIndex];
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  }

  // Global Keyboard Shortcuts for Undo (Ctrl+Z), Redo (Ctrl+Y), Brush (B), and Eraser (E)
  function handleKeyDown(e: KeyboardEvent) {
    if (!active) return;
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return;
    }

    const isUndo = (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z';
    const isRedo = 
      ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') ||
      ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z');

    const isBrush = !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === 'b';
    const isEraser = !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === 'e';

    if (isUndo) {
      e.preventDefault();
      handleUndo();
    } else if (isRedo) {
      e.preventDefault();
      handleRedo();
    } else if (isBrush) {
      e.preventDefault();
      isDrawingTool = 'pencil';
    } else if (isEraser) {
      e.preventDefault();
      isDrawingTool = 'eraser';
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  // Helper to draw a full smooth stroke onto a given 2D context
  function drawStroke(ctx: CanvasRenderingContext2D, pointsList: { x: number; y: number }[]) {
    if (pointsList.length === 0) return;

    ctx.strokeStyle = isDrawingTool === 'eraser' ? '#ffffff' : brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (pointsList.length === 1) {
      ctx.beginPath();
      ctx.arc(pointsList[0].x, pointsList[0].y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = isDrawingTool === 'eraser' ? '#ffffff' : brushColor;
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(pointsList[0].x, pointsList[0].y);

      if (pointsList.length === 2) {
        ctx.lineTo(pointsList[1].x, pointsList[1].y);
      } else {
        // Draw quadratic curves through midpoints for ultimate mathematical smoothness
        let i;
        for (i = 1; i < pointsList.length - 1; i++) {
          const xc = (pointsList[i].x + pointsList[i + 1].x) / 2;
          const yc = (pointsList[i].y + pointsList[i + 1].y) / 2;
          ctx.quadraticCurveTo(pointsList[i].x, pointsList[i].y, xc, yc);
        }
        // Connect beautifully to the final point
        ctx.lineTo(pointsList[pointsList.length - 1].x, pointsList[pointsList.length - 1].y);
      }
      ctx.stroke();
    }
  }

  // Drawing event handlers
  function startDrawing(e: PointerEvent) {
    if (!active || isPending || isDrawing || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drawingPointer = e.pointerId;
    e.preventDefault();
    if (!tempCanvasRef) return;
    
    // Touchscreen compatibility
    try {
      tempCanvasRef.setPointerCapture(e.pointerId);
    } catch (_) {}

    const coords = getCoordinates(e, tempCanvasRef);
    if (!coords) return;

    isDrawing = true;
    lastPos = coords;
    lastRawPos = coords;
    stabilizedPos = coords;
    points = [coords];

    const tempCtx = tempCanvasRef.getContext('2d');
    if (!tempCtx) return;

    // Clear temp canvas and draw starting dot instantly
    tempCtx.clearRect(0, 0, tempCanvasRef.width, tempCanvasRef.height);
    drawStroke(tempCtx, points);
  }

  function draw(e: PointerEvent) {
    if (!isDrawing || e.pointerId !== drawingPointer) return;
    e.preventDefault();

    if (!tempCanvasRef) return;
    const coords = getCoordinates(e, tempCanvasRef);
    if (!coords) return;

    lastRawPos = coords;

    // Smooth stabilize coordinates using lerp (damped tracking)
    const nextStabX = stabilizedPos.x + (coords.x - stabilizedPos.x) * 0.45;
    const nextStabY = stabilizedPos.y + (coords.y - stabilizedPos.y) * 0.45;
    const nextStab = { x: nextStabX, y: nextStabY };
    stabilizedPos = nextStab;

    points.push(nextStab);

    const tempCtx = tempCanvasRef.getContext('2d');
    if (!tempCtx) return;

    // Clear temp canvas and redraw the entire active path in real-time
    tempCtx.clearRect(0, 0, tempCanvasRef.width, tempCanvasRef.height);
    drawStroke(tempCtx, points);

    lastPos = nextStab;
  }

  function stopDrawing(e: PointerEvent) {
    if (isDrawing && e.pointerId === drawingPointer) {
      if (tempCanvasRef && canvasRef) {
        try {
          tempCanvasRef.releasePointerCapture(e.pointerId);
        } catch (_) {}

        const tempCtx = tempCanvasRef.getContext('2d');
        const ctx = canvasRef.getContext('2d');
        if (tempCtx && ctx) {
          // Flush the stabilization
          const raw = lastRawPos;
          let lastStab = stabilizedPos;
          
          let dist = Math.hypot(raw.x - lastStab.x, raw.y - lastStab.y);
          let iterations = 0;
          while (dist > 0.5 && iterations < 15) {
            const nextStabX = lastStab.x + (raw.x - lastStab.x) * 0.45;
            const nextStabY = lastStab.y + (raw.y - lastStab.y) * 0.45;
            lastStab = { x: nextStabX, y: nextStabY };
            points.push(lastStab);
            dist = Math.hypot(raw.x - lastStab.x, raw.y - lastStab.y);
            iterations++;
          }

          tempCtx.clearRect(0, 0, tempCanvasRef.width, tempCanvasRef.height);
          drawStroke(ctx, points);
        }
      }

      isDrawing = false;
      drawingPointer = null;
      points = [];
      saveStateToHistory();
    }
  }

  async function handleFormSubmit(event: Event) {
    event.preventDefault();
    if (isCooldownActive) return;

    if (!canvasRef) return;

    const imageUrl = canvasRef.toDataURL('image/png');

    if (historyIndex <= 0) {
      errorMessage = "Please draw something before submitting!";
      return;
    }

    try {
      errorMessage = null;
      await onSubmit({
        author: author.trim() || 'anonymous',
        body: caption.trim(),
        imageUrl
      });
      caption = '';
      initCanvas();
    } catch (err: any) {
      errorMessage = err.message || 'Something went wrong.';
    }
  }
</script>

<svelte:element this={embedded ? 'div' : 'form'} class="sketchbook-canvas-form" class:embedded on:submit={handleFormSubmit}>
  {#if !embedded}
    <input aria-label="Your name" placeholder="Your name (optional)" bind:value={author} />
    <textarea aria-label="Drawing caption" placeholder="A little caption… (optional)" bind:value={caption} maxlength={MAX_BODY_LENGTH} rows={2}></textarea>
  {/if}
  <div class="drawing-toolbar" role="group" aria-label="Drawing tools">
    <div class="drawing-tools">
      <button type="button" class:selected={isDrawingTool === 'pencil'} aria-label="Pencil" aria-pressed={isDrawingTool === 'pencil'} on:click={() => isDrawingTool = 'pencil'}><Pencil size={18} /></button>
      <button type="button" class:selected={isDrawingTool === 'eraser'} aria-label="Eraser" aria-pressed={isDrawingTool === 'eraser'} on:click={() => isDrawingTool = 'eraser'}><Eraser size={18} /></button>
    </div>
    <div class="drawing-tools">
      <button type="button" aria-label="Undo" disabled={!canUndo || isPending} on:click={handleUndo}><Undo2 size={18} /></button>
      <button type="button" aria-label="Redo" disabled={!canRedo || isPending} on:click={handleRedo}><Redo2 size={18} /></button>
      <button type="button" aria-label="Clear drawing" disabled={!canUndo || isPending} on:click={() => { if (confirm('Clear this drawing?')) { const ctx = canvasRef.getContext('2d'); if (ctx) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 600, 600); saveStateToHistory(); } } }}><Trash2 size={17} /></button>
    </div>
  </div>
  <div class="drawing-paper">
    <canvas bind:this={canvasRef} width={600} height={600} aria-label="Your drawing"></canvas>
    <canvas bind:this={tempCanvasRef} width={600} height={600} aria-label="Drawing surface" on:pointerdown={startDrawing} on:pointermove={draw} on:pointerup={stopDrawing} on:pointercancel={stopDrawing} on:lostpointercapture={stopDrawing}></canvas>
  </div>
  <div class="drawing-settings">
    <label class="drawing-size"><span>{isDrawingTool === 'eraser' ? 'Eraser' : 'Brush'}</span><input aria-label="Brush size" type="range" min="1" max="40" value={brushSize} on:input={(e) => setBrushSize(Number(e.currentTarget.value))} /><output>{brushSize}</output></label>
    <div class="drawing-colors" role="group" aria-label="Ink colors">
      {#each PRESETS as color}
        <button type="button" aria-label={color.name} aria-pressed={brushColor === color.hex} class:selected={brushColor === color.hex} on:click={() => { brushColor = color.hex; isDrawingTool = 'pencil'; }}><span style:background={color.hex}></span></button>
      {/each}
      <label class="custom-color" title="Custom color"><Palette size={18} /><input aria-label="Custom ink color" type="color" bind:value={brushColor} /></label>
    </div>
  </div>
  {#if !embedded}
    {#if errorMessage}<p role="alert">{errorMessage}</p>{/if}
    <button class="drawing-publish" type="submit" disabled={isPending || isCooldownActive}>{isPending ? 'Posting…' : isCooldownActive ? cooldownLabel : 'Post drawing'}</button>
  {/if}
</svelte:element>

<style>
  .sketchbook-canvas-form { width:100%; min-width:0; color:hsl(var(--foreground)); font-family:var(--font-sans); }
  .drawing-toolbar { display:flex; align-items:center; justify-content:space-between; padding:6px; gap:8px; }
  .drawing-tools { display:flex; gap:2px; }
  button { display:grid; place-items:center; width:44px; height:44px; border:0; border-radius:9px; background:transparent; color:hsl(var(--muted-foreground)); cursor:pointer; transition:background 160ms,color 160ms; }
  button.selected { color:hsl(var(--site-blue)); background:hsl(var(--site-blue)/.09); }
  button:hover:not(:disabled) { background:hsl(var(--foreground)/.06); }
  button:disabled { opacity:.3; cursor:default; }
  button:focus-visible, input:focus-visible { outline:2px solid hsl(var(--site-blue)); outline-offset:2px; }
  .drawing-paper { position:relative; width:100%; aspect-ratio:1; background:white; overflow:hidden; border-block:1px solid hsl(var(--border)); }
  canvas { position:absolute; inset:0; width:100%; height:100%; }
  canvas:last-child { touch-action:none; cursor:crosshair; }
  .drawing-settings { padding:10px 6px 6px; }
  .drawing-size { display:flex; align-items:center; gap:12px; padding:0 8px; font-size:var(--font-size-xs); color:hsl(var(--muted-foreground)); }
  .drawing-size input { flex:1; min-width:0; height:44px; accent-color:hsl(var(--site-blue)); }
  output { min-width:2ch; font-variant-numeric:tabular-nums; }
  .drawing-colors { display:grid; grid-template-columns:repeat(10,minmax(0,1fr)); margin-top:4px; }
  .drawing-colors button { width:100%; height:44px; }
  .drawing-colors span { width:20px; height:20px; border-radius:50%; border:1px solid #0002; }
  .drawing-colors button.selected span { outline:2px solid hsl(var(--foreground)); outline-offset:3px; }
  .custom-color { position:relative; display:grid; place-items:center; min-height:44px; cursor:pointer; }
  .custom-color input { position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer; }
  .drawing-publish { width:auto; padding-inline:20px; background:hsl(var(--foreground)); color:hsl(var(--background)); margin-top:12px; }
  .sketchbook-canvas-form > input, textarea { width:100%; border:0; background:transparent; color:inherit; font:inherit; padding:12px; }
  @media(pointer:coarse),(max-width:760px){.drawing-colors{grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;}}
  @media (prefers-reduced-motion:reduce) { button { transition:none; } }
</style>
