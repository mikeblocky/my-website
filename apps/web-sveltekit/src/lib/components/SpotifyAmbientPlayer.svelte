<script lang="ts">
  import { onMount } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { browser } from '$app/environment';
  import { spotifyCurrentlyPlaying, startSpotifyPolling } from '$lib/spotify/currently-playing-store';

  let ytContainer: HTMLDivElement | null = null;
  let ytPlayer: any = null;
  let ytReady = false;
  let isPlaying = false;
  let hasInteracted = false;
  let pendingPlay = false;
  let showPlayer = false;
  let dismissed = false;
  let currentSongId: string | null = null;
  let noPreview = false;

  function slideUp(node: Element, { duration = 300 }: { duration?: number } = {}) {
    return {
      duration,
      easing: cubicOut,
      css: (t: number) => `
        opacity: ${t};
        transform: translateY(${(1 - t) * 12}px);
        filter: blur(${(1 - t) * 4}px);
      `
    };
  }

  async function fetchYouTubeId(song: string, artist: string): Promise<string | null> {
    try {
      const res = await fetch(`/api/activity/youtube-preview?song=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}`);
      const data = await res.json();
      return data.success ? data.videoId : null;
    } catch {
      return null;
    }
  }

  function createPlayer(videoId: string) {
    if (!ytContainer || !(window as any).YT?.Player) return;

    if (ytPlayer) {
      ytPlayer.loadVideoById(videoId);
      ytPlayer.setVolume(35);
      if (hasInteracted || pendingPlay) {
        pendingPlay = false;
        ytPlayer.playVideo();
      }
      return;
    }

    ytPlayer = new (window as any).YT.Player(ytContainer, {
      videoId,
      width: '1',
      height: '1',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: (e: any) => {
          ytReady = true;
          e.target.setVolume(35);
          if (hasInteracted || pendingPlay) {
            pendingPlay = false;
            e.target.playVideo();
            isPlaying = true;
          }
        },
        onStateChange: (e: any) => {
          const YT = (window as any).YT;
          if (e.data === YT.PlayerState.PLAYING) isPlaying = true;
          else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) isPlaying = false;
          // Loop: restart when ended
          if (e.data === YT.PlayerState.ENDED) e.target.playVideo();
        },
      },
    });
  }

  function initYT(videoId: string) {
    if ((window as any).YT?.Player) {
      createPlayer(videoId);
      return;
    }
    (window as any).onYouTubeIframeAPIReady = () => createPlayer(videoId);
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    }
  }

  async function loadSong(song: string, artist: string, songId: string) {
    noPreview = false;
    const videoId = await fetchYouTubeId(song, artist);
    if (!videoId) { noPreview = true; return; }
    // Guard: song may have changed while we awaited
    if (currentSongId !== songId) return;
    initYT(videoId);
  }

  function onFirstInteraction() {
    if (hasInteracted) return;
    hasInteracted = true;
    window.removeEventListener('click', onFirstInteraction);
    window.removeEventListener('keydown', onFirstInteraction);
    if (ytPlayer && ytReady) {
      ytPlayer.playVideo();
    } else {
      pendingPlay = true;
    }
  }

  function togglePlay() {
    onFirstInteraction();
    if (!ytPlayer || !ytReady) return;
    if (isPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
  }

  function dismiss() {
    dismissed = true;
    showPlayer = false;
    ytPlayer?.pauseVideo();
  }

  $: if (browser) {
    const song = $spotifyCurrentlyPlaying;
    if (song && !dismissed) {
      if (song.id !== currentSongId) {
        currentSongId = song.id;
        loadSong(song.song, song.artist, song.id);
      }
      showPlayer = true;
    } else if (!song) {
      showPlayer = false;
    }
  }

  onMount(() => {
    startSpotifyPolling();
    window.addEventListener('click', onFirstInteraction);
    window.addEventListener('keydown', onFirstInteraction);
    return () => {
      window.removeEventListener('click', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
      ytPlayer?.pauseVideo();
    };
  });
</script>

<!-- YouTube player target — 1×1 so it's invisible but audio plays -->
<div
  bind:this={ytContainer}
  aria-hidden="true"
  style="position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;"
></div>

{#if showPlayer && $spotifyCurrentlyPlaying}
  <div
    class="ambient-player"
    in:slideUp={{ duration: 300 }}
    out:slideUp={{ duration: 200 }}
  >
    <div class="player-inner">
      <div class="player-meta">
        {#if $spotifyCurrentlyPlaying.artworkUrl}
          <img src={$spotifyCurrentlyPlaying.artworkUrl} alt="album art" class="artwork" />
        {/if}
        <div class="track-info">
          <span class="track-name">{$spotifyCurrentlyPlaying.song}</span>
          <span class="artist-name">{$spotifyCurrentlyPlaying.artist}</span>
        </div>
      </div>
      <div class="player-controls">
        {#if !noPreview}
          <button class="control-btn" on:click|stopPropagation={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {#if isPlaying}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            {:else}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            {/if}
          </button>
        {/if}
        <button class="control-btn dismiss-btn" on:click|stopPropagation={dismiss} aria-label="Dismiss">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
    {#if !hasInteracted && !noPreview}
      <p class="click-hint">click anywhere to start ambient playback</p>
    {/if}
  </div>
{/if}

<style>
  .ambient-player {
    position: fixed;
    bottom: 1.25rem;
    right: 1.25rem;
    z-index: 50;
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 0.75rem;
    padding: 0.625rem 0.75rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.12);
    min-width: 220px;
    max-width: 280px;
  }

  .player-inner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: space-between;
  }

  .player-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .artwork {
    width: 2rem;
    height: 2rem;
    border-radius: 0.25rem;
    object-fit: cover;
    flex-shrink: 0;
  }

  .track-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .track-name {
    font-size: 0.7rem;
    font-weight: 600;
    color: hsl(var(--foreground));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .artist-name {
    font-size: 0.65rem;
    color: hsl(var(--muted-foreground));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .player-controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  .control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    border: none;
    background: hsl(var(--muted));
    color: hsl(var(--foreground));
    cursor: pointer;
    transition: background 0.15s;
  }

  .control-btn:hover {
    background: hsl(var(--accent));
  }

  .dismiss-btn {
    background: transparent;
    color: hsl(var(--muted-foreground));
  }

  .dismiss-btn:hover {
    background: hsl(var(--muted));
    color: hsl(var(--foreground));
  }

  .click-hint {
    font-size: 0.6rem;
    color: hsl(var(--muted-foreground));
    margin: 0.4rem 0 0;
    text-align: center;
    opacity: 0.7;
  }
</style>
