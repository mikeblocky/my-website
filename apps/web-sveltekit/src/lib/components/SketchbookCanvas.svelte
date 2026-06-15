<script lang="ts">
  import { onMount } from 'svelte';
  import { Palette, Undo2, Redo2, Eraser, Pencil, Trash2 } from '@lucide/svelte';

  export let onSubmit: (payload: { author: string; body: string; imageUrl: string }) => Promise<void>;
  export let isPending = false;
  export let isCooldownActive = false;
  export let cooldownLabel = '';
  export let showNotification: (msg: string) => void;

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

  // Local text state for the size input
  let sizeInputText = String(brushSize);
  let sizeInputFocused = false;

  $: if (!sizeInputFocused) {
    sizeInputText = String(brushSize);
  }

  // History stack for Undo / Redo
  let historyList: string[] = [];
  let historyIndex = -1;
  let canUndo = false;
  let canRedo = false;

  $: canUndo = historyIndex > 0;
  $: canRedo = historyIndex < historyList.length - 1;

  // Form State
  let author = '';
  let caption = '';

  // Canvas context setups
  let isDrawing = false;
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
    if (!isDrawing) return;
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
    if (isDrawing) {
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
      points = [];
      saveStateToHistory();
    }
  }

  async function handleFormSubmit(event: Event) {
    event.preventDefault();
    if (isCooldownActive) return;

    if (!canvasRef) return;

    const imageUrl = canvasRef.toDataURL('image/png');

    if (historyList.length <= 1) {
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

<form 
  on:submit={handleFormSubmit} 
  class="sketchbook-canvas-form bg-white/40 dark:bg-slate-950/20 rounded-xl border border-slate-200/50 dark:border-slate-850/50 shadow-sm flex flex-col text-left font-sans overflow-hidden pride-focus-within-glow"
>
  <!-- Top Alias input field -->
  <div class="border-b border-slate-100 dark:border-slate-900 px-4 py-3 bg-slate-50/20 dark:bg-slate-950/20 rounded-t-xl">
    <input
      type="text"
      placeholder="Your alias (optional)"
      bind:value={author}
      class="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100 font-sans"
    />
  </div>

  <!-- Caption textarea -->
  <div class="px-4 py-2">
    <textarea
      placeholder="Caption your artwork... (optional)"
      bind:value={caption}
      maxlength={MAX_BODY_LENGTH}
      on:input={(e) => {
        e.currentTarget.style.height = 'auto';
        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
      }}
      rows={1}
      class="w-full bg-transparent py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-600 resize-none overflow-hidden min-h-[82px] font-sans"
    />
  </div>

  <!-- Clean Drawing Area with Canvas and settings -->
  <div class="sketchbook-drawing-stage flex flex-col items-center gap-5 px-4 pb-6 pt-5 border-t border-slate-100 dark:border-slate-900 w-full">
    <div class="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-6 w-full max-w-[900px] mx-auto">
      
      <!-- Left Panel: Brush Tools -->
      <div class="sketchbook-tool-panel w-full max-w-[400px] md:max-w-none md:w-[68px] bg-white/55 dark:bg-slate-950/35 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/60 flex flex-col gap-4 md:gap-5 md:justify-between md:items-center shadow-sm shadow-slate-100/10 dark:shadow-black/10 order-1 md:order-1">
        
        <!-- Tool Switcher -->
        <div class="flex flex-row md:flex-col bg-slate-100/45 dark:bg-slate-950/55 p-1 rounded-lg border border-slate-200/30 dark:border-slate-800/40 w-full gap-1">
          <button
            type="button"
            on:click={() => (isDrawingTool = 'pencil')}
            class="sketchbook-soft-control p-2.5 rounded-md flex items-center justify-center cursor-pointer flex-1 md:w-full border-0 {isDrawingTool === 'pencil' ? 'pride-text bg-white/90 dark:bg-slate-900/80 shadow-sm shadow-black/5 pride-icon-glow scale-[1.01]' : 'text-slate-450 hover:text-slate-700 dark:text-slate-550 dark:hover:text-slate-300 hover:bg-white/45 dark:hover:bg-slate-900/45 bg-transparent'}"
            title="Pencil mode (B)"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            on:click={() => (isDrawingTool = 'eraser')}
            class="sketchbook-soft-control p-2.5 rounded-md flex items-center justify-center cursor-pointer flex-1 md:w-full border-0 {isDrawingTool === 'eraser' ? 'pride-text bg-white/90 dark:bg-slate-900/80 shadow-sm shadow-black/5 pride-icon-glow scale-[1.01]' : 'text-slate-450 hover:text-slate-700 dark:text-slate-550 dark:hover:text-slate-300 hover:bg-white/45 dark:hover:bg-slate-900/45 bg-transparent'}"
            title="Eraser mode (E)"
          >
            <Eraser size={15} />
          </button>
        </div>

        <!-- Undo, Redo, Clear -->
        <div class="flex flex-row md:flex-col bg-slate-100/45 dark:bg-slate-950/55 p-1.5 rounded-lg border border-slate-200/30 dark:border-slate-800/40 items-center justify-between md:justify-center gap-1 w-full">
          <button
            type="button"
            on:click={handleUndo}
            disabled={!canUndo}
            class="sketchbook-soft-control p-2 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-250 hover:bg-white/70 dark:hover:bg-slate-900/70 disabled:opacity-20 disabled:pointer-events-none cursor-pointer flex-1 md:w-full flex items-center justify-center border-0 bg-transparent"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            type="button"
            on:click={handleRedo}
            disabled={!canRedo}
            class="sketchbook-soft-control p-2 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-250 hover:bg-white/70 dark:hover:bg-slate-900/70 disabled:opacity-20 disabled:pointer-events-none cursor-pointer flex-1 md:w-full flex items-center justify-center border-0 bg-transparent"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={14} />
          </button>
          <div class="w-[1px] md:w-4/5 h-4 md:h-[1px] bg-slate-200 dark:bg-slate-800 self-center my-0.5 md:my-1"></div>
          <button
            type="button"
            on:click={initCanvas}
            class="sketchbook-soft-control p-2 rounded-md text-slate-450 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-950/30 cursor-pointer flex-1 md:w-full flex items-center justify-center border-0 bg-transparent"
            title="Clear board"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <!-- Brush Thickness Slider -->
        <div class="flex flex-col items-center gap-2.5 bg-slate-100/45 dark:bg-slate-950/55 p-2 rounded-lg border border-slate-200/30 dark:border-slate-800/40 w-full">
          <input
            type="range"
            min="1"
            max="40"
            value={brushSize}
            on:input={(e) => setBrushSize(parseInt(e.currentTarget.value))}
            class="w-full md:[writing-mode:vertical-lr] md:[direction:rtl] h-1.5 md:h-24 md:w-1.5 accent-[hsl(var(--pride-glow-val))] cursor-pointer bg-slate-200 dark:bg-slate-800 rounded-full my-1"
            title={`Brush size: ${brushSize}px`}
          />
          <div class="w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-200/60 dark:border-slate-800/60 shadow-inner shrink-0 relative overflow-hidden">
            <div
              class="rounded-full transition-all"
              style="width: {Math.max(2, Math.min(brushSize, 20))}px; height: {Math.max(2, Math.min(brushSize, 20))}px; background-color: {isDrawingTool === 'eraser' ? '#cbd5e1' : brushColor};"
            />
          </div>
          <input
            type="text"
            inputmode="numeric"
            min="1"
            max="100"
            bind:value={sizeInputText}
            on:focus={() => {
              sizeInputFocused = true;
              sizeInputText = String(brushSize);
            }}
            on:input={(e) => {
              sizeInputText = e.currentTarget.value.replace(/[^0-9]/g, '');
            }}
            on:blur={() => {
              sizeInputFocused = false;
              const val = parseInt(sizeInputText);
              if (!isNaN(val) && val >= 1) {
                const nextSize = Math.max(1, Math.min(val, 100));
                setBrushSize(nextSize);
                sizeInputText = String(nextSize);
              } else {
                sizeInputText = String(brushSize);
              }
            }}
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            class="w-9 h-6 text-center text-[10px] font-bold bg-white/75 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/70 rounded-md text-slate-700 dark:text-slate-300 focus:outline-none shrink-0 font-mono"
            title="Type custom size (1-100)"
          />
        </div>
      </div>

      <!-- Center Panel: Canvas -->
      <div class="sketchbook-canvas-frame relative w-full max-w-[400px] aspect-square rounded-xl overflow-hidden border-2 border-slate-100 dark:border-slate-900 shadow-sm shadow-black/5 dark:shadow-black/20 order-2 md:order-2 shrink-0">
        <canvas
          bind:this={canvasRef}
          width={600}
          height={600}
          class="absolute inset-0 w-full h-full shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]"
        />
        <canvas
          bind:this={tempCanvasRef}
          width={600}
          height={600}
          on:pointerdown={startDrawing}
          on:pointermove={draw}
          on:pointerup={stopDrawing}
          on:pointercancel={stopDrawing}
          class="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
        />
      </div>

      <!-- Right Panel: Colors -->
      <div class="sketchbook-tool-panel w-full max-w-[400px] md:max-w-none md:w-[68px] bg-white/55 dark:bg-slate-950/35 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/60 flex flex-col shadow-sm shadow-slate-100/10 dark:shadow-black/10 order-3 md:order-3">
        <div class="grid grid-cols-5 md:flex md:flex-col md:justify-between md:items-center md:h-full gap-2.5 md:gap-3 w-full h-full bg-slate-100/45 dark:bg-slate-950/55 px-2 py-3 rounded-lg border border-slate-200/30 dark:border-slate-800/40">
          {#each PRESETS as color}
            <button
              type="button"
              on:click={() => (brushColor = color.hex)}
              class="w-[22px] h-[22px] rounded-full border border-slate-250 dark:border-slate-800 relative transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] scale-100 hover:scale-110 shadow-sm cursor-pointer {brushColor === color.hex ? 'ring-2 ring-[hsl(var(--pride-glow-val))] ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-md shadow-[hsl(var(--pride-glow-val))/0.12]' : ''}"
              style="background-color: {color.hex};"
              title={color.name}
            />
          {/each}
          
          <label
            class="w-[22px] h-[22px] rounded-full border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center relative cursor-pointer hover:scale-110 shadow-sm bg-white dark:bg-slate-900 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] {!PRESETS.some(p => p.hex === brushColor) ? 'ring-2 ring-[hsl(var(--pride-glow-val))] ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-md shadow-[hsl(var(--pride-glow-val))/0.12]' : ''}"
            title="Custom Color"
          >
            <input
              type="color"
              bind:value={brushColor}
              class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Palette size={11} class="text-slate-500 dark:text-slate-400" />
          </label>
        </div>
      </div>

    </div>
  </div>

  <!-- Bottom row -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100 dark:border-slate-900 px-4 py-3.5 bg-slate-50/20 dark:bg-slate-950/20 overflow-hidden rounded-b-xl">
    <span class="text-xs font-semibold text-slate-400 dark:text-slate-500 select-none">
      Draw on the canvas above to submit your artwork!
    </span>

    <div class="flex flex-col w-full sm:w-auto gap-2">
      {#if errorMessage}
        <div class="rounded-lg border border-red-250 bg-red-50/50 dark:border-red-955/20 dark:bg-red-955/20 px-3.5 py-2 text-xs text-red-650 dark:text-red-400 font-medium">
          {errorMessage}
        </div>
      {/if}

      <button
        type="submit"
        disabled={isPending || isCooldownActive}
        class="w-full sm:w-auto pride-button rounded-md h-9 px-4.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
        title={isCooldownActive ? `You can send another artwork in ${cooldownLabel}` : undefined}
      >
        {isCooldownActive ? cooldownLabel : 'Publish artwork'}
      </button>
    </div>
  </div>
</form>
