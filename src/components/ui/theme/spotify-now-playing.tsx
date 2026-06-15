'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useSpotifyCurrentlyPlaying } from '@/lib/spotify/use-spotify-currently-playing'

export function SpotifyNowPlaying() {
  const { song: currentlyPlaying, hasChecked } = useSpotifyCurrentlyPlaying()

  if (!hasChecked || !currentlyPlaying) {
    return null
  }

  return (
    <AnimatePresence mode="wait">
      <motion.a
        key={currentlyPlaying.id}
        initial={{ opacity: 0, y: 6, filter: 'blur(3px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -4, filter: 'blur(3px)' }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        href={currentlyPlaying.songUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-[10px] font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors duration-200 hidden sm:flex items-center gap-1.5 max-w-[120px] sm:max-w-[240px] md:max-w-[360px] truncate pride-text-hover pride-link-hover"
        title={`listening to: ${currentlyPlaying.song} by ${currentlyPlaying.artist}`}
      >
        <div className="flex items-end gap-[1.5px] h-2.5 w-2.5 pb-0.5 shrink-0" aria-hidden="true">
          <span className="w-[1.5px] bg-emerald-500 rounded-full animate-spotify-bar-1 h-2" />
          <span className="w-[1.5px] bg-emerald-500 rounded-full animate-spotify-bar-2 h-1" />
          <span className="w-[1.5px] bg-emerald-500 rounded-full animate-spotify-bar-3 h-2.5" />
        </div>
        <span className="truncate">
          listening to: {currentlyPlaying.song.toLowerCase()} — {currentlyPlaying.artist.toLowerCase()}
        </span>
      </motion.a>
    </AnimatePresence>
  )
}
