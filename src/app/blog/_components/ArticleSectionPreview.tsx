'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { monoFont, sansFont } from '@/styles/fonts/fonts'
import type { OutlineSection } from '@/lib/mdx/outline'
import { AnimatePresence, motion } from 'framer-motion'

interface ArticleSectionPreviewProps {
    sections: readonly OutlineSection[]
}

/** Shared hook for section tracking */
function useSectionTracker(sections: readonly OutlineSection[]) {
    const [activeId, setActiveId] = useState('')
    const [isScrolledPastStart, setIsScrolledPastStart] = useState(false)
    const isClickingRef = useRef(false)

    useEffect(() => {
        if (sections.length === 0) {
            return
        }

        let headings: { id: string; element: HTMLElement }[] = []

        const updateHeadings = () => {
            headings = sections
                .map((section) => ({
                    id: section.id,
                    element: document.getElementById(section.id)
                }))
                .filter((h): h is { id: string; element: HTMLElement } => Boolean(h.element))
        }

        const handleScroll = () => {
            if (headings.length === 0) {
                updateHeadings()
            }
            if (headings.length === 0) {
                return
            }

            // 1. Update isScrolledPastStart
            const firstHeading = headings[0].element
            if (firstHeading) {
                const rect = firstHeading.getBoundingClientRect()
                setIsScrolledPastStart(rect.top <= 120)
            }

            // 2. Update activeId
            if (isClickingRef.current) return

            // Threshold is 120px from top of viewport
            const threshold = 120
            let currentActive = sections[0].id

            for (const h of headings) {
                const rect = h.element.getBoundingClientRect()
                if (rect.top <= threshold) {
                    currentActive = h.id
                } else {
                    break
                }
            }

            setActiveId(currentActive)
        }

        // Initialize headings and trigger state update
        updateHeadings()
        handleScroll()

        // Setup MutationObserver to watch for when lazy loaded MDX mounts in the DOM
        const targetNode = document.getElementById('blog-content-body')
        let observer: MutationObserver | null = null

        if (targetNode) {
            observer = new MutationObserver(() => {
                updateHeadings()
                handleScroll()
            })
            observer.observe(targetNode, { childList: true, subtree: true })
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', handleScroll, { passive: true })

        // Polling interval as a bulletproof fallback for lazy suspense mount
        const intervalId = setInterval(() => {
            if (headings.length < sections.length) {
                updateHeadings()
                handleScroll()
            } else {
                clearInterval(intervalId)
            }
        }, 250)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleScroll)
            if (observer) {
                observer.disconnect()
            }
            clearInterval(intervalId)
        }
    }, [sections])

    const activeSection = useMemo(
        () => sections.find((section) => section.id === activeId) ?? sections[0],
        [activeId, sections]
    )

    const activeIndex = Math.max(0, sections.findIndex((section) => section.id === activeSection?.id))

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault()
        const element = document.getElementById(id)
        if (element) {
            isClickingRef.current = true
            setActiveId(id)

            const offset = 80 // Offset for sticky top bar
            const bodyRect = document.body.getBoundingClientRect().top
            const elementRect = element.getBoundingClientRect().top
            const elementPosition = elementRect - bodyRect
            const offsetPosition = elementPosition - offset

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            })

            // Re-enable observer after smooth scroll completes
            setTimeout(() => {
                isClickingRef.current = false
            }, 1000)
        }
    }

    return { activeId, activeSection, activeIndex, isScrolledPastStart, handleLinkClick }
}

