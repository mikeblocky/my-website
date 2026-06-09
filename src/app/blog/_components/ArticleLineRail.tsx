'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { cn } from '@/lib/utils/utils'
import { monoFont } from '@/styles/fonts/fonts'

interface ArticleLineRailProps {
    articleId?: string
}

const RAIL_HEIGHT = 400

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}

function formatLine(value: number) {
    return String(value).padStart(2, '0')
}

export function ArticleLineRail({ articleId = 'content' }: ArticleLineRailProps) {
    const railRef = useRef<HTMLDivElement | null>(null)
    const totalLinesRef = useRef(1)
    const [totalLines, setTotalLines] = useState(1)
    const [currentLine, setCurrentLine] = useState(1)
    const [hoverLine, setHoverLine] = useState<number | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        const article = document.getElementById(articleId)

        if (!article) {
            return
        }

        const measure = () => {
            const probe =
                article.querySelector('p, li, blockquote, pre, code') ??
                article.querySelector('div') ??
                article
            const styles = window.getComputedStyle(probe)
            const lineHeightValue = Number.parseFloat(styles.lineHeight)
            const fontSizeValue = Number.parseFloat(styles.fontSize)
            const fallbackLineHeight = Number.isFinite(fontSizeValue) ? fontSizeValue * 1.7 : 28
            const lineHeight = Number.isFinite(lineHeightValue) ? lineHeightValue : fallbackLineHeight
            const nextTotal = Math.max(1, Math.ceil(article.scrollHeight / lineHeight))

            totalLinesRef.current = nextTotal
            setTotalLines(nextTotal)
        }

        const updateCurrentLine = () => {
            const articleTop = article.getBoundingClientRect().top + window.scrollY
            const articleScrollableRange = Math.max(1, article.offsetHeight - window.innerHeight * 0.45)
            const progress = clamp((window.scrollY - articleTop) / articleScrollableRange, 0, 1)

            setCurrentLine(Math.max(1, Math.round(progress * (totalLinesRef.current - 1)) + 1))
        }

        measure()
        updateCurrentLine()

        const resizeObserver = new ResizeObserver(() => {
            measure()
            updateCurrentLine()
        })

        resizeObserver.observe(article)
        window.addEventListener('resize', measure)
        window.addEventListener('scroll', updateCurrentLine, { passive: true })

        return () => {
            resizeObserver.disconnect()
            window.removeEventListener('resize', measure)
            window.removeEventListener('scroll', updateCurrentLine)
        }
    }, [articleId])

    const scrollToRatio = (ratio: number) => {
        const article = document.getElementById(articleId)

        if (!article) {
            return
        }

        const articleTop = article.getBoundingClientRect().top + window.scrollY
        const articleScrollableRange = Math.max(0, article.offsetHeight - window.innerHeight * 0.45)
        const safeRatio = clamp(ratio, 0, 1)
        const targetLine = Math.max(1, Math.round(safeRatio * (totalLines - 1)) + 1)

        setHoverLine(targetLine)
        setCurrentLine(targetLine)

        window.scrollTo({
            top: articleTop + safeRatio * articleScrollableRange,
            behavior: isDragging ? 'auto' : 'smooth',
        })
    }

    const updateFromPointer = (clientY: number) => {
        const rail = railRef.current

        if (!rail) {
            return
        }

        const rect = rail.getBoundingClientRect()
        const ratio = clamp((clientY - rect.top) / rect.height, 0, 1)

        scrollToRatio(ratio)
    }

    const activeLine = hoverLine ?? currentLine
    const thumbOffset = totalLines > 1 ? ((activeLine - 1) / (totalLines - 1)) * 100 : 0

    // Calculate checkpoints (every ~10% or at major sections)
    const checkpoints = useMemo(() => {
        const count = 10
        const result = []
        for (let i = 0; i <= count; i++) {
            result.push(i / count)
        }
        return result
    }, [])

    return (
        <aside className="hidden xl:flex xl:sticky xl:top-24 xl:h-fit xl:flex-col xl:items-end xl:gap-4">
            <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.28em] text-muted-foreground")}>
                Lines
            </div>
            
            <div className="relative flex items-center pr-1">
                <div
                    ref={railRef}
                    className="relative w-12 cursor-row-resize flex flex-col justify-between py-1"
                    style={{ height: RAIL_HEIGHT }}
                    onPointerDown={(event) => {
                        setIsDragging(true)
                        event.currentTarget.setPointerCapture(event.pointerId)
                        updateFromPointer(event.clientY)
                    }}
                    onPointerMove={(event) => {
                        if (isDragging) {
                            updateFromPointer(event.clientY)
                            return
                        }

                        const rect = event.currentTarget.getBoundingClientRect()
                        const ratio = clamp((event.clientY - rect.top) / rect.height, 0, 1)
                        setHoverLine(Math.max(1, Math.round(ratio * (totalLines - 1)) + 1))
                    }}
                    onPointerLeave={() => {
                        if (!isDragging) {
                            setHoverLine(null)
                        }
                    }}
                    onPointerUp={(event) => {
                        setIsDragging(false)
                        setHoverLine(null)
                        event.currentTarget.releasePointerCapture(event.pointerId)
                    }}
                >
                    {/* Background Rail */}
                    <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-muted/30" />

                    {/* Checkpoints */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {checkpoints.map((ratio) => {
                            const line = Math.max(1, Math.round(ratio * (totalLines - 1)) + 1)
                            const isActive = Math.abs(activeLine - line) < (totalLines / 20)
                            const isTooClose = Math.abs(activeLine - line) < 5
                            
                            return (
                                <div key={ratio} className="flex items-center justify-end gap-2 group transition-all duration-300">
                                    {!isTooClose && (
                                        <span className={cn(
                                            monoFont.className, 
                                            "text-[10px] transition-colors duration-300",
                                            isActive ? "pride-text font-bold" : "text-muted-foreground/30"
                                        )}>
                                            {formatLine(line)}
                                        </span>
                                    )}
                                    <div className={cn(
                                        "h-px transition-all duration-300",
                                        isActive ? "w-4 bg-[hsl(var(--pride-glow-val))]/50" : "w-2 bg-muted-foreground/20"
                                    )} />
                                </div>
                            )
                        })}
                    </div>

                    {/* Active Line Indicator (The Dash) */}
                    <div
                        className="absolute right-0 w-6 h-px bg-[hsl(var(--pride-glow-val))] shadow-[0_0_8px_hsl(var(--pride-glow-val)/0.8)] z-10 transition-all duration-75"
                        style={{ top: `${thumbOffset}%` }}
                    />
                    
                    {/* Current Line Label floating next to indicator */}
                    <div 
                        className="absolute right-8 -translate-y-1/2 pointer-events-none transition-all duration-75"
                        style={{ top: `${thumbOffset}%` }}
                    >
                        <span className={cn(
                            monoFont.className,
                            "text-[14px] font-bold pride-text"
                        )}>
                            {formatLine(activeLine)}
                        </span>
                    </div>
                </div>
            </div>

            <div className={cn(monoFont.className, "text-[11px] text-muted-foreground mt-2")}>
                {formatLine(totalLines)} total
            </div>
        </aside>
    )
}
