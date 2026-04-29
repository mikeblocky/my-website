'use client'

import { cn } from '@/lib/utils/utils'
import { monoFont } from '@/styles/fonts/fonts'

type OutlineSection = {
    id: string
    label: string
}

interface ArticleLineRailProps {
    sections: readonly OutlineSection[]
}

export function ArticleLineRail({ sections }: ArticleLineRailProps) {
    return (
        <aside className="hidden xl:flex xl:sticky xl:top-24 xl:h-fit xl:flex-col xl:items-end xl:gap-3">
            <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.28em] text-muted-foreground")}>
                Lines
            </div>
            <div className="space-y-2 text-right">
                {sections.map((section, index) => (
                    <div
                        key={section.id}
                        className={cn(monoFont.className, "text-[11px] text-muted-foreground/65")}
                    >
                        {String(index + 1).padStart(2, '0')}
                    </div>
                ))}
            </div>
            <div className="mt-2 h-24 w-px bg-border/60" />
            <div className={cn(monoFont.className, "text-[11px] text-muted-foreground")}>
                {String(sections.length).padStart(2, '0')} total
            </div>
        </aside>
    )
}
