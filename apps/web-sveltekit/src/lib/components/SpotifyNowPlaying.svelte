<script lang="ts">
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import {
    spotifyCurrentlyPlaying,
    startSpotifyPolling
  } from '$lib/spotify/currently-playing-store';

  onMount(() => {
    startSpotifyPolling();
  });
</script>

{#if $spotifyCurrentlyPlaying}
  <a
    class="spotify-now-playing pride-link-hover"
    transition:fly={{ x: 8, duration: 400, opacity: 0 }}
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
