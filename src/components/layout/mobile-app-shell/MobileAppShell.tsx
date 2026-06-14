'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Grid, BookOpen, MessageSquare, MoreHorizontal, User, Book, Users, Heart, X, Music, ChevronDown } from 'lucide-react'
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
  const [isGenerator, setIsGenerator] = useState(false)
  const [isSpotifyCollapsed, setIsSpotifyCollapsed] = useState(false)

  // Check if active page/tab is recommendation generator
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkGenerator = () => {
      if (pathname !== '/favorites') {
        setIsGenerator(false)
        return
      }
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab')
      const storedTab = localStorage.getItem('mikeblocky:recommendations-tab')
      const activeTab = tabParam || storedTab || 'manga'
      setIsGenerator(activeTab === 'generator')
    }

    checkGenerator()

    window.addEventListener('popstate', checkGenerator)
    window.addEventListener('mikeblocky-tab-url', checkGenerator)
    window.addEventListener('mikeblocky-tab-storage', checkGenerator)

    return () => {
      window.removeEventListener('popstate', checkGenerator)
      window.removeEventListener('mikeblocky-tab-url', checkGenerator)
      window.removeEventListener('mikeblocky-tab-storage', checkGenerator)
    }
  }, [pathname])

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
    { href: '/', label: 'Home', icon: Home, exact: true },
    { href: '/artworks', label: 'Gallery', icon: Grid },
    { href: '/journal', label: 'Journal', icon: BookOpen },
    { href: '/interact', label: 'Interact', icon: MessageSquare },
  ]

  const moreTabs: NavTab[] = [
    { href: '/about', label: 'About', icon: User },
    { href: '/zine', label: 'Zine', icon: Book },
    { href: '/friends', label: 'Friends', icon: Users },
    { href: '/favorites', label: 'Favorites', icon: Heart },
  ]

  const isTabActive = (tab: NavTab) => {
    if (tab.exact) {
      return pathname === tab.href
    }
    return pathname.startsWith(tab.href)
  }

  // Calculate dynamic bottom offset for the Spotify player bar based on device shell layout
  const getPlayerBottomOffset = () => {
    // Both bars float at bottom-4 (16px) + height 56px (16px + 56px = 72px)
    return isMoreOpen ? '320px' : '72px'
  }

  return (
    <div className="sm:hidden select-none">

      {/* ────────────────── SPOTIFY FLOATING PLAYER BAR ────────────────── */}
      <AnimatePresence>
        {currentlyPlaying && (
          isSpotifyCollapsed ? (
            <motion.button
              key="spotify-collapsed"
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              transition={{
                opacity: { duration: 0.15 },
                default: { type: 'spring', damping: 25, stiffness: 220 }
              }}
              onClick={() => setIsSpotifyCollapsed(false)}
              className={cn(
                "fixed right-4 z-40 w-12 h-12 rounded-full overflow-hidden focus:outline-none",
                "bg-slate-100 dark:bg-slate-800 border-2 border-white/40 dark:border-slate-700/60 shadow-lg shadow-black/20",
                "active:scale-[0.95] transition-transform duration-100"
              )}
              style={{ bottom: `calc(1rem + env(safe-area-inset-bottom, 0px) + ${getPlayerBottomOffset()})` }}
              title="Expand currently playing"
            >
              {currentlyPlaying.artworkUrl ? (
                <img
                  src={currentlyPlaying.artworkUrl}
                  alt={currentlyPlaying.album || 'artwork'}
                  className="w-full h-full object-cover"
                  style={{ animation: 'spin 12s linear infinite' }}
                />
              ) : (
                <Music className="w-4 h-4 text-muted-foreground" />
              )}
              <div className="absolute inset-0 bg-emerald-500/5 mix-blend-overlay pointer-events-none" />
            </motion.button>
          ) : (
            <motion.div
              key="spotify-expanded"
              initial={{ opacity: 0, y: 30, scale: 0.95, x: '-50%' }}
              animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
              exit={{ opacity: 0, y: 30, scale: 0.95, x: '-50%' }}
              transition={{
                opacity: { duration: 0.15 },
                default: { type: 'spring', damping: 25, stiffness: 220 }
              }}
              className="fixed left-1/2 w-[calc(100%-2rem)] max-w-md z-40"
              style={{ bottom: `calc(1rem + env(safe-area-inset-bottom, 0px) + ${getPlayerBottomOffset()})` }}
            >
              <div
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-xl relative overflow-hidden",
                  "bg-white/80 dark:bg-slate-950/85 backdrop-blur-2xl",
                  "border border-white/25 dark:border-white/10",
                  "shadow-lg shadow-black/5 dark:shadow-black/20"
                )}
              >
                {/* Shifting Rainbow Gradient Background Tint Overlay */}
                <div 
                  className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08] pointer-events-none" 
                  style={{ 
                    backgroundImage: 'linear-gradient(135deg, var(--pride-colors-repeat))',
                    backgroundSize: '200% 200%',
                    animation: 'pride-shift 12s ease-in-out infinite'
                  }}
                />
                
                {/* Link part (artwork & text) */}
                <a
                  href={currentlyPlaying.songUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 min-w-0 flex-1 z-10 focus:outline-none active:scale-[0.98] transition-transform duration-100"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200/20 dark:border-slate-800/20 flex items-center justify-center">
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
                </a>

                {/* Collapse button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsSpotifyCollapsed(true)
                  }}
                  className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer z-20 focus:outline-none ml-2 active:scale-90 transition-transform duration-100 shrink-0"
                  title="Collapse player"
                >
                  <ChevronDown className="h-4.5 w-4.5" />
                </button>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* ────────────────── APPLE LIQUID GLASS TAB BAR ────────────────── */}
      {device === 'apple' && (
        <nav
          className={cn(
            "fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50 h-14 rounded-2xl overflow-hidden",
            "bg-white/80 dark:bg-slate-950/85 backdrop-blur-2xl",
            "border border-white/25 dark:border-white/10",
            "shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_0.5px_1px_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.45)]",
            "flex items-center justify-around px-2"
          )}
          style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {/* Shifting Rainbow Gradient Background Tint Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08] pointer-events-none" 
            style={{ 
              backgroundImage: 'linear-gradient(135deg, var(--pride-colors-repeat))',
              backgroundSize: '200% 200%',
              animation: 'pride-shift 12s ease-in-out infinite'
            }}
          />
          {/* Glossy Liquid Sheen Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0.05)_30%,rgba(255,255,255,0)_70%)] pointer-events-none" />

          {mainTabs.map((tab) => {
            const active = isTabActive(tab) && !isMoreOpen
            const Icon = tab.icon

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer relative focus:outline-none"
                onClick={(e) => {
                  if (active) {
                    e.preventDefault()
                    if (!isGenerator) {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }
                }}
              >
                <Icon className={cn("w-[19px] h-[19px] transition-colors duration-300", active ? "pride-text" : "text-slate-500 hover:text-slate-800 dark:text-slate-100 dark:hover:text-white")} />
                <span className={cn(monoFont.className, "text-[8px] mt-0.5 tracking-wider font-semibold", active ? "pride-text" : "text-slate-500 hover:text-slate-800 dark:text-slate-100 dark:hover:text-white")}>
                  {tab.label}
                </span>

                {/* Sliding Liquid Active Dot */}
                {active && (
                  <motion.div
                    layoutId="apple-active-dot"
                    className="absolute bottom-1 w-[4px] h-[4px] rounded-full bg-[hsl(var(--pride-glow-val))] shadow-[0_0_8px_hsl(var(--pride-glow-val)/0.9)]"
                    transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                  />
                )}
              </Link>
            )
          })}

          {/* More Tab Trigger */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="flex flex-col items-center justify-center flex-1 w-full h-full py-1 text-center cursor-pointer relative focus:outline-none"
          >
            <MoreHorizontal className={cn("w-[19px] h-[19px] transition-colors duration-300", isMoreOpen ? "pride-text" : "text-slate-500 hover:text-slate-800 dark:text-slate-100 dark:hover:text-white")} />
            <span className={cn(monoFont.className, "text-[8px] mt-0.5 tracking-wider font-semibold", isMoreOpen ? "pride-text" : "text-slate-500 hover:text-slate-800 dark:text-slate-100 dark:hover:text-white")} >
              More
            </span>

            {isMoreOpen && (
              <motion.div
                layoutId="apple-active-dot"
                className="absolute bottom-1 w-[4px] h-[4px] rounded-full bg-[hsl(var(--pride-glow-val))] shadow-[0_0_8px_hsl(var(--pride-glow-val)/0.9)]"
                transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              />
            )}
          </button>
        </nav>
      )}

      {/* ────────────────── MATERIAL 3 EXPRESSIVE TAB BAR ────────────────── */}
      {device === 'material' && (
        <nav
          className={cn(
            "fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-50 h-14 rounded-2xl overflow-hidden",
            "bg-white/80 dark:bg-slate-950/85 backdrop-blur-2xl",
            "border border-white/25 dark:border-white/10",
            "shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_0.5px_1px_rgba(255,255,255,0.15),0_8px_32px_rgba(0,0,0,0.45)]",
            "flex items-center justify-around px-2"
          )}
          style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {/* Shifting Rainbow Gradient Background Tint Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08] pointer-events-none" 
            style={{ 
              backgroundImage: 'linear-gradient(135deg, var(--pride-colors-repeat))',
              backgroundSize: '200% 200%',
              animation: 'pride-shift 12s ease-in-out infinite'
            }}
          />
          {/* Glossy Liquid Sheen Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0.05)_30%,rgba(255,255,255,0)_70%)] pointer-events-none" />

          {mainTabs.map((tab) => {
            const active = isTabActive(tab) && !isMoreOpen
            const Icon = tab.icon

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer relative focus:outline-none"
                onClick={(e) => {
                  if (active) {
                    e.preventDefault()
                    if (!isGenerator) {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }
                }}
              >
                {/* M3 Sliding Pill Background */}
                <div className="relative py-1 px-4.5 flex items-center justify-center rounded-full">
                  {active && (
                    <motion.div
                      layoutId="m3-active-pill"
                      className="absolute inset-x-1.5 inset-y-0.5 rounded-full bg-[hsl(var(--pride-glow-val))]/12 -z-10"
                      transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                    />
                  )}
                  <Icon className={cn("w-[19px] h-[19px] transition-colors duration-250", active ? "pride-text" : "text-slate-500 hover:text-slate-800 dark:text-slate-100 dark:hover:text-white")} />
                </div>
                <span className={cn(monoFont.className, "text-[8px] mt-0.5 tracking-wider font-semibold", active ? "pride-text" : "text-slate-500 hover:text-slate-800 dark:text-slate-100 dark:hover:text-white")}>
                  {tab.label}
                </span>
              </Link>
            )
          })}

          {/* More Tab Trigger */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="flex flex-col items-center justify-center flex-1 w-full h-full py-1 text-center cursor-pointer relative focus:outline-none"
          >
            <div className="relative py-1 px-4.5 flex items-center justify-center rounded-full">
              {isMoreOpen && (
                <motion.div
                  layoutId="m3-active-pill"
                  className="absolute inset-x-1.5 inset-y-0.5 rounded-full bg-[hsl(var(--pride-glow-val))]/12 -z-10"
                  transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                />
              )}
              <MoreHorizontal className={cn("w-[19px] h-[19px] transition-colors duration-250", isMoreOpen ? "pride-text" : "text-slate-500 hover:text-slate-800 dark:text-slate-100 dark:hover:text-white")} />
            </div>
            <span className={cn(monoFont.className, "text-[8px] mt-0.5 tracking-wider font-semibold", isMoreOpen ? "pride-text" : "text-slate-500 hover:text-slate-800 dark:text-slate-100 dark:hover:text-white")}>
              More
            </span>
          </button>
        </nav>
      )}

      {/* ────────────────── MORE FLOATING OVERLAY MENU ────────────────── */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            {/* Dark Blur Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-40 bg-black/65 backdrop-blur-md"
              onClick={() => setIsMoreOpen(false)}
            />

            {/* Floating Menu Overlay (No Outer Container) */}
            <motion.div
              variants={{
                show: {
                  transition: {
                    staggerChildren: 0.04,
                  }
                },
                hide: {
                  transition: {
                    staggerChildren: 0.03,
                    staggerDirection: -1
                  }
                }
              }}
              initial="hide"
              animate="show"
              exit="hide"
              className="fixed left-8 z-50 w-auto flex flex-col gap-4.5 items-start justify-center"
              style={{ bottom: 'calc(5.25rem + env(safe-area-inset-bottom, 0px))' }}
            >
              {moreTabs.map((tab) => {
                const active = isTabActive(tab)
                const Icon = tab.icon

                return (
                  <motion.div
                    key={tab.href}
                    variants={{
                      show: { y: 0, opacity: 1, scale: 1 },
                      hide: { y: 12, opacity: 0, scale: 0.95 }
                    }}
                    transition={{ type: 'spring', damping: 22, stiffness: 260 }}
                  >
                    <Link
                      href={tab.href}
                      className={cn(
                        "flex items-center gap-3 py-2 px-2 transition-transform duration-155 active:scale-95 select-none focus:outline-none",
                        active
                          ? "pride-text font-normal text-sm"
                          : "text-white/80 hover:text-white text-sm"
                      )}
                      onClick={(e) => {
                        if (active) {
                          e.preventDefault()
                          if (!isGenerator) {
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }
                          setIsMoreOpen(false)
                        }
                      }}
                    >
                      <Icon className={cn("w-[19px] h-[19px] shrink-0 transition-colors duration-200", active ? "pride-text" : "text-white/60")} />
                      <span className={cn(monoFont.className, "tracking-wider")}>
                        {tab.label}
                      </span>
                    </Link>
                  </motion.div>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
