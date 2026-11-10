<script lang="ts">
  import { onMount } from 'svelte';
  import { createArtworkScenes, getBackgroundSlots } from '$lib/background-scenes';
  export let artworks: { src: string; label: string; width: number; height: number }[] = [];
  export let paused = false;
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D | null = null;
  let lightCanvas: HTMLCanvasElement;
  let lightContext: CanvasRenderingContext2D | null = null;
  let still: HTMLCanvasElement;
  let stillContext: CanvasRenderingContext2D | null = null;
  let ratio = 1;
  let baseDirty = true;
  let dirtyCells = new Set<number>();
  let pendingPointer: { x: number; y: number; tap: boolean } | null = null;
  const trail = new Map<number, number>();
  let mounted = false;
  let ready = false;
  let alive = true;
  let reduced = false;
  let width = 0, height = 0, columns = 0, rows = 0, block = 22;
  let current: number[] = [];
  let order: number[][] = [];
  let orderPosition = 0;
  function shuffleOrder(previous: number[] = []) {
    order = createArtworkScenes(artworks, previous); orderPosition = 0;
  }
  function rememberWork() {
    try { sessionStorage.setItem('mike:background-last-scene', JSON.stringify(current.map(index => artworks[index].src))); } catch {}
  }
  let wave: { start: number; next: number[] } | null = null;
  let frame = 0;
  let previousCell = -1;
  let previousTrailCell = -1;
  let themeMix = 0;
  let themeTransition: { start: number; from: number; to: number } | null = null;
  const images = new Map<number, HTMLImageElement>();
  const samples = new Map<string, Uint8ClampedArray>();
  const touches = new Map<number, number>();
  const sceneTints = new Map<string, [number, number, number]>();
  const styleCache = new Map<string, string[]>();
  let allCells: number[] = [];
  let preparing = false;
  let lastInteraction = 0;
  let lastAmbientTarget: Element | null = null;
  let ambientSteps: { index: number; time: number }[] = [];
  const duration = 2600;
  const touchDuration = 1150;
  const waveDelay = 16;

  async function prepare(index: number) {
    if (images.has(index)) return true;
    const image = new Image(); image.src = artworks[index].src;
    try { await image.decode(); } catch { return false; }
    if (!alive) return false;
    images.set(index, image); return true;
  }
  async function prepareScene(indices: number[]) {
    const loaded = await Promise.all(indices.map(prepare));
    return loaded.length > 0 && loaded.every(Boolean);
  }
  function colors(indices: number[]) {
    const key = indices.join(',');
    const cached = samples.get(key);
    if (cached) return cached;
    if (!indices.length || indices.some(index => !images.has(index))) return null;
    const sampler = document.createElement('canvas'); sampler.width = columns; sampler.height = rows;
    const brush = sampler.getContext('2d', { willReadFrequently: true });
    if (!brush) return null;
    brush.fillStyle = '#fff'; brush.fillRect(0, 0, columns, rows);
    const slots = getBackgroundSlots(indices.length, columns, rows, width < 600);
    indices.forEach((index, position) => {
      const image = images.get(index)!;
      const slot = slots[position];
      const artwork = artworks[index];
      const overscan = indices.length === 1 && artwork.width > artwork.height ? 1.08 : 1;
      const scale = Math.max(slot.width / image.naturalWidth, slot.height / image.naturalHeight) * overscan;
      const sourceWidth = slot.width / scale, sourceHeight = slot.height / scale;
      // Crop inside each panel, so neighboring works never paint over each other.
      brush.drawImage(image, (image.naturalWidth - sourceWidth) / 2, (image.naturalHeight - sourceHeight) / 2,
        sourceWidth, sourceHeight, slot.x, slot.y, slot.width, slot.height);
    });
    const data = brush.getImageData(0, 0, columns, rows).data;
    let weightSum = 0, redSum = 0, greenSum = 0, blueSum = 0;
    for (let offset = 0; offset < data.length; offset += 4) {
      const weight = 1 - (data[offset] + data[offset + 1] + data[offset + 2]) / 765;
      redSum += data[offset] * weight; greenSum += data[offset + 1] * weight; blueSum += data[offset + 2] * weight; weightSum += weight;
    }
    sceneTints.set(key, weightSum ? [redSum / weightSum, greenSum / weightSum, blueSum / weightSum] : [200, 200, 200]);
    samples.set(key, data); return data;
  }
  function pixelStyles(indices: number[], pixels: Uint8ClampedArray) {
    const key = indices.join(',');
    const cached = styleCache.get(key);
    if (cached) return cached;
    const styles = allCells.map(index => {
      const offset = index * 4;
      const red = pixels[offset], green = pixels[offset + 1], blue = pixels[offset + 2];
      const opacity = pixels[offset + 3] / 255 * .28;
      // Keep original RGB at a softer strength, without recoloring the artwork.
      return opacity === 0 ? '' : `rgba(${red},${green},${blue},${opacity})`;
    });
    styleCache.set(key, styles);
    return styles;
  }
  function queue() { if (!frame && alive) frame = requestAnimationFrame(draw); }
  function resize() {
    if (!mounted || !context) return;
    width = window.innerWidth; height = window.innerHeight;
    block = width < 600 ? 8 : 10;
    columns = Math.ceil(width / block); rows = Math.ceil(height / block);
    allCells = Array.from({ length: columns * rows }, (_, index) => index);
    ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    lightCanvas.width = canvas.width; lightCanvas.height = canvas.height;
    lightContext?.setTransform(ratio, 0, 0, ratio, 0, 0);
    still.width = canvas.width; still.height = canvas.height;
    baseDirty = true; dirtyCells.clear(); trail.clear(); ambientSteps = [];
    samples.clear(); sceneTints.clear(); styleCache.clear(); touches.clear(); previousCell = -1; previousTrailCell = -1; queue();
  }
  function draw(now: number) {
    frame = 0;
    if (!context) return;
    const from = colors(current);
    if (!from) return;
    const to = wave ? colors(wave.next) : null;
    const cw = width / columns, ch = height / rows;
    let moving = false;
    if (paused || reduced || document.hidden) ambientSteps = [];
    while (ambientSteps.length && ambientSteps[0].time <= now) {
      const step = ambientSteps.shift()!;
      trail.set(step.index, step.time);
    }
    if (ambientSteps.length) moving = true;
    if (pendingPointer) {
      const point = pendingPointer; pendingPointer = null;
      const x = Math.min(columns - 1, Math.max(0, Math.floor(point.x / width * columns)));
      const y = Math.min(rows - 1, Math.max(0, Math.floor(point.y / height * rows)));
      const center = y * columns + x;
      // Illuminate grid cells along the path, rather than following the cursor
      // with an independent glow. Interpolation keeps fast movements connected.
      const previousX = previousTrailCell < 0 ? x : previousTrailCell % columns;
      const previousY = previousTrailCell < 0 ? y : Math.floor(previousTrailCell / columns);
      const steps = Math.min(16, Math.max(1, Math.abs(x - previousX), Math.abs(y - previousY)));
      for (let step = 1; step <= steps; step++) {
        const tx = Math.round(previousX + (x - previousX) * step / steps);
        const ty = Math.round(previousY + (y - previousY) * step / steps);
        trail.set(ty * columns + tx, now);
      }
      previousTrailCell = center;
      while (trail.size > 60) trail.delete(trail.keys().next().value!);
      if (!wave && (center !== previousCell || point.tap)) {
        previousCell = center;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (x + dx < 0 || x + dx >= columns || y + dy < 0 || y + dy >= rows) continue;
          const index = (y + dy) * columns + x + dx;
          if (!touches.has(index) && touches.size < 48) {
            const start = now + (Math.abs(dx) + Math.abs(dy)) * 35;
            touches.set(index, start); trail.set(index, start);
          }
        }
      }
    }
    if (themeTransition) {
      const progress = Math.min(1, (now - themeTransition.start) / 600);
      const eased = progress * progress * (3 - 2 * progress);
      themeMix = themeTransition.from + (themeTransition.to - themeTransition.from) * eased;
      if (progress === 1) themeTransition = null; else moving = true;
    }
    const fromStyles = pixelStyles(current, from);
    const toStyles = wave && to ? pixelStyles(wave.next, to) : null;
    const maxDelay = (columns + rows) * waveDelay;
    // Cache the resting frame. Pointer motion only redraws changed cells.
    const fullFrame = !!wave || baseDirty;
    if (fullFrame) { context.clearRect(0, 0, width, height); dirtyCells.clear(); }
    else {
      for (const index of dirtyCells) {
        const x = Math.max(0, index % columns * cw - 6), y = Math.max(0, Math.floor(index / columns) * ch - 6);
        const w = Math.min(width - x, cw + 12), h = Math.min(height - y, ch + 12);
        context.clearRect(x, y, w, h);
        context.drawImage(still, x * ratio, y * ratio, w * ratio, h * ratio, x, y, w, h);
      }
      dirtyCells.clear();
    }
    const paint = fullFrame ? allCells : [...touches.keys()];
    if (!fullFrame) {
      for (const index of paint) context.clearRect(index % columns * cw, Math.floor(index / columns) * ch, cw, ch);
    }
    for (const index of paint) {
      const x = index % columns, y = Math.floor(index / columns);
      let flip = 0, separation = 0, lift = 0;
      let style = fromStyles[index];
      if (wave && to) {
        const progress = Math.max(0, Math.min(1, (now - wave.start - (x + y) * waveDelay) / duration));
        // Each square turns around its own vertical center. No translation.
        const eased = progress * progress * (3 - 2 * progress);
        flip = Math.PI * eased; separation = Math.sin(Math.PI * progress);
        if (progress > .5 && toStyles) style = toStyles[index];
        moving = true;
      } else if (!fullFrame && touches.has(index)) {
        const progress = (now - touches.get(index)!) / touchDuration;
        if (progress >= 1) touches.delete(index);
        else if (progress >= 0) {
          const eased = progress * progress * (3 - 2 * progress);
          separation = Math.sin(Math.PI * progress);
          lift = Math.sin(Math.PI * eased) * (index % 2 ? -3.5 : 3.5);
          moving = true; dirtyCells.add(index);
        } else { moving = true; dirtyCells.add(index); }
      }
      if (!style) continue;
      const gap = .45 + separation * 1.8;
      const face = Math.abs(Math.cos(flip));
      const tileWidth = Math.max(.25, (cw - gap) * face);
      const tileHeight = Math.max(1, ch - gap);
      context.fillStyle = style;
      context.fillRect(x * cw + (cw - tileWidth) / 2, y * ch + (ch - tileHeight) / 2 + lift, tileWidth, tileHeight);
    }
    if (fullFrame && !wave) {
      stillContext?.clearRect(0, 0, still.width, still.height);
      stillContext?.drawImage(canvas, 0, 0);
      baseDirty = false;
    }
    if (wave && now - wave.start > duration + maxDelay) {
      current = wave.next; wave = null; moving = true; baseDirty = true; rememberWork();
      // Decoded memory stays bounded; previously fetched files remain in HTTP cache.
      for (const index of images.keys()) if (!current.includes(index)) images.delete(index);
      for (const index of samples.keys()) if (index !== current.join(',')) { samples.delete(index); sceneTints.delete(index); }
      for (const key of styleCache.keys()) if (key !== current.join(',')) styleCache.delete(key);
    }
    if (lightContext) {
      lightContext.clearRect(0, 0, width, height);
      lightContext.globalCompositeOperation = 'source-over';
      for (const [index, time] of trail) {
        const progress = Math.max(0, (now - time) / 1900);
        if (progress >= 1) { trail.delete(index); continue; }
        const strength = (1 - progress) ** 2;
        const x = index % columns * cw, y = Math.floor(index / columns) * ch;
        // Follow the currently visible artwork face, including during a scene change.
        const column = index % columns, row = Math.floor(index / columns);
        const nextFace = wave && to && (now - wave.start - (column + row) * waveDelay) / duration > .5;
        const pixels = nextFace ? to! : from;
        const key = nextFace ? wave!.next.join(',') : current.join(',');
        const offset = index * 4;
        let red = pixels[offset], green = pixels[offset + 1], blue = pixels[offset + 2];
        const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
        // Paper/neutral areas borrow the scene's own ink colors, not a fixed hue.
        if (chroma < 18) [red, green, blue] = sceneTints.get(key) ?? [red, green, blue];
        const brightest = Math.max(red, green, blue);
        const gain = brightest > 0 ? (190 + themeMix * 45) / brightest : 1;
        const white = .12 + themeMix * .12;
        red = Math.min(255, red * gain) * (1 - white) + 255 * white;
        green = Math.min(255, green * gain) * (1 - white) + 255 * white;
        blue = Math.min(255, blue * gain) * (1 - white) + 255 * white;
        // A flat luminous face, with no shadow or separate cursor shape.
        lightContext.fillStyle = `rgba(${red},${green},${blue},${strength * (.52 + themeMix * .34)})`;
        lightContext.fillRect(x + .6, y + .6, Math.max(1, cw - 1.2), Math.max(1, ch - 1.2));
      }
      if (trail.size) moving = true;
    }
    if (moving) queue();
  }
  function touchPixel(event: PointerEvent) {
    if (!mounted || paused || reduced || !columns || document.hidden) return;
    lastInteraction = performance.now(); ambientSteps = [];
    if (event.target instanceof Element && event.target.closest('a, button, input, select, textarea, [role="button"]')) return;
    // Coalesce high-frequency input into one update per animation frame.
    pendingPointer = { x: event.clientX, y: event.clientY, tap: event.type === 'pointerdown' };
    queue();
  }
  function ambientGlow() {
    if (!mounted || paused || reduced || document.hidden || wave || ambientSteps.length || performance.now() - lastInteraction < 1800) return;
    const targets = [...document.querySelectorAll<HTMLElement>('[data-pixel-glow]')]
      .filter(element => {
        const rect = element.getBoundingClientRect();
        return element !== lastAmbientTarget && rect.width > 0 && rect.top >= 0 && rect.bottom <= height && rect.right > 0 && rect.left < width;
      });
    const target = targets[Math.floor(Math.random() * targets.length)];
    if (!target) return;
    lastAmbientTarget = target;
    const rect = target.getBoundingClientRect();
    const left = Math.max(0, Math.floor((rect.left - 6) / width * columns));
    const right = Math.min(columns - 1, Math.ceil((rect.right + 6) / width * columns));
    const top = Math.max(0, Math.floor((rect.top - 6) / height * rows));
    const bottom = Math.min(rows - 1, Math.ceil((rect.bottom + 6) / height * rows));
    const path: number[] = [];
    for (let x = left; x <= right; x++) path.push(top * columns + x);
    for (let y = top + 1; y <= bottom; y++) path.push(y * columns + right);
    for (let x = right - 1; x >= left; x--) path.push(bottom * columns + x);
    for (let y = bottom - 1; y > top; y--) path.push(y * columns + left);
    if (Math.random() > .5) path.reverse();
    const startAt = Math.floor(Math.random() * path.length);
    const route = [...path.slice(startAt), ...path.slice(0, startAt)].slice(0, 64);
    const now = performance.now();
    ambientSteps = route.map((index, step) => ({ index, time: now + step * 75 }));
    queue();
  }
  onMount(() => {
    // Randomize in the browser, keeping the prerendered page hydration stable.
    let previous: number[] = [];
    try {
      const last: string[] = JSON.parse(sessionStorage.getItem('mike:background-last-scene') || '[]');
      previous = artworks.flatMap((artwork, index) => last.includes(artwork.src) ? [index] : []);
    } catch {}
    shuffleOrder(previous); current = order[0] ?? [];
    mounted = true; context = canvas.getContext('2d');
    lightContext = lightCanvas.getContext('2d');
    still = document.createElement('canvas'); stillContext = still.getContext('2d');
    resize();
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => {
      reduced = media.matches;
      if (reduced) { touches.clear(); trail.clear(); pendingPointer = null; wave = null; baseDirty = true; }
      queue();
    };
    themeMix = document.documentElement.classList.contains('dark') ? 1 : 0;
    const observer = new MutationObserver(() => {
      const target = document.documentElement.classList.contains('dark') ? 1 : 0;
      if (target === (themeTransition?.to ?? themeMix)) return;
      if (reduced) { themeMix = target; themeTransition = null; }
      else themeTransition = { start: performance.now(), from: themeMix, to: target };
      queue();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    preference(); media.addEventListener('change', preference);
    if (artworks.length) void prepareScene(current).then(loaded => { if (alive && loaded) { ready = true; rememberWork(); queue(); } });
    const advance = async () => {
      if (!artworks.length || order.length < 2 || paused || reduced || document.hidden || wave || preparing) return;
      preparing = true;
      orderPosition += 1;
      if (orderPosition >= order.length) shuffleOrder(current);
      const next = order[orderPosition];
      const loaded = await prepareScene(next); preparing = false;
      if (!alive || !loaded || paused || reduced || document.hidden) return;
      touches.clear(); wave = { start: performance.now(), next }; queue();
    };
    const interval = setInterval(advance, 45000);
    let ambientTimer: ReturnType<typeof setTimeout>;
    const wander = () => {
      ambientGlow();
      ambientTimer = setTimeout(wander, 6500 + Math.random() * 4500);
    };
    ambientTimer = setTimeout(wander, 2400 + Math.random() * 1500);
    return () => {
      alive = false; mounted = false; cancelAnimationFrame(frame);
      clearInterval(interval); clearTimeout(ambientTimer); ambientSteps = []; touches.clear(); trail.clear();
      observer.disconnect(); media.removeEventListener('change', preference);
    };
  });
</script>

<svelte:window on:resize={resize} on:pointermove={touchPixel} on:pointerdown={touchPixel} />
<canvas bind:this={canvas} class="home-pixel-background" data-artwork={current.map(index => artworks[index].src).join(",")} data-layout={current.length > 1 ? "portrait-group" : "landscape"} data-artwork-count={current.length} data-ready={ready} aria-hidden="true"></canvas>
<canvas bind:this={lightCanvas} class="home-pixel-background home-pixel-light" aria-hidden="true"></canvas>

<style>
  .home-pixel-background { position: fixed; inset: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; transition: opacity 600ms ease; }
  :global(html:not(.dark)) canvas.home-pixel-background:not(.home-pixel-light) { opacity: .48; }
  @media (prefers-reduced-motion: reduce) { .home-pixel-background { transition: none; } }
</style>
