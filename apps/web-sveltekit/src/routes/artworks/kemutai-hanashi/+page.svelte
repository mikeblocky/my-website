<script lang="ts">
  import { onMount } from 'svelte';
  import { ArrowLeft } from '@lucide/svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import ImageGallery from '$lib/components/ImageGallery.svelte';

  export let data: { items: Array<{ src: string; isPortrait: boolean; width: number; height: number }> };

  let starCanvas: HTMLCanvasElement;
  let waveCanvas: HTMLCanvasElement;
  let lightboxIndex: number | null = null;

  $: allUrls = data.items.map(item => item.src);

  function seededRandom(seed: number) {
    let s = seed;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  // Precompute scatter data for cards
  const scatterRand = seededRandom(42);
  const scatterData = data.items.map(() => ({
    left: 2 + scatterRand() * 72,
    rotation: (scatterRand() - 0.5) * 20,
    width: 150 + scatterRand() * 130,
    zIndex: Math.floor(scatterRand() * 20)
  }));

  // Rough total height for the shore section based on card count
  $: shoreHeight = Math.max(600, data.items.length * 60 + 300);



  onMount(() => {
    // --- Star animation ---
    const starCtx = starCanvas.getContext('2d');
    if (!starCtx) return;

    const rand = seededRandom(77);
    const stars = Array.from({ length: 180 }, () => ({
      x: rand() * starCanvas.offsetWidth,
      y: rand() * starCanvas.offsetHeight * 0.6,
      r: 0.5 + rand() * 1.5,
      alpha: 0.3 + rand() * 0.7,
      speed: 0.005 + rand() * 0.015,
      phase: rand() * Math.PI * 2
    }));

    let animFrame: number;
    let t = 0;

    function resizeStarCanvas() {
      starCanvas.width = starCanvas.offsetWidth;
      starCanvas.height = starCanvas.offsetHeight;
    }
    resizeStarCanvas();

    function drawStars() {
      starCtx!.clearRect(0, 0, starCanvas.width, starCanvas.height);
      t += 0.016;
      for (const star of stars) {
        const alpha = star.alpha * (0.5 + 0.5 * Math.sin(t * star.speed * 60 + star.phase));
        starCtx!.beginPath();
        starCtx!.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        starCtx!.fillStyle = `rgba(255,255,255,${alpha})`;
        starCtx!.fill();
      }
      animFrame = requestAnimationFrame(drawStars);
    }

    drawStars();

    // --- Wave animation ---
    const waveCtx = waveCanvas.getContext('2d');
    if (!waveCtx) return;

    let wt = 0;
    let waveFrame: number;

    function resizeWaveCanvas() {
      waveCanvas.width = waveCanvas.offsetWidth;
      waveCanvas.height = waveCanvas.offsetHeight;
    }
    resizeWaveCanvas();

    const waveLayers = [
      { color: 'rgba(10,30,60,0.55)', speed: 0.6, amp: 22, yRatio: 0.35 },
      { color: 'rgba(8,40,80,0.5)',   speed: 0.45, amp: 18, yRatio: 0.5  },
      { color: 'rgba(6,50,90,0.45)',  speed: 0.35, amp: 14, yRatio: 0.62 },
      { color: 'rgba(5,60,100,0.4)',  speed: 0.25, amp: 10, yRatio: 0.74 },
      { color: 'rgba(4,70,110,0.35)', speed: 0.18, amp: 7,  yRatio: 0.86 }
    ];

    function drawWaves() {
      waveCtx!.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
      wt += 0.016;
      const W = waveCanvas.width;
      const H = waveCanvas.height;
      for (const layer of waveLayers) {
        const baseY = H * layer.yRatio;
        waveCtx!.beginPath();
        waveCtx!.moveTo(0, H);
        for (let x = 0; x <= W; x += 4) {
          const y = baseY + Math.sin((x / W) * Math.PI * 4 + wt * layer.speed * 5) * layer.amp
                         + Math.sin((x / W) * Math.PI * 7 + wt * layer.speed * 3.2) * (layer.amp * 0.4);
          waveCtx!.lineTo(x, y);
        }
        waveCtx!.lineTo(W, H);
        waveCtx!.closePath();
        waveCtx!.fillStyle = layer.color;
        waveCtx!.fill();
      }
      waveFrame = requestAnimationFrame(drawWaves);
    }

    drawWaves();

    return () => {
      cancelAnimationFrame(animFrame);
      cancelAnimationFrame(waveFrame);
      document.body.style.overflow = '';
    };
  });
</script>

<div class="kemutai-page">
  <!-- Immersive background section -->
  <div class="kemutai-hero bg-gradient-to-b from-[#0a0e1a] via-[#0f1f2e] to-[#1a3a4a] dark:from-[#050810] dark:via-[#0a1520] dark:to-[#0c1e2b]">
    <canvas bind:this={starCanvas} class="pointer-events-none absolute inset-0 h-full w-full"></canvas>
    <canvas bind:this={waveCanvas} class="pointer-events-none absolute inset-0 h-full w-full"></canvas>

    <!-- Nav header -->
    <div class="relative z-10 mx-auto w-full max-w-6xl px-5 pt-6 sm:px-8">
      <div class="kemutai-nav">
        <nav class="kemutai-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true">/</span>
          <a href="/artworks">Artworks</a>
          <span aria-hidden="true">/</span>
          <span>Kemutai Hanashi</span>
        </nav>
        <ThemeToggle />
      </div>

      <!-- Title block -->
      <div class="kemutai-title-block">
        <h1>Kemutai Hanashi</h1>
        <p>An ongoing artwork series dedicated to Kemutai Hanashi</p>
      </div>
    </div>
  </div>

  <!-- Shore section -->
  <div class="kemutai-shore" style="height: {shoreHeight}px;">
    {#each data.items as item, i}
      <button
        type="button"
        class="kemutai-card"
        style="left: {scatterData[i].left}%; transform: rotate({scatterData[i].rotation}deg); width: {scatterData[i].width}px; z-index: {scatterData[i].zIndex};"
        aria-label="Open artwork {i + 1}"
        on:click={() => (lightboxIndex = i)}
      >
        <img
          src={item.src}
          width={item.width}
          height={item.height}
          alt="Kemutai Hanashi artwork {i + 1}"
          loading="lazy"
        />
      </button>
    {/each}
  </div>
</div>

<ImageGallery
  bind:activeIdx={lightboxIndex}
  urls={allUrls}
  showThumbnails={false}
/>

<style>
  .kemutai-page {
    min-height: 100vh;
    overflow-x: hidden;
  }

  .kemutai-hero {
    position: relative;
    min-height: 55vh;
    overflow: hidden;
    padding-bottom: 5rem;
  }

  .kemutai-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .kemutai-breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.55);
  }

  .kemutai-breadcrumb a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: color 420ms cubic-bezier(0.2, 0.82, 0.22, 1);
  }

  .kemutai-breadcrumb a:hover {
    color: rgba(255, 255, 255, 0.95);
  }

  .kemutai-title-block {
    margin-top: 5rem;
    text-align: center;
    padding-bottom: 2rem;
    animation: kemutai-enter 980ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes kemutai-enter {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes kemutai-enter-up {
    from { opacity: 0; filter: blur(4px); transform: translateY(12px); }
    to { opacity: 1; filter: blur(0); transform: translateY(0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .kemutai-title-block,
    .kemutai-title-block h1 {
      animation: none;
    }
  }

  .kemutai-title-block h1 {
    animation: kemutai-enter-up 1050ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both;
    font-size: clamp(2rem, 6vw, 4rem);
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
    margin-bottom: 0.75rem;
    text-shadow: 0 2px 24px rgba(0, 0, 0, 0.4);
  }

  .kemutai-title-block p {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.65);
    margin: 0 auto;
    max-width: 40rem;
  }

  .kemutai-shore {
    position: relative;
    background: linear-gradient(to bottom, #1a3a4a, #0e2233);
    width: 100%;
  }

  .kemutai-card {
    position: absolute;
    top: 30px;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
    transition:
      box-shadow 720ms cubic-bezier(0.2, 0.82, 0.22, 1),
      transform 760ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .kemutai-card:hover {
    box-shadow: 0 14px 44px rgba(0, 0, 0, 0.48);
    transform: scale(1.025) translateY(-3px) rotate(0deg) !important;
  }

  .kemutai-card img {
    width: 100%;
    height: auto;
    display: block;
  }

  /* Lightbox */
  .kemutai-lightbox {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(2, 6, 23, 0.92);
  }

  .kemutai-lightbox-backdrop {
    position: absolute;
    inset: 0;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .kemutai-lightbox-inner {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 1rem;
    max-width: 90vw;
    max-height: 90vh;
  }

  .kemutai-lightbox-close {
    position: absolute;
    top: -2.5rem;
    right: 0;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: #fff;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 360ms cubic-bezier(0.2, 0.82, 0.22, 1);
  }

  .kemutai-lightbox-close:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .kemutai-lightbox-figure {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin: 0;
  }

  .kemutai-lightbox-figure img {
    max-width: 80vw;
    max-height: 80vh;
    width: auto;
    height: auto;
    border-radius: 6px;
    box-shadow: 0 8px 48px rgba(0, 0, 0, 0.6);
  }

  .kemutai-lightbox-figure figcaption {
    color: rgba(255, 255, 255, 0.6);
    font-family: var(--font-mono);
    font-size: 0.8rem;
  }

  .kemutai-lightbox-nav {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: #fff;
    width: 2.75rem;
    height: 2.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 360ms cubic-bezier(0.2, 0.82, 0.22, 1);
  }

  .kemutai-lightbox-nav:hover {
    background: rgba(255, 255, 255, 0.22);
  }
</style>
