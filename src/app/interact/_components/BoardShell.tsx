'use client'

import { useState, ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils/utils'
import { monoFont, sansFont } from '@/styles/fonts/fonts'
import { AdminLockToggle } from '@/components/ui/admin/AdminLockToggle'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'

interface BoardShellProps {
  title: string
  count: number
  isRefreshing?: boolean
  isLoading?: boolean
  isAdminMode: boolean
  setIsAdminMode: (v: boolean) => void
  passcode: string
  setPasscode: (v: string) => void
  accent: 'blue' | 'violet' | 'teal'
  formButtonLabel: string
  formComponent: ReactNode
  children: ReactNode
  notification: string | null
  clearNotification: () => void
  singleMode?: boolean
}

export function BoardShell({
  title,
  count,
  isRefreshing = false,
  isLoading = false,
  isAdminMode,
  setIsAdminMode,
  passcode,
  setPasscode,
  accent,
  formButtonLabel,
  formComponent,
  children,
  notification,
  clearNotification,
  singleMode = false
}: BoardShellProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [showPasscodeInput, setShowPasscodeInput] = useState(false)

  // Color mapping based on accent
  const accentClasses = {
    blue: {
      border: 'border-blue-200/50 dark:border-blue-800/40',
      text: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50/10 dark:bg-blue-950/5 hover:bg-blue-50/20 dark:hover:bg-blue-950/10',
      hoverBorder: 'hover:border-blue-400',
      toastBorder: 'border-blue-200 dark:border-blue-500/30',
      toastBg: 'bg-white/95 dark:bg-[#1a1525]',
      toastDot: 'bg-blue-600 dark:bg-blue-400',
      toastButton: 'border-blue-100 bg-blue-50/50 text-blue-600 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
    },
    violet: {
      border: 'border-violet-200/50 dark:border-violet-850/40',
      text: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50/10 dark:bg-violet-950/5 hover:bg-violet-50/20 dark:hover:bg-violet-950/10',
      hoverBorder: 'hover:border-violet-400',
      toastBorder: 'border-violet-200 dark:border-violet-500/30',
      toastBg: 'bg-white/95 dark:bg-[#181124]',
      toastDot: 'bg-violet-600 dark:bg-violet-400',
      toastButton: 'border-violet-100 bg-violet-50/50 text-violet-600 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50'
    },
    teal: {
      border: 'border-teal-200/50 dark:border-teal-800/40',
      text: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50/10 dark:bg-teal-950/5 hover:bg-teal-50/20 dark:hover:bg-teal-950/10',
      hoverBorder: 'hover:border-teal-400',
      toastBorder: 'border-teal-200 dark:border-teal-500/30',
      toastBg: 'bg-white/95 dark:bg-[#101a18]',
      toastDot: 'bg-teal-600 dark:bg-teal-300',
      toastButton: 'border-teal-100 bg-teal-50/50 text-teal-700 hover:bg-teal-100 dark:border-teal-500/20 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-900/50'
    }
  }[accent]

  const handleFormSubmitSuccess = () => {
    setIsFormOpen(false)
  }

  // Intercept formComponent submit behavior to collapse it
  const formWithCallback = formComponent ? (
    <div onSubmit={handleFormSubmitSuccess}>
      {formComponent}
    </div>
  ) : null

  return (
    <div className="space-y-8">
      {/* ────────────────── COLLAPSIBLE FORM CONTAINER ────────────────── */}
      {!singleMode && formComponent && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className={cn(
              monoFont.className,
              "w-full py-4 px-4 rounded-xl border border-dashed text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200 shadow-sm",
              isFormOpen
                ? "border-slate-350 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/10 text-slate-500"
                : cn(accentClasses.border, accentClasses.text, accentClasses.bg, accentClasses.hoverBorder)
            )}
          >
            <span>{isFormOpen ? "✕ close form" : formButtonLabel}</span>
          </button>

          <AnimatePresence initial={false}>
            {isFormOpen && (
              <motion.div
                key="form-expanded-container"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  {formWithCallback}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ────────────────── BOARD HEADER & ARCHIVE ────────────────── */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border/60 pb-3 sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <TextHeading as="h3" weight="semibold" className="mt-0 mb-0 text-lg">
              {title}
            </TextHeading>

            <AdminLockToggle
              isAdminMode={isAdminMode}
              setIsAdminMode={setIsAdminMode}
              passcode={passcode}
              setPasscode={setPasscode}
              showPasscodeInput={showPasscodeInput}
              setShowPasscodeInput={setShowPasscodeInput}
              onEnabled={() => {}}
              accent={accent}
            />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {isRefreshing ? (
              <Text variant="muted" size="xs">
                Refreshing...
              </Text>
            ) : null}
            <Text variant="muted" size="sm" className="whitespace-nowrap">
              {count} {accent === 'violet' && title.toLowerCase().includes('artwork') ? 'artworks' : 'posts'} collected
            </Text>
          </div>
        </div>

        {/* Content list */}
        {children}
      </section>

      {/* ────────────────── UNIFIED TOAST NOTIFICATION ────────────────── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: -20, scale: 0.95, x: '-50%' }}
            className={cn(
              "fixed top-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-2.5 rounded-xl border py-2 pl-4 pr-1.5 shadow-lg shadow-black/5 dark:shadow-black/25 backdrop-blur-md",
              accentClasses.toastBorder,
              accentClasses.toastBg
            )}
          >
            <div className={cn("h-2.5 w-2.5 shrink-0 rounded-full", accentClasses.toastDot)} />
            <span className={cn(sansFont.className, "truncate text-xs font-medium text-slate-800 dark:text-slate-200")}>
              {notification}
            </span>
            <button
              onClick={clearNotification}
              className={cn(monoFont.className, "ml-auto rounded-lg border px-2 py-0.5 text-[10px] font-bold transition-all", accentClasses.toastButton)}
            >
              close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
