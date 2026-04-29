'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { monoFont, sansFont } from '@/styles/fonts/fonts'

type OutlineSection = {
    id: string
    label: string
}

interface ArticleSectionPreviewProps {
    sections: readonly OutlineSection[]
}

export function ArticleSectionPreview({ sections }: ArticleSectionPreviewProps) {
    const [activeId, setActiveId] = useState(sections[0]?.id ?? '')
    const [isDesktopExpanded, setIsDesktopExpanded] = useState(false)
    const [isMobileExpanded, setIsMobileExpanded] = useState(false)

    useEffect(() => {
        const headings = sections
            .map((section) => document.getElementById(section.id))
            .filter((heading): heading is HTMLElement => Boolean(heading))

        if (headings.length === 0) {
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

                if (visibleEntries[0]?.target.id) {
                    setActiveId(visibleEntries[0].target.id)
                }
            },
            {
                rootMargin: '-20% 0px -60% 0px',
                threshold: [0, 0.2, 0.5, 1],
            }
        )

        headings.forEach((heading) => observer.observe(heading))

        return () => observer.disconnect()
    }, [sections])

    const activeSection = useMemo(
        () => sections.find((section) => section.id === activeId) ?? sections[0],
        [activeId, sections]
    )

    const activeIndex = Math.max(0, sections.findIndex((section) => section.id === activeSection?.id))

    return (
        <>
            <div className="xl:hidden">
                <button
                    type="button"
                    onClick={() => setIsMobileExpanded((value) => !value)}
                    className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-background/70 px-4 py-3 text-left"
                    aria-expanded={isMobileExpanded}
                >
                    <div className="space-y-1">
                        <div className={cn(monoFont.className, "text-xs uppercase tracking-[0.24em] text-muted-foreground")}>
                            Sections
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={cn(monoFont.className, "text-xs text-blue-600 dark:text-blue-400")}>
                                {String(activeIndex + 1).padStart(2, '0')}
                            </span>
                            <span className={cn(sansFont.className, "text-sm font-semibold text-foreground dark:text-white")}>
                                {activeSection?.label}
                            </span>
                        </div>
                    </div>
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                            isMobileExpanded && "rotate-180"
                        )}
                    />
                </button>

                {isMobileExpanded ? (
                    <nav className="mt-2 rounded-xl border border-border/60 bg-background/70 p-2">
                        <div className="space-y-1">
                            {sections.map((section, index) => {
                                const isActive = section.id === activeSection?.id

                                return (
                                    <Link
                                        key={section.id}
                                        href={`#${section.id}`}
                                        onClick={() => setIsMobileExpanded(false)}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                                            isActive
                                                ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                                                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground dark:hover:text-white"
                                        )}
                                    >
                                        <span className={cn(monoFont.className, "text-xs")}>
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <span className={cn(sansFont.className, "text-sm font-medium")}>
                                            {section.label}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </nav>
                ) : null}
            </div>

            <aside
                className="hidden xl:block xl:sticky xl:top-24"
                onMouseEnter={() => setIsDesktopExpanded(true)}
                onMouseLeave={() => setIsDesktopExpanded(false)}
            >
                <div className="space-y-4">
                    <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.28em] text-muted-foreground")}>
                        Sections
                    </div>
                    <nav>
                        <div className="space-y-2">
                            {sections.map((section, index) => {
                                const isActive = section.id === activeSection?.id
                                const showLabel = isDesktopExpanded || isActive

                                return (
                                    <Link
                                        key={section.id}
                                        href={`#${section.id}`}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-2 py-2 transition-colors",
                                            isActive
                                                ? "text-blue-600 dark:text-blue-400"
                                                : "text-muted-foreground hover:text-foreground dark:hover:text-white"
                                        )}
                                    >
                                        <span className={cn(monoFont.className, "w-6 text-[11px]")}>
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <span className="flex-1 overflow-hidden">
                                            {showLabel ? (
                                                <span className={cn(sansFont.className, "block truncate text-sm font-medium")}>
                                                    {section.label}
                                                </span>
                                            ) : (
                                                <span className="block h-px w-10 bg-current opacity-45" />
                                            )}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </nav>
                </div>
            </aside>
        </>
    )
}
