'use client'

import { useState, useEffect } from 'react'
import { Headphones } from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { monoFont, sansFont } from '@/styles/fonts/fonts'

const SpotifyIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.744-.47-.077-.337.135-.668.47-.745 3.856-.88 7.15-.506 9.822 1.13.295.178.387.563.205.86zm1.224-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.183-.412.125-.845-.107-.97-.52-.124-.412.108-.846.52-.97 3.668-1.112 8.248-.567 11.374 1.354.366.226.486.707.226 1.074zm.107-2.846C14.403 8.8 8.442 8.6 4.992 9.65c-.53.16-1.09-.14-1.25-.67-.16-.53.14-1.09.67-1.25 3.96-1.202 10.55-.974 14.61 1.44.477.284.63.9.347 1.378-.283.477-.9.63-1.377.347z"/>
  </svg>
)

const AppleMusicIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M19.004 3c-.11 0-.22.024-.32.072l-9.98 4.77C8.28 8.046 8 8.472 8 8.943v8.303C7.24 16.545 6.162 16 5 16c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V11.272l9-4.303v5.277c-.76-.702-1.838-1.246-3-1.246-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V3.943c0-.47-.28-.897-.7-.99-.1-.02-.2-.03-.3-.03z"/>
  </svg>
)

const YouTubeIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.387.51A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.862.51 9.387.51 9.387.51s7.525 0 9.387-.51a3.003 3.003 0 0 0 2.11-2.108c.502-1.907.502-5.837.502-5.837s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

