'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sansFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'

interface RedirectToBoardProps {
  id: string
  type: 'talk' | 'question' | 'prompt' | 'suggestion' | 'sketchbook'
}

export function RedirectToBoard({ id, type }: RedirectToBoardProps) {
  const router = useRouter()
  const destination = type === 'suggestion'
    ? `/interact?tab=suggestions#suggestion-${id}`
    : type === 'talk' || type === 'question'
      ? `/interact?tab=guestbook#talk-${id}`
      : type === 'sketchbook'
        ? `/interact?tab=sketchbook#drawing-${id}`
        : `/interact?tab=prompts#prompt-${id}`

  useEffect(() => {
    // Perform instant, high-performance client-side transition to the main board
    router.replace(destination)
  }, [router, destination])

  const isTalk = type === 'talk' || type === 'question'
  const isSuggestion = type === 'suggestion'
  const isSketchbook = type === 'sketchbook'
  const accentColor = isSuggestion
    ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/10 border-teal-100 dark:border-teal-900/20'
    : isTalk
      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20'
      : 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/10 border-violet-100 dark:border-violet-900/20'

  const loaderColor = isSuggestion ? 'border-teal-500' : isTalk ? 'border-blue-500' : 'border-violet-500'
  const boardLabel = isSuggestion 
    ? 'Media suggestions' 
    : isTalk 
      ? 'Talk board' 
      : isSketchbook 
        ? 'Sketchbook board' 
        : 'Draw prompts'

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className={cn(
        "rounded-md border p-8 max-w-sm w-full space-y-5 bg-slate-50/70 dark:bg-slate-900/60",
        accentColor
      )}>
        {/* Loading Spinner */}
        <div className="flex justify-center">
          <div className={cn(
            "w-8 h-8 rounded-full border-2 border-t-transparent animate-spin",
            loaderColor
          )} />
        </div>
        
        <div className="space-y-1">
          <h3 className={cn(sansFont.className, "text-sm font-semibold")}>
            Entering {boardLabel}
          </h3>
          <p className={cn(sansFont.className, "text-xs opacity-75")}>
            Locating your shared item...
          </p>
        </div>

        {/* Manual Press to Enter Link */}
        <div className="pt-2">
          <Link
            href={destination}
            className={cn(
              "block w-full py-2.5 px-5 text-sm font-semibold rounded-md text-center transition-all duration-200 border border-transparent hover:-translate-y-0.5 active:scale-[0.98]",
              isSuggestion
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : isTalk
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-violet-600 text-white hover:bg-violet-700"
            )}
          >
            Press to enter board
          </Link>
        </div>
      </div>
    </div>
  )
}
