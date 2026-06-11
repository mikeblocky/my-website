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

        const headings = sections
            .map((section) => ({
                id: section.id,
                element: document.getElementById(section.id)
            }))
            .filter((h): h is { id: string; element: HTMLElement } => Boolean(h.element))

        if (headings.length === 0) {
            return
        }

        const handleScroll = () => {
            // 1. Update isScrolledPastStart
            const firstHeading = headings[0].element
            if (firstHeading) {
                const rect = firstHeading.getBoundingClientRect()
                setIsScrolledPastStart(rect.top <= 10)
            }

            // 2. Update activeId
            if (isClickingRef.current) return

            // Threshold is 100px from top
            const threshold = 100
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

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [sections])

    const activeSection = useMemo(
        () => sections.find((section) => section.id === activeId) ?? sections[0],
        [activeId, sections]
    )

    const activeIndex = Math.max(0, sections.findIndex((section) => section.id === activeSection?.id))

    const handleLinkClick = (id: string) => {
        isClickingRef.current = true
        setActiveId(id)
        // Re-enable observer after smooth scroll completes
        setTimeout(() => {
            isClickingRef.current = false
        }, 1000)
    }

    return { activeId, activeSection, activeIndex, isScrolledPastStart, handleLinkClick }
}

/** Mobile sticky bar - rendered in the normal document flow for reliable sticky positioning */
export function ArticleSectionPreviewMobile({ sections }: ArticleSectionPreviewProps) {
    const { activeSection, activeIndex, isScrolledPastStart, handleLinkClick } = useSectionTracker(sections)
    const [isMobileExpanded, setIsMobileExpanded] = useState(false)

    if (sections.length === 0) {
        return null
    }

    return (
        <div className={cn(
            "sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl shadow-sm transition-opacity duration-200",
            isScrolledPastStart ? "opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden"
        )}>
            <button
                type="button"
                onClick={() => setIsMobileExpanded((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
                <div className="flex min-w-0 items-center gap-3">
                    <span className={cn(monoFont.className, "text-[11px] pride-text")}>
                        {String(activeIndex + 1).padStart(2, '0')}
                    </span>
                    <span className={cn(sansFont.className, "text-sm font-semibold text-foreground dark:text-white line-clamp-2 lowercase")}>
                        {activeSection?.label}
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: isMobileExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 ml-2"
                >
                    <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isMobileExpanded && (
                    <motion.nav
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-background/50 border-t border-border/30"
                    >
                        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-1">
                            {sections.map((section, index) => {
                                const isActive = section.id === activeSection?.id

                                return (
                                    <Link
                                        key={section.id}
                                        href={`#${section.id}`}
                                        onClick={() => {
                                            handleLinkClick(section.id)
                                            setIsMobileExpanded(false)
                                        }}
                                        className={cn(
                                            "flex items-center gap-3 rounded-sm px-4 py-3 transition-colors",
                                            isActive
                                                ? "bg-[hsl(var(--pride-glow-val))]/10 text-[hsl(var(--pride-glow-val))]"
                                                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground dark:hover:text-white"
                                        )}
                                        style={{ paddingLeft: `${16 + Math.max(0, section.level - 1) * 12}px` }}
                                    >
                                        <span className={cn(monoFont.className, "text-[11px] shrink-0")}>
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <span className={cn(sansFont.className, "min-w-0 flex-1 text-sm font-medium lowercase")}>
                                            {section.label}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </div>
    )
}

/** Desktop sidebar - rendered in the absolute-positioned sidebar */
export function ArticleSectionPreview({ sections }: ArticleSectionPreviewProps) {
    const { activeSection, activeIndex, handleLinkClick } = useSectionTracker(sections)

    if (sections.length === 0) {
        return null
    }

    return (
        <div className="w-[14rem] 2xl:w-[16rem]">
            <div className="space-y-4">
                <div className="flex flex-col items-end text-right gap-1 mb-2">
                    <div className={cn(monoFont.className, "text-[9px] tracking-[0.25em] text-muted-foreground/40 select-none")}>
                        table of contents
                    </div>
                    <div className="h-[1px] w-6 bg-muted-foreground/20" />
                </div>

                {/* Progress List */}
                <div className="flex flex-col items-end gap-3.5 py-1">
                    {sections.map((section, index) => {
                        const isActive = section.id === activeSection?.id
                        return (
                            <Link
                                key={section.id}
                                href={`#${section.id}`}
                                onClick={() => handleLinkClick(section.id)}
                                className="flex items-center gap-3.5 group/link justify-end w-full cursor-pointer select-none"
                                style={{ paddingRight: `${Math.max(0, section.level - 1) * 8}px` }}
                            >
                                <div className="flex items-baseline gap-2.5 text-right">
                                    <span className={cn(
                                        monoFont.className,
                                        "text-[9px] transition-colors duration-300",
                                        isActive ? "pride-text font-bold" : "text-muted-foreground/35 group-hover/link:text-muted-foreground/75"
                                    )}>
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className={cn(
                                        sansFont.className,
                                        "text-xs transition-colors duration-300 lowercase leading-snug max-w-[150px] truncate",
                                        isActive 
                                            ? "font-bold text-foreground" 
                                            : "text-muted-foreground/60 group-hover/link:text-foreground"
                                    )}>
                                        {section.label}
                                    </span>
                                </div>
                                <div className={cn(
                                    "h-[3px] transition-all duration-300 rounded-full shrink-0",
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
