'use client'

import Link from 'next/link'
import { Keyboard, MousePointer, Book, PenTool } from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { monoFont } from '@/styles/fonts/fonts'

export function StationeryUtensils() {
  const cardClass = "p-4 rounded-md border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 transition-colors duration-150 hover:bg-slate-100/40 dark:hover:bg-slate-900/50"

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Journaling stationery</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1">
          The physical and digital tools, supplies, and layout configurations behind my notes and diary pages.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Utensil Card 1 */}
        <div className={cardClass}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350">
              <Keyboard className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Mechanical keyboard</h4>
          </div>
          <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mb-3">
            Used for rapid typing, drafting essays, and digital records.
          </p>
          <Link 
            href="https://www.logitech.com/en-us/products/keyboards/pop-keys-wireless-mechanical.920-010708.html"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(monoFont.className, "text-xs font-semibold text-muted-foreground hover:pride-text hover:underline transition-colors duration-150")}
          >
            logitech pop keys →
          </Link>
        </div>

        {/* Utensil Card 2 */}
        <div className={cardClass}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350">
              <MousePointer className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Workspace mouse</h4>
          </div>
          <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mb-3">
            Smooth navigating across files, tabs, and vector design sketches.
          </p>
          <Link 
            href="https://www.logitech.com/en-us/products/mice/pop-wireless-mouse.html"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(monoFont.className, "text-xs font-semibold text-muted-foreground hover:pride-text hover:underline transition-colors duration-150")}
          >
            logitech pop mouse →
          </Link>
        </div>

        {/* Utensil Card 3 */}
        <div className={cardClass}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350">
              <Book className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Physical diary</h4>
          </div>
          <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
            A traditional, high-grade lined paper notebook sourced from Muji Japan for offline scripting.
          </p>
        </div>

        {/* Utensil Card 4 */}
        <div className={cardClass}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350">
              <PenTool className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Writing instrument</h4>
          </div>
          <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed">
            A standard 0.5mm black ink ballpoint gel pen from Muji for precise note taking.
          </p>
        </div>
      </div>
    </div>
  )
}
