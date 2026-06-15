import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface CurrentlyPlayingSong {
  id: string;
  song: string;
  artist: string;
  songUrl: string;
  isPlaying: boolean;
  artworkUrl?: string;
  album?: string;
}

export const spotifyCurrentlyPlaying = writable<CurrentlyPlayingSong | null>(null);
export const spotifyHasChecked = writable(false);

let isPollingStarted = false;
let intervalId: any = null;

const fetchCurrentlyPlaying = async () => {
  try {
    const res = await fetch('/api/activity/currently-playing');
    if (!res.ok) return;
    const data = await res.json();
    const song = data.success && data.currentlyPlaying && data.currentlyPlaying.isPlaying
      ? {
          id: data.currentlyPlaying.id,
          song: data.currentlyPlaying.song,
          artist: data.currentlyPlaying.artist,
          songUrl: data.currentlyPlaying.songUrl,
          isPlaying: data.currentlyPlaying.isPlaying,
          artworkUrl: data.currentlyPlaying.artworkUrl,
          album: data.currentlyPlaying.album,
        }
      : null;

    spotifyCurrentlyPlaying.set(song);
    spotifyHasChecked.set(true);
  } catch (err) {
    console.error('Error fetching currently playing Spotify track:', err);
  }
};

export const startSpotifyPolling = () => {
  if (!browser || isPollingStarted) return;
  isPollingStarted = true;

  fetchCurrentlyPlaying();
  intervalId = setInterval(fetchCurrentlyPlaying, 15000);

  const handleVisibilityChange = () => {
    if (document.hidden) {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    } else {
      fetchCurrentlyPlaying();
      if (!intervalId) {
        intervalId = setInterval(fetchCurrentlyPlaying, 15000);
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
};
