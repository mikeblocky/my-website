'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Grid, BookOpen, MessageSquare, MoreHorizontal, User, Book, Users, Heart, X, Music } from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { monoFont, sansFont } from '@/styles/fonts/fonts'
import { useSpotifyCurrentlyPlaying } from '@/lib/spotify/use-spotify-currently-playing'

interface NavTab {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
}

export function MobileAppShell() {
  const pathname = usePathname()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [device, setDevice] = useState<'apple' | 'material'>('apple')
  const { song: currentlyPlaying } = useSpotifyCurrentlyPlaying()

  // Detect device client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase()
      if (/iphone|ipad|ipod|macintosh/.test(ua)) {
        setDevice('apple')
      } else {
        setDevice('material')
      }
    }
  }, [])

  // Close sheet on path change
  useEffect(() => {
    setIsMoreOpen(false)
  }, [pathname])

  const mainTabs: NavTab[] = [
    { href: '/', label: 'home', icon: Home, exact: true },
    { href: '/artworks', label: 'gallery', icon: Grid },
    { href: '/journal', label: 'journal', icon: BookOpen },
    { href: '/interact', label: 'interact', icon: MessageSquare },
  ]

  const moreTabs: NavTab[] = [
    { href: '/about', label: 'about me', icon: User },
    { href: '/zine', label: 'zine', icon: Book },
    { href: '/friends', label: 'friends', icon: Users },
    { href: '/favorites', label: 'favorites', icon: Heart },
  ]

  const isTabActive = (tab: NavTab) => {
    if (tab.exact) {
      return pathname === tab.href
    }
    return pathname.startsWith(tab.href)
  }

  // Calculate dynamic bottom offset for the Spotify player bar based on device shell layout
  const getPlayerBottomOffset = () => {
    if (device === 'apple') {
      // Floating bar sits at bottom-4 (16px), height is 64px, safe area floats
      return isMoreOpen ? '340px' : '96px'
    } else {
      // Fixed bottom bar sits at bottom-0, height is 64px, safe area is inside
      return isMoreOpen ? '320px' : '76px'
    }
  }

  return (
    <div className="sm:hidden select-none">
      {/* ────────────────── SPOTIFY FLOATING PLAYER BAR ────────────────── */}
      <AnimatePresence>
        {currentlyPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 30, scale: 0.95, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed left-1/2 w-[calc(100%-2rem)] max-w-md z-40"
            style={{ bottom: `calc(env(safe-area-inset-bottom, 16px) + ${getPlayerBottomOffset()})` }}
          >
            <a
              href={currentlyPlaying.songUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center justify-between p-2.5 rounded-xl relative overflow-hidden",
                "bg-white/92 dark:bg-slate-950/92 backdrop-blur-md",
                "border border-slate-200/50 dark:border-slate-800/50",
                "shadow-lg shadow-black/5 dark:shadow-black/20",
                "active:scale-[0.98] transition-transform duration-100"
              )}
            >
              {/* Shifting Rainbow Gradient Background Tint Overlay */}
              <div 
                className="absolute inset-0 opacity-[0.12] dark:opacity-[0.18] pointer-events-none" 
                style={{ 
                  backgroundImage: 'linear-gradient(135deg, var(--pride-colors-repeat))',
                  backgroundSize: '200% 200%',
                  animation: 'pride-shift 12s ease-in-out infinite'
                }}
              />
              <div className="flex items-center gap-3 min-w-0 flex-1 z-10">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200/20 dark:border-slate-800/20 flex items-center justify-center">
                  {currentlyPlaying.artworkUrl ? (
                    <img
                      src={currentlyPlaying.artworkUrl}
                      alt={currentlyPlaying.album || 'artwork'}
                      className="w-full h-full object-cover"
                      style={{ animation: 'spin 12s linear infinite' }}
                    />
                  ) : (
                    <Music className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-emerald-500/5 mix-blend-overlay pointer-events-none" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className={cn(sansFont.className, "text-[11px] font-bold text-foreground truncate lowercase")}>
                    {currentlyPlaying.song}
                  </p>
                  <p className={cn(monoFont.className, "text-[9px] text-muted-foreground truncate lowercase")}>
                    listening to: {currentlyPlaying.artist}
                  </p>
                </div>
              </div>
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────────────── APPLE LIQUID GLASS TAB BAR ────────────────── */}
      {device === 'apple' && (
        <nav
          className={cn(
            "fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50 h-16 rounded-2xl overflow-hidden",
            "bg-white/92 dark:bg-slate-950/92 backdrop-blur-md",
            "border border-slate-200/50 dark:border-slate-800/60",
            "shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
            "flex items-center justify-around px-2"
          )}
        >
          {/* Shifting Rainbow Gradient Background Tint Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.07] dark:opacity-[0.11] pointer-events-none" 
            style={{ 
              backgroundImage: 'linear-gradient(135deg, var(--pride-colors-repeat))',
              backgroundSize: '200% 200%',
              animation: 'pride-shift 12s ease-in-out infinite'
            }}
          />
          {/* Glossy Liquid Sheen Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/12 via-white/4 to-transparent pointer-events-none" />

          {mainTabs.map((tab) => {
            const active = isTabActive(tab) && !isMoreOpen
            const Icon = tab.icon

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer relative"
              >
                <Icon className={cn("w-[21px] h-[21px] transition-colors duration-300", active ? "pride-text" : "text-slate-500 dark:text-slate-400")} />
                <span className={cn(monoFont.className, "text-[8px] mt-0.5 lowercase tracking-wider font-semibold", active ? "pride-text" : "text-slate-500/80 dark:text-slate-400/80")}>
                  {tab.label}
                </span>

                {/* Sliding Liquid Active Dot */}
                {active && (
                  <motion.div
                    layoutId="apple-active-dot"
                    className="absolute bottom-1 w-[4px] h-[4px] rounded-full bg-[hsl(var(--pride-glow-val))] shadow-[0_0_8px_hsl(var(--pride-glow-val)/0.9)]"
                    transition={{ type: 'spring', damping: 20, stiffness: 220 }}
                  />
                )}
              </Link>
            )
          })}

          {/* More Tab Trigger */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer relative"
          >
            <MoreHorizontal className={cn("w-[21px] h-[21px] transition-colors duration-300", isMoreOpen ? "pride-text" : "text-slate-500 dark:text-slate-400")} />
            <span className={cn(monoFont.className, "text-[8px] mt-0.5 lowercase tracking-wider font-semibold", isMoreOpen ? "pride-text" : "text-slate-500/80 dark:text-slate-400/80")}>
              more
            </span>

            {isMoreOpen && (
              <motion.div
                layoutId="apple-active-dot"
                className="absolute bottom-1 w-[4px] h-[4px] rounded-full bg-[hsl(var(--pride-glow-val))] shadow-[0_0_8px_hsl(var(--pride-glow-val)/0.9)]"
                transition={{ type: 'spring', damping: 20, stiffness: 220 }}
              />
            )}
          </button>
        </nav>
      )}

      {/* ────────────────── MATERIAL 3 EXPRESSIVE TAB BAR ────────────────── */}
      {device === 'material' && (
        <nav
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 h-16",
            "bg-slate-50 dark:bg-slate-950",
            "border-t border-slate-200/40 dark:border-slate-800/40",
            "flex items-center justify-around px-1",
            "pb-[min(16px,env(safe-area-inset-bottom))]"
          )}
        >
          {mainTabs.map((tab) => {
            const active = isTabActive(tab) && !isMoreOpen
            const Icon = tab.icon

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer relative"
              >
                {/* M3 Sliding Pill Background */}
                <div className="relative py-1 px-5 flex items-center justify-center rounded-full">
                  {active && (
                    <motion.div
                      layoutId="m3-active-pill"
                      className="absolute inset-x-2 inset-y-0.5 rounded-full bg-[hsl(var(--pride-glow-val))]/12 -z-10"
                      transition={{ type: 'spring', damping: 22, stiffness: 240 }}
                    />
                  )}
                  <Icon className={cn("w-5 h-5 transition-colors duration-250", active ? "pride-text" : "text-muted-foreground/60")} />
                </div>
                <span className={cn(sansFont.className, "text-[9px] mt-1 lowercase tracking-normal font-bold", active ? "pride-text" : "text-muted-foreground/60")}>
                  {tab.label}
                </span>
              </Link>
            )
          })}

          {/* More Tab Trigger */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer relative"
          >
            <div className="relative py-1 px-5 flex items-center justify-center rounded-full">
              {isMoreOpen && (
                <motion.div
                  layoutId="m3-active-pill"
                  className="absolute inset-x-2 inset-y-0.5 rounded-full bg-[hsl(var(--pride-glow-val))]/12 -z-10"
                  transition={{ type: 'spring', damping: 22, stiffness: 240 }}
                />
              )}
              <MoreHorizontal className={cn("w-5 h-5 transition-colors duration-250", isMoreOpen ? "pride-text" : "text-muted-foreground/60")} />
            </div>
            <span className={cn(sansFont.className, "text-[9px] mt-1 lowercase tracking-normal font-bold", isMoreOpen ? "pride-text" : "text-muted-foreground/60")}>
              more
            </span>
          </button>
        </nav>
      )}

      {/* ────────────────── MORE SHEET DRAWER ────────────────── */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMoreOpen(false)}
            />

            {/* Bottom Sheet Menu */}
            <motion.div
              initial={{ y: '100%', x: '-50%' }}
              animate={{ y: 0, x: '-50%' }}
              exit={{ y: '100%', x: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className={cn(
                "fixed bottom-0 left-1/2 z-50 w-full max-w-md overflow-hidden",
                device === 'apple' 
                  ? "bg-white/95 dark:bg-slate-900/98 backdrop-blur-md rounded-t-2xl border-t border-slate-200/50 dark:border-slate-800/80" 
                  : "bg-white dark:bg-slate-950 rounded-t-2xl border-t border-slate-200 dark:border-slate-800",
                "px-5 pt-5 pb-[calc(env(safe-area-inset-bottom,16px)+80px)]",
                "shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
              )}
            >
              {/* Shifting Rainbow Gradient Background Tint Overlay */}
              <div 
                className="absolute inset-0 opacity-[0.05] dark:opacity-[0.09] pointer-events-none" 
                style={{ 
                  backgroundImage: 'linear-gradient(135deg, var(--pride-colors-repeat))',
                  backgroundSize: '200% 200%',
                  animation: 'pride-shift 15s ease-in-out infinite'
                }}
              />
              {/* Drag Indicator Bar */}
              <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6 relative z-10" />

              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className={cn(monoFont.className, "text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-500 font-semibold")}>
                  others
                </span>
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid links layout */}
              <div className="grid grid-cols-2 gap-3 relative z-10">
                {moreTabs.map((tab) => {
                  const active = isTabActive(tab)
                  const Icon = tab.icon

                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={cn(
                        "flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200",
                        active
                          ? "bg-[hsl(var(--pride-glow-val))]/10 border-[hsl(var(--pride-glow-val))]/30 pride-text shadow-[0_4px_12px_hsl(var(--pride-glow-val)/0.15)] font-bold"
                          : "border-slate-200/50 dark:border-slate-800/40 bg-slate-100/10 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/45 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className={cn(monoFont.className, "text-[11px] font-semibold tracking-wide lowercase")}>
                        {tab.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
