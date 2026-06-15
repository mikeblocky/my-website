'use client'

import { useSyncExternalStore, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/utils'
import { SpotifyNowPlaying } from './spotify-now-playing'

const subscribe = () => () => {}

// Deterministic particle config — no Math.random to stay SSR-safe
const PARTICLES = [
    { distance: 28, size: 3,   delay: 0     },
    { distance: 34, size: 2,   delay: 0.02  },
    { distance: 26, size: 3.5, delay: 0.04  },
    { distance: 31, size: 2,   delay: 0.06  },
    { distance: 29, size: 4,   delay: 0.08  },
    { distance: 33, size: 2.5, delay: 0.10  },
    { distance: 27, size: 3,   delay: 0.12  },
    { distance: 30, size: 2,   delay: 0.025 },
    { distance: 35, size: 1.5, delay: 0.045 },
    { distance: 25, size: 3,   delay: 0.065 },
    { distance: 32, size: 2,   delay: 0.085 },
    { distance: 28, size: 2.5, delay: 0.105 },
]

function ParticleBurst({ toLight }: { toLight: boolean }) {
    const count = PARTICLES.length
    return (
        <>
            {PARTICLES.map((p, i) => {
                const angle = (i / count) * 2 * Math.PI
                const x = Math.cos(angle) * p.distance
                const y = Math.sin(angle) * p.distance
                // Warm golden for → light, cool blue for → dark
                const hue = toLight
                    ? 42 + (i % 4) * 14      // golden range
                    : 210 + (i % 5) * 18     // blue-violet range
                const light = toLight ? 68 + (i % 3) * 6 : 62 + (i % 3) * 5
                return (
                    <motion.span
                        key={i}
                        aria-hidden="true"
                        className="pointer-events-none absolute rounded-full"
                        style={{
                            width: p.size,
                            height: p.size,
                            left: '50%',
                            top: '50%',
                            marginLeft: -(p.size / 2),
                            marginTop: -(p.size / 2),
                            background: `hsl(${hue} 90% ${light}%)`,
                        }}
                        initial={{ x: 0, y: 0, scale: 1.2, opacity: 0.9 }}
                        animate={{ x, y, scale: 0, opacity: 0 }}
                        transition={{
                            duration: 0.6,
                            ease: [0.22, 1, 0.36, 1],
                            delay: p.delay,
                        }}
                    />
                )
            })}
        </>
    )
}

// Animated sun: core circle + 8 individually staggered rays
function AnimatedSun({ className }: { className?: string }) {
    const rayCount = 8
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={className}
        >
            <motion.circle
                cx="12" cy="12" r="4.2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 550, damping: 20, delay: 0.02 }}
                style={{ transformOrigin: '12px 12px' }}
            />
            {Array.from({ length: rayCount }).map((_, i) => {
                const angle = (i * (360 / rayCount) * Math.PI) / 180
                const r1 = 6.4
                const r2 = 10
                return (
                    <motion.line
                        key={i}
                        x1={12 + r1 * Math.cos(angle)}
                        y1={12 + r1 * Math.sin(angle)}
                        x2={12 + r2 * Math.cos(angle)}
                        y2={12 + r2 * Math.sin(angle)}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 480,
                            damping: 18,
                            delay: 0.06 + i * 0.03,
                        }}
                        style={{ transformOrigin: '12px 12px' }}
                    />
                )
            })}
        </svg>
    )
}

// Animated moon: crescent drawn via path-length with rotation settle
function AnimatedMoon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <motion.path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                initial={{ pathLength: 0, opacity: 0, rotate: -20 }}
                animate={{ pathLength: 1, opacity: 1, rotate: 0 }}
                transition={{
                    pathLength: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                    opacity:    { duration: 0.2 },
                    rotate:     { type: 'spring', stiffness: 300, damping: 22, delay: 0.05 },
                }}
                style={{ transformOrigin: '12px 12px' }}
            />
        </svg>
    )
}