/** Mobile sticky bar - rendered as a fixed floating header on top */
export function ArticleSectionPreviewMobile({ sections }: ArticleSectionPreviewProps) {
    const { activeSection, activeIndex, isScrolledPastStart, handleLinkClick } = useSectionTracker(sections)
    const [isMobileExpanded, setIsMobileExpanded] = useState(false)

    // Close when active section changes (e.g. from manual scrolling)
    useEffect(() => {
        setIsMobileExpanded(false)
    }, [activeSection])

    const minLevel = useMemo(() => {
        if (sections.length === 0) return 1
        return Math.min(...sections.map((s) => s.level))
    }, [sections])

    if (sections.length === 0) {
        return null
    }

    return (
        <AnimatePresence>
            {isScrolledPastStart && (
                <>
                    {/* Dark translucent backdrop overlay */}
                    {isMobileExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
                            onClick={() => setIsMobileExpanded(false)}
                        />
                    )}

                    {/* Floating top bar container styled like the bottom bar */}
                    <motion.div
                        initial={{ y: '-120%', opacity: 0, x: '-50%' }}
                        animate={{ y: 0, opacity: 1, x: '-50%' }}
                        exit={{ y: '-120%', opacity: 0, x: '-50%' }}
                        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
                        className={cn(
                            "fixed top-4 left-1/2 z-45 w-[calc(100%-2rem)] max-w-md rounded-2xl overflow-hidden",
                            "bg-white/92 dark:bg-slate-950/92 backdrop-blur-md",
                            "border border-slate-200/50 dark:border-slate-800/60",
                            "shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                        )}
                    >
                        {/* Shifting Rainbow Gradient Background Tint Overlay */}
                        <div 
                            className="absolute inset-0 opacity-[0.07] dark:opacity-[0.11] pointer-events-none -z-10" 
                            style={{ 
                                backgroundImage: 'linear-gradient(135deg, var(--pride-colors-repeat))',
                                backgroundSize: '200% 200%',
                                animation: 'pride-shift 12s ease-in-out infinite'
                            }}
                        />
                        {/* Glossy Liquid Sheen Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/12 via-white/4 to-transparent pointer-events-none -z-10" />

                        <button
                            type="button"
                            onClick={() => setIsMobileExpanded((v) => !v)}
                            className="relative flex w-full items-center justify-between px-4 py-3.5 text-left focus:outline-none"
                        >
                            <div className="flex min-w-0 items-start gap-3 relative z-10">
                                <span className={cn(monoFont.className, "text-[11px] pride-text font-bold shrink-0 mt-[3px]")}>
                                    {String(activeIndex + 1).padStart(2, '0')}/{String(sections.length).padStart(2, '0')}
                                </span>
                                <span className={cn(sansFont.className, "text-sm font-semibold text-foreground dark:text-white line-clamp-2 leading-snug")}>
                                    {activeSection?.label}
                                </span>
                            </div>
                            <motion.div
                                animate={{ rotate: isMobileExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="shrink-0 ml-2 relative z-10"
                            >
                                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {isMobileExpanded && (
                                <motion.nav
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden bg-white/95 dark:bg-slate-950/95 border-t border-slate-200/50 dark:border-slate-800/60 relative z-10"
                                >
                                    <div className="max-h-[70vh] overflow-y-auto p-3 space-y-0.5">
                                        {sections.map((section, index) => {
                                            const isActive = section.id === activeSection?.id
                                            const indentLevel = Math.max(0, section.level - minLevel)

                                            return (
                                                <Link
                                                    key={section.id}
                                                    href={`#${section.id}`}
                                                    onClick={(e) => {
                                                        handleLinkClick(e, section.id)
                                                        setIsMobileExpanded(false)
                                                    }}
                                                    className={cn(
                                                        "flex items-start gap-3 rounded-xl px-4 py-2.5 transition-colors relative",
                                                        isActive
                                                            ? "bg-[hsl(var(--pride-glow-val))]/10 text-[hsl(var(--pride-glow-val))]"
                                                            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground dark:hover:text-white"
                                                    )}
                                                    style={{ paddingLeft: `${16 + indentLevel * 12}px` }}
                                                >
                                                    <span className={cn(monoFont.className, "text-[11px] shrink-0 mt-[3px]")}>
                                                        {String(index + 1).padStart(2, '0')}
                                                    </span>
                                                    <span className={cn(sansFont.className, "min-w-0 flex-1 text-sm font-medium leading-snug")}>
                                                        {section.label}
                                                    </span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </motion.nav>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

/** Desktop sidebar - rendered in the absolute-positioned sidebar */
export function ArticleSectionPreview({ sections }: ArticleSectionPreviewProps) {
    const { activeSection, activeIndex, handleLinkClick } = useSectionTracker(sections)

    const minLevel = useMemo(() => {
        if (sections.length === 0) return 1
        return Math.min(...sections.map((s) => s.level))
    }, [sections])

    if (sections.length === 0) {
        return null
    }

    return (
        <div className="w-[14rem] 2xl:w-[16rem]">
            <div className="space-y-4">
                <div className="flex flex-col items-end text-right gap-1 mb-2">
                    <div className={cn(monoFont.className, "text-[9px] tracking-[0.25em] text-muted-foreground/40 select-none")}>
                        Table of contents
                    </div>
                    <div className="h-[1px] w-6 bg-muted-foreground/20" />
                </div>

                {/* Progress List */}
                <div className="flex flex-col items-end gap-3.5 py-1">
                    {sections.map((section, index) => {
                        const isActive = section.id === activeSection?.id
                        const indentLevel = Math.max(0, section.level - minLevel)
                        return (
                            <Link
                                key={section.id}
                                href={`#${section.id}`}
                                onClick={(e) => handleLinkClick(e, section.id)}
                                className="flex items-start gap-3.5 group/link justify-end w-full cursor-pointer select-none"
                                style={{ paddingRight: `${indentLevel * 8}px` }}
                            >
                                <div className="flex items-start gap-2.5 text-right justify-end">
                                    <span className={cn(
                                        monoFont.className,
                                        "text-[9px] transition-colors duration-300 shrink-0 mt-[3px]",
                                        isActive ? "pride-text font-bold" : "text-muted-foreground/35 group-hover/link:text-muted-foreground/75"
                                    )}>
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className={cn(
                                        sansFont.className,
                                        "text-xs transition-colors duration-300 leading-snug",
                                        isActive 
                                            ? "font-bold text-foreground" 
                                            : "text-muted-foreground/60 group-hover/link:text-foreground"
                                    )}>
                                        {section.label}
                                    </span>
                                </div>
                                <div className={cn(
                                    "h-[3px] transition-all duration-300 rounded-full shrink-0 mt-[6px]",
                                    isActive 
                                        ? "w-7 bg-[hsl(var(--pride-glow-val))] shadow-[0_0_8px_hsl(var(--pride-glow-val)/0.6)]" 
                                        : "w-3 bg-muted-foreground/25 group-hover/link:bg-muted-foreground/50 group-hover/link:w-5"
                                )} />
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
