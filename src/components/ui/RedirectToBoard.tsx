'use client'

import { useEffect } from 'react'
import { sansFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'

interface RedirectToBoardProps {
  id: string
  type: 'question' | 'prompt'
}

export function RedirectToBoard({ id, type }: RedirectToBoardProps) {
  useEffect(() => {
    // Immediate client-side redirection to the main board with hash
    const destination = type === 'question' ? `/ask#question-${id}` : `/draw#prompt-${id}`
    window.location.replace(destination)
  }, [id, type])

  const accentColor = type === 'question' 
    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20' 
    : 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/10 border-violet-100 dark:border-violet-900/20'

  const loaderColor = type === 'question' ? 'border-blue-500' : 'border-violet-500'

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className={cn(
        "rounded-2xl border p-8 max-w-sm w-full space-y-4 backdrop-blur-sm",
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
            Entering {type === 'question' ? 'Ask board' : 'Draw prompts'}
          </h3>
          <p className={cn(sansFont.className, "text-xs opacity-75")}>
            Locating your shared {type}...
          </p>
        </div>
      </div>
    </div>
  )
}
