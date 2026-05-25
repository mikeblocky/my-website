'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { sansFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'

interface RedirectToBoardProps {
  id: string
  type: 'talk' | 'question' | 'prompt'
}

export function RedirectToBoard({ id, type }: RedirectToBoardProps) {
  const destination = type === 'talk' || type === 'question' 
    ? `/interact?tab=guestbook#talk-${id}` 
    : `/interact?tab=prompts#prompt-${id}`

  useEffect(() => {
    // Immediate client-side redirection to the main board with hash
    window.location.replace(destination)
  }, [destination])

  const accentColor = type === 'talk' || type === 'question' 
    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20' 
    : 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/10 border-violet-100 dark:border-violet-900/20'

  const loaderColor = type === 'talk' || type === 'question' ? 'border-blue-500' : 'border-violet-500'

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className={cn(
        "rounded-2xl border p-8 max-w-sm w-full space-y-5 backdrop-blur-sm shadow-xl shadow-slate-100/50 dark:shadow-none bg-white dark:bg-slate-950/80",
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
          <h3 className={cn(sansFont.className, "text-sm font-bold")}>
            Entering {type === 'talk' || type === 'question' ? 'Talk board' : 'Draw prompts'}
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
              "block w-full py-3 px-6 text-sm font-bold rounded-xl text-center transition-all duration-200 shadow-sm border border-transparent",
              type === 'talk' || type === 'question'
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/10"
                : "bg-violet-600 text-white hover:bg-violet-700 shadow-violet-500/10"
            )}
          >
            Press to enter board
          </Link>
        </div>
      </div>
    </div>
  )
}
