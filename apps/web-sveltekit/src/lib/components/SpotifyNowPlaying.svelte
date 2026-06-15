<script lang="ts">
  import { onMount } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import {
    spotifyCurrentlyPlaying,
    startSpotifyPolling
  } from '$lib/spotify/currently-playing-store';

  function slideBlur(node: Element, { duration = 350, y = 6 }: { duration?: number; y?: number } = {}) {
    return {
      duration,
      easing: cubicOut,
      css: (t: number) => `
        opacity: ${t};
        transform: translateY(${(1 - t) * y}px);
        filter: blur(${(1 - t) * 3}px);
      `
    };
  }

  onMount(() => {
    startSpotifyPolling();
  });
</script>

{#if $spotifyCurrentlyPlaying}
  <a
    class="spotify-now-playing pride-link-hover"
    in:slideBlur={{ duration: 350, y: 6 }}
    out:slideBlur={{ duration: 250, y: -4 }}
    href={$spotifyCurrentlyPlaying.songUrl}
    target="_blank"
    rel="noopener noreferrer"
    title={`listening to: ${$spotifyCurrentlyPlaying.song} by ${$spotifyCurrentlyPlaying.artist}`}
  >
    <span class="spotify-bars" aria-hidden="true">
      <i class="animate-spotify-bar-1"></i>
      <i class="animate-spotify-bar-2"></i>
      <i class="animate-spotify-bar-3"></i>
    </span>
    <span>
      listening to: {$spotifyCurrentlyPlaying.song} — {$spotifyCurrentlyPlaying.artist}
    </span>
  </a>
{/if}
