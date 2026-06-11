'use client'

import { useState, useEffect } from 'react'

interface CurrentlyPlayingSong {
  id: string
  song: string
  artist: string
  songUrl: string
  isPlaying: boolean
  artworkUrl?: string
  album?: string
}

const subscribers = new Set<(song: CurrentlyPlayingSong | null) => void>()
let globalCurrentlyPlaying: CurrentlyPlayingSong | null = null
let globalHasChecked = false
let isPollingStarted = false
let intervalId: NodeJS.Timeout | null = null

const fetchCurrentlyPlaying = async () => {
  try {
    const res = await fetch('/api/activity/currently-playing')
    if (!res.ok) return
    const data = await res.json()
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
      : null

    globalCurrentlyPlaying = song
    globalHasChecked = true
    subscribers.forEach(cb => cb(song))
  } catch (err) {
    console.error('Error fetching currently playing Spotify track in shared hook:', err)
  }
}

const startPolling = () => {
  if (isPollingStarted) return
  isPollingStarted = true
  
  // Initial fetch
  fetchCurrentlyPlaying()
  intervalId = setInterval(fetchCurrentlyPlaying, 15000)

  const handleVisibilityChange = () => {
    if (document.hidden) {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    } else {
      fetchCurrentlyPlaying()
      if (!intervalId) {
        intervalId = setInterval(fetchCurrentlyPlaying, 15000)
      }
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
}

export function useSpotifyCurrentlyPlaying() {
  const [song, setSong] = useState<CurrentlyPlayingSong | null>(globalCurrentlyPlaying)
  const [hasChecked, setHasChecked] = useState(globalHasChecked)

  useEffect(() => {
    const cb = (newSong: CurrentlyPlayingSong | null) => {
      setSong(newSong)
      setHasChecked(true)
    }

    subscribers.add(cb)
    startPolling()

    if (globalHasChecked) {
      setSong(globalCurrentlyPlaying)
      setHasChecked(true)
    }

    return () => {
      subscribers.delete(cb)
    }
  }, [])

  return { song, hasChecked }
}