export function ThemeToggle({ className }: { className?: string }) {
    const { resolvedTheme, setTheme } = useTheme()
    const mounted = useSyncExternalStore(subscribe, () => true, () => false)
    const cleanupRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [burst, setBurst] = useState(0)

    const isDark = resolvedTheme === 'dark'

    const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
        setBurst(b => b + 1)

        const x = e.clientX
        const y = e.clientY
        const nextTheme = isDark ? 'light' : 'dark'

        // View Transition API: circular clip-path wipe from click position
        if (typeof document !== 'undefined' && 'startViewTransition' in document) {
            const vt = (document as Document & { startViewTransition: (cb: () => void) => { ready: Promise<void> } })
                .startViewTransition(() => setTheme(nextTheme))

            vt.ready.then(() => {
                const maxR = Math.hypot(
                    Math.max(x, window.innerWidth - x),
                    Math.max(y, window.innerHeight - y),
                )
                document.documentElement.animate(
                    {
                        clipPath: [
                            `circle(0px at ${x}px ${y}px)`,
                            `circle(${maxR}px at ${x}px ${y}px)`,
                        ],
                    },
                    {
                        duration: 680,
                        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                        pseudoElement: '::view-transition-new(root)',
                    },
                )
            })
            return
        }

        // Fallback: CSS class-gated transitions
        document.documentElement.classList.add('theme-changing')
        setTheme(nextTheme)
        if (cleanupRef.current) clearTimeout(cleanupRef.current)
        cleanupRef.current = setTimeout(() => {
            document.documentElement.classList.remove('theme-changing')
        }, 700)
    }

    if (!mounted) {
        return (
            <div className="flex items-center gap-3 sm:gap-4 select-none">
                <span
                    className={cn(
                        'inline-flex h-9 w-9 items-center justify-center rounded-xl',
                        className
                    )}
                    aria-hidden="true"
                />
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3 sm:gap-4 select-none">
            <SpotifyNowPlaying />
            <motion.button
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                whileHover={{
                    scale: 1.18,
                    transition: { type: 'spring', stiffness: 600, damping: 15 },
                }}
                whileTap={{
                    scale: 0.76,
                    transition: { type: 'spring', stiffness: 900, damping: 17 },
                }}
                onClick={toggleTheme}
                className={cn(
                    'relative p-2 rounded-xl inline-flex items-center justify-center overflow-hidden',
                    'text-muted-foreground hover:text-foreground',
                    'transition-colors duration-150',
                    className
                )}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {/* Ambient breathing glow ring */}
                <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-[-2px] rounded-xl"
                    animate={{
                        boxShadow: isDark
                            ? [
                                '0 0 0px 0px hsl(48 96% 72% / 0)',
                                '0 0 10px 3px hsl(48 96% 72% / 0.22)',
                                '0 0 0px 0px hsl(48 96% 72% / 0)',
                              ]
                            : [
                                '0 0 0px 0px hsl(220 72% 62% / 0)',
                                '0 0 10px 3px hsl(220 72% 62% / 0.18)',
                                '0 0 0px 0px hsl(220 72% 62% / 0)',
                              ],
                    }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
                />

                {/* Bloom halo — re-keyed each toggle so it always re-fires */}
                <AnimatePresence>
                    <motion.span
                        key={`bloom-${isDark}`}
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-xl"
                        initial={{ opacity: 1, scale: 0.4 }}
                        animate={{ opacity: 0, scale: 4 }}
                        transition={{ duration: 0.7, ease: [0.0, 0.0, 0.08, 1] }}
                        style={{
                            background: isDark
                                ? 'radial-gradient(circle, hsl(48 96% 72% / 0.55) 0%, transparent 60%)'
                                : 'radial-gradient(circle, hsl(220 72% 62% / 0.42) 0%, transparent 60%)',
                        }}
                    />
                </AnimatePresence>

                {/* Particle burst on click */}
                {burst > 0 && (
                    <ParticleBurst key={burst} toLight={isDark} />
                )}

                {/* Icon swap: full-spin wheel transition */}
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                        key={isDark ? 'moon' : 'sun'}
                        initial={{
                            opacity: 0,
                            scale: 0.3,
                            rotate: -180,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            rotate: 0,
                            transition: {
                                type: 'spring',
                                stiffness: 260,
                                damping: 18,
                                mass: 0.9,
                                opacity: { duration: 0.18 },
                            },
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.3,
                            rotate: 180,
                            transition: {
                                duration: 0.22,
                                ease: [0.4, 0, 0.8, 0],
                            },
                        }}
                        className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5"
                    >
                        {isDark ? (
                            <AnimatedMoon className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                            <AnimatedSun className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                    </motion.span>
                </AnimatePresence>
            </motion.button>
        </div>
    )
}