export function ListeningActivity() {
  const [activities, setActivities] = useState<any[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [spotifyStatus, setSpotifyStatus] = useState<'success' | 'error' | null>(null)
  const [liveProgressMs, setLiveProgressMs] = useState<number>(0)
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const togglePreview = (trackId: string, previewUrl: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!previewUrl) return

    if (activePreviewId === trackId) {
      audio?.pause()
      setActivePreviewId(null)
      return
    }

    if (audio) {
      audio.pause()
    }

    const newAudio = new Audio(previewUrl)
    newAudio.volume = 0.4
    newAudio.play()
    setAudio(newAudio)
    setActivePreviewId(trackId)

    newAudio.onended = () => {
      setActivePreviewId(null)
    }
  }

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause()
      }
    }
  }, [audio])

  const formatDuration = (ms: number) => {
    if (!ms) return '0:00'
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('spotify') === 'success') {
        setSpotifyStatus('success')
        window.history.replaceState({}, '', window.location.pathname)
      } else if (params.get('spotify') === 'error') {
        setSpotifyStatus('error')
        window.history.replaceState({}, '', window.location.pathname)
      }
    }

    const fetchActivities = async (showLoading = false) => {
      if (showLoading) setIsLoading(true)
      try {
        const res = await fetch('/api/activity')
        const data = await res.json()
        if (data.success) {
          setActivities(data.activities || [])
          setCurrentlyPlaying(data.currentlyPlaying || null)
        }
      } catch (err) {
        console.error('Error fetching activities:', err)
      } finally {
        if (showLoading) setIsLoading(false)
      }
    }

    fetchActivities(true)
    const interval = setInterval(() => fetchActivities(false), 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (currentlyPlaying?.progressMs) {
      setLiveProgressMs(currentlyPlaying.progressMs)
    }
  }, [currentlyPlaying?.id, currentlyPlaying?.progressMs])

  useEffect(() => {
    if (!currentlyPlaying || !currentlyPlaying.isPlaying) return

    const progressInterval = setInterval(() => {
      setLiveProgressMs((prev) => {
        if (currentlyPlaying.durationMs && prev >= currentlyPlaying.durationMs) {
          return currentlyPlaying.durationMs
        }
        return prev + 1000
      })
    }, 1000)

    return () => clearInterval(progressInterval)
  }, [currentlyPlaying])

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const formatDateLabel = (isoString: string) => {
    try {
      const date = new Date(isoString)
      const today = new Date()
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)

      if (date.toDateString() === today.toDateString()) {
        return 'Today'
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday'
      } else {
        return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      }
    } catch {
      return 'Earlier'
    }
  }

  const groupActivitiesByDay = (items: any[]) => {
    const groups: { [key: string]: any[] } = {}
    items.forEach((item) => {
      const label = formatDateLabel(item.timestamp)
      if (!groups[label]) {
        groups[label] = []
      }
      groups[label].push(item)
    })
    return Object.keys(groups).map((dayLabel) => {
      const dayItems = groups[dayLabel]
      const combinedItems: any[] = []
      
      dayItems.forEach((item) => {
        const existing = combinedItems.find(
          (c) => c.song.toLowerCase() === item.song.toLowerCase() &&
               c.artist.toLowerCase() === item.artist.toLowerCase() &&
               c.platform === item.platform
        )
        if (existing) {
          existing.timestamps.push(item.timestamp)
          existing.count += 1
          if (new Date(item.timestamp) > new Date(existing.timestamp)) {
            existing.timestamp = item.timestamp
            existing.id = item.id
          }
        } else {
          combinedItems.push({
            ...item,
            timestamps: [item.timestamp],
            count: 1
          })
        }
      })

      combinedItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      return {
        dayLabel,
        items: combinedItems
      }
    })
  }

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-bar-1 { 0%, 100% { height: 4px; } 50% { height: 16px; } }
        @keyframes bounce-bar-2 { 0%, 100% { height: 12px; } 50% { height: 4px; } }
        @keyframes bounce-bar-3 { 0%, 100% { height: 6px; } 50% { height: 14px; } }
        @keyframes bounce-bar-4 { 0%, 100% { height: 14px; } 50% { height: 8px; } }
        .animate-music-bar-1 { animation: bounce-bar-1 1.0s ease-in-out infinite; }
        .animate-music-bar-2 { animation: bounce-bar-2 1.2s ease-in-out infinite; }
        .animate-music-bar-3 { animation: bounce-bar-3 0.8s ease-in-out infinite; }
        .animate-music-bar-4 { animation: bounce-bar-4 1.1s ease-in-out infinite; }
      `}} />

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Listening activity</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
          A live log of the music and tracks I am hearing on Spotify.
        </p>
      </div>

      {/* Success/Error Alerts */}
      {spotifyStatus === 'success' && (
        <div className="p-4 rounded-md border border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>spotify account connected successfully! real-time history is active.</span>
          </div>
          <button onClick={() => setSpotifyStatus(null)} className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-100 font-bold px-2">×</button>
        </div>
      )}
      {spotifyStatus === 'error' && (
        <div className="p-4 rounded-md border border-red-500/20 bg-red-500/5 text-red-800 dark:text-red-300 flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>failed to connect spotify. please try again.</span>
          </div>
          <button onClick={() => setSpotifyStatus(null)} className="text-red-500 hover:text-red-700 dark:hover:text-red-100 font-bold px-2">×</button>
        </div>
      )}

      {/* Currently Playing Track */}
      {currentlyPlaying && (
        <a
          href={currentlyPlaying.songUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative overflow-hidden p-6 rounded-md border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/40 dark:hover:bg-slate-900/50 hover:border-emerald-500/30 dark:hover:border-emerald-500/20 hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row items-center gap-6 cursor-pointer group"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-500" />
          
          {/* Artwork Album Container */}
          <div className="relative w-28 h-28 flex-shrink-0 rounded-md overflow-hidden border border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
            <img
              src={currentlyPlaying.artworkUrl}
              alt={currentlyPlaying.album}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="p-2.5 rounded-full bg-emerald-500 text-white transform scale-90 group-hover:scale-100 transition-transform duration-300">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.744-.47-.077-.337.135-.668.47-.745 3.856-.88 7.15-.506 9.822 1.13.295.178.387.563.205.86zm1.224-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.183-.412.125-.845-.107-.97-.52-.124-.412.108-.846.52-.97 3.668-1.112 8.248-.567 11.374 1.354.366.226.486.707.226 1.074zm.107-2.846C14.403 8.8 8.442 8.6 4.992 9.65c-.53.16-1.09-.14-1.25-.67-.16-.53.14-1.09.67-1.25 3.96-1.202 10.55-.974 14.61 1.44.477.284.63.9.347 1.378-.283.477-.9.63-1.377.347z"/></svg>
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div className="flex-grow space-y-1.5 text-center sm:text-left min-w-0 w-full relative">
            {/* Monospace Status Badge */}
            <div className={cn(monoFont.className, "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] select-none")}>
              <div className="flex items-end gap-[2px] h-2.5 w-3.5 pb-0.5">
                <span className="w-[2px] bg-emerald-500 rounded-full animate-music-bar-1 h-2.5" />
                <span className="w-[2px] bg-emerald-500 rounded-full animate-music-bar-2 h-1" />
                <span className="w-[2px] bg-emerald-500 rounded-full animate-music-bar-3 h-1.5" />
                <span className="w-[2px] bg-emerald-500 rounded-full animate-music-bar-4 h-0.5" />
              </div>
              <span>now playing</span>
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors truncate">
              {currentlyPlaying.song}
            </h4>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-350 truncate">
              by {currentlyPlaying.artist}
            </p>
            <p className={cn(monoFont.className, "text-[10px] text-muted-foreground truncate")}>
              album: {currentlyPlaying.album.toLowerCase()}
            </p>

            {/* Sleek Progress Bar */}
            {currentlyPlaying.durationMs && (
              <div className="space-y-1 pt-1 max-w-md">
                <div className="flex items-center justify-between text-[9px] font-bold font-mono text-muted-foreground select-none">
                  <span>{formatDuration(liveProgressMs)}</span>
                  <span>{formatDuration(currentlyPlaying.durationMs)}</span>
                </div>
                <div className="h-1 w-full bg-slate-200 dark:bg-slate-800/80 rounded-sm overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-sm transition-all duration-1000 ease-linear"
                    style={{ width: `${Math.min(100, (liveProgressMs / currentlyPlaying.durationMs) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap gap-2.5 pt-3 justify-center sm:justify-start">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  window.open(currentlyPlaying.songUrl, '_blank')
                }}
                className={cn(monoFont.className, "px-4 py-1.5 text-[10px] font-semibold rounded-md border border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500 bg-transparent hover:bg-emerald-500/10 active:scale-[0.98] transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none")}
              >
                <SpotifyIcon />
                listen along
              </button>

              {currentlyPlaying.previewUrl && (
                <button
                  onClick={(e) => togglePreview(currentlyPlaying.id, currentlyPlaying.previewUrl, e)}
                  className={cn(
                    monoFont.className,
                    "px-4 py-1.5 text-[10px] font-semibold rounded-md border transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none",
                    activePreviewId === currentlyPlaying.id
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-slate-300 dark:border-slate-800 hover:border-emerald-500 hover:text-emerald-500 text-slate-700 dark:text-slate-350 bg-transparent"
                  )}
                >
                  {activePreviewId === currentlyPlaying.id ? (
                    <><span>⏸</span> pause preview</>
                  ) : (
                    <><span>▶</span> play preview</>
                  )}
                </button>
              )}
            </div>
          </div>
        </a>
      )}

      {/* Promo block to connect Spotify if no currently playing is found */}
      {!isLoading && !currentlyPlaying && activities.filter(a => a.source === 'spotify').length === 0 && (
        <div className="relative overflow-hidden p-5 rounded-md border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className={cn(monoFont.className, "text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-2")}>
              <SpotifyIcon /> connect spotify account
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              Link your account to display what you are listening to in real-time, side by side with your Apple Music and YouTube entries!
            </p>
          </div>
          <a
            href="/api/activity/auth"
            className={cn(monoFont.className, "px-4 py-1.5 text-xs font-semibold rounded-md border border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500 bg-transparent hover:bg-emerald-500/10 active:scale-[0.98] transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap self-stretch sm:self-auto justify-center")}
          >
            <SpotifyIcon /> connect spotify
          </a>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="h-16 bg-slate-100/60 dark:bg-slate-900/30 rounded-md animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-6">
          {groupActivitiesByDay(activities).map((group) => (
            <div key={group.dayLabel} className="space-y-3">
              <h4 className={cn(monoFont.className, "text-[10px] font-bold text-slate-400 dark:text-slate-500 lowercase tracking-widest")}>
                {group.dayLabel}
              </h4>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <a
                    key={item.id}
                    href={item.songUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-3 rounded-md border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/40 dark:hover:bg-slate-900/50 transition-colors duration-150 min-w-0"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-grow mr-4">
                      <img
                        src={item.artworkUrl}
                        alt={item.album}
                        className="w-10 h-10 object-cover rounded-md border border-slate-200/40 dark:border-slate-800/40 flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="min-w-0 flex-grow">
                        <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:pride-text transition-colors truncate">
                          {item.song}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.artist} — <span className="italic">{item.album}</span>
                        </p>
                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[9.5px] font-mono text-slate-400 dark:text-slate-500 select-none">
                          <span className={cn(
                            "p-0.5 rounded-sm flex items-center justify-center border",
                            item.platform === 'spotify' && "bg-emerald-500/5 border-emerald-500/10 text-emerald-500",
                            item.platform === 'apple-music' && "bg-pink-500/5 border-pink-500/10 text-pink-500",
                            item.platform === 'youtube' && "bg-red-500/5 border-red-500/10 text-red-500"
                          )}>
                            {item.platform === 'spotify' && <SpotifyIcon />}
                            {item.platform === 'apple-music' && <AppleMusicIcon />}
                            {item.platform === 'youtube' && <YouTubeIcon />}
                          </span>
                          <span>via {item.platform === 'spotify' ? 'Spotify' : item.platform === 'apple-music' ? 'Apple Music' : 'YouTube'}</span>
                          <span>•</span>
                          <span>{formatTime(item.timestamp)}</span>
                          
                          {item.count > 1 && (
                            <>
                              <span>•</span>
                              <span className={cn(monoFont.className, "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/30 dark:border-slate-800/30 text-[9px]")}>
                                <Headphones className="w-2.5 h-2.5" />
                                {item.count} plays
                              </span>
                            </>
                          )}
                        </div>
                        {/* Expanded times list */}
                        {item.count > 1 && (
                          <div className="mt-1.5 flex flex-wrap gap-1 items-center text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                            <span className="text-slate-400 dark:text-slate-650 font-sans font-medium mr-0.5 select-none">times:</span>
                            {(() => {
                              const chronTimes = [...item.timestamps].reverse();
                              if (chronTimes.length <= 5) {
                                  return chronTimes.map((t, idx) => (
                                    <span key={idx} className="bg-slate-100/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 px-1 py-0.2 rounded-sm border border-slate-200/30 dark:border-slate-800/30">
                                      {formatTime(t)}
                                    </span>
                                  ));
                              } else {
                                  return (
                                    <>
                                      {chronTimes.slice(0, 4).map((t, idx) => (
                                        <span key={idx} className="bg-slate-100/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 px-1 py-0.2 rounded-sm border border-slate-200/30 dark:border-slate-800/30">
                                          {formatTime(t)}
                                        </span>
                                      ))}
                                      <span 
                                        className="bg-slate-100/80 dark:bg-slate-900/60 text-slate-550 dark:text-slate-400 px-1 py-0.2 rounded-sm border border-slate-200/30 dark:border-slate-800/30 font-semibold cursor-help"
                                        title={chronTimes.slice(4).map(t => formatTime(t)).join(', ')}
                                      >
                                        +{chronTimes.length - 4} more
                                      </span>
                                    </>
                                  );
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {item.previewUrl && (
                      <div className="flex-shrink-0 ml-3">
                        <button
                          onClick={(e) => togglePreview(item.id, item.previewUrl, e)}
                          className={cn(
                            "p-1.5 rounded-md border flex items-center justify-center transition-all duration-200 cursor-pointer",
                            activePreviewId === item.id
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-650 scale-105"
                              : "bg-slate-55/50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-500 dark:hover:border-emerald-500/50"
                          )}
                          title={activePreviewId === item.id ? "Pause Preview" : "Play Preview"}
                        >
                          {activePreviewId === item.id ? (
                            <span className="text-[10px] font-bold">⏸</span>
                          ) : (
                            <span className="text-[10px] font-bold">▶</span>
                          )}
                        </button>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No recent music activities found.</p>
      )}
    </div>
  )
}

