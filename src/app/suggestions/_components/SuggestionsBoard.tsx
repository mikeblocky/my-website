'use client'

// Cache-buster comment to force a fresh SuggestionsBoard chunk build hash across client devices
import { FormEvent, useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import Text from '@/components/ui/text/text'
import TextHeading from '@/components/ui/text-heading/text-heading'
import { cn } from '@/lib/utils/utils'
import { sansFont, monoFont } from '@/styles/fonts/fonts'
import { sortByCreatedAt, type ApiCooldown } from '@/lib/boards/board-utils'
import { useBoardCooldown, useButtonFeedback, useControlledState, useTimedMessage } from '@/lib/boards/board-hooks'
import { AdminLockToggle } from '@/components/ui/admin/AdminLockToggle'
import type { MediaSuggestion, SuggestionCategory, SuggestionReference, SuggestionStatus } from '../_types/suggestion'
import { SuggestionCard } from './SuggestionCard'
import { ITEMS_PER_PAGE, seededSuggestions } from './suggestion-board-config'
import { snapSuggestionCard } from './suggestion-snap'
import { SuggestionForm } from './SuggestionForm'

export function SuggestionsBoard({
  initialItems = seededSuggestions,
  isAdminMode: parentIsAdminMode,
  setIsAdminMode: parentSetIsAdminMode,
  passcode: parentPasscode,
  setPasscode: parentSetPasscode
}: {
  initialItems?: MediaSuggestion[]
  isAdminMode?: boolean
  setIsAdminMode?: (v: boolean) => void
  passcode?: string
  setPasscode?: (v: string) => void
}) {
  const [suggestions, setSuggestions] = useState<MediaSuggestion[]>(sortByCreatedAt(initialItems))
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(initialItems.length === 0)
  const [isRefreshing, setIsRefreshing] = useState(initialItems.length > 0)
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { message: notification, showMessage: showNotification, clearMessage: clearNotification } = useTimedMessage()
  const { isCooldownActive, cooldownLabel, applyCooldown } = useBoardCooldown()

  // Fallback states if not parent-controlled:
  const [showPasscodeInput, setShowPasscodeInput] = useState(false)
  const [activeStatusDropdown, setActiveStatusDropdown] = useState<string | null>(null)

  const [passcode, setPasscode] = useControlledState(parentPasscode, parentSetPasscode, '')
  const [isAdminMode, setIsAdminMode] = useControlledState(parentIsAdminMode, parentSetIsAdminMode, false)

  // Share & Snap Feedback state
  const { feedback: buttonFeedback, showFeedback: showButtonFeedback } = useButtonFeedback()

  // Close status dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (activeStatusDropdown && !target.closest('.status-dropdown-container')) {
        setActiveStatusDropdown(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [activeStatusDropdown])

  async function handleStatusChange(id: string, newStatus: SuggestionStatus) {
    try {
      const response = await fetch('/api/suggestions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, passcode })
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Could not update status.')
      }

      // Update locally
      setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s))
      showNotification(`Status updated to: ${newStatus}`)
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Could not update status.')
    } finally {
      setActiveStatusDropdown(null)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    async function loadSuggestions() {
      try {
        const response = await fetch('/api/suggestions', { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`)
        }

        const payload = (await response.json()) as { suggestions?: MediaSuggestion[]; cooldown?: ApiCooldown }
        if (!cancelled && Array.isArray(payload.suggestions)) {
          setSuggestions(sortByCreatedAt(payload.suggestions))
          applyCooldown(payload.cooldown)
        }
      } catch (error) {
        if (!controller.signal.aborted && !cancelled) {
          console.error('Unable to load suggestions', error)
          showNotification('Unable to refresh suggestions. Showing the cached list.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    }

    loadSuggestions()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [applyCooldown, showNotification])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.location.hash.startsWith('#suggestion-')) {
      return
    }

    const id = window.location.hash.replace('#suggestion-', '')
    const index = suggestions.findIndex(suggestion => suggestion.id === id)
    if (index === -1) return

    setCurrentPage(Math.ceil((index + 1) / ITEMS_PER_PAGE))

    setTimeout(() => {
      const element = document.getElementById(`suggestion-${id}`)
      if (!element) return

      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.classList.add('ring-4', 'ring-teal-500/30', 'border-teal-500')
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-teal-500/30', 'border-teal-500')
      }, 4000)
    }, 600)
  }, [suggestions])

  const handleSubmit = async (payload: {
    title: string
    category: SuggestionCategory
    reference?: SuggestionReference
    author: string
    bestPart: string
    note: string
    imageUrls: string[]
  }) => {
    const postPayload = {
      title: payload.title,
      category: payload.category,
      note: payload.note || undefined,
      bestPart: payload.bestPart || undefined,
      reference: payload.reference,
      imageUrl: payload.imageUrls[0] || undefined,
      imageUrls: payload.imageUrls.length > 0 ? payload.imageUrls : undefined
    }

    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          setErrorMessage(null)
          const response = await fetch('/api/suggestions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postPayload)
          })
          const result = (await response.json()) as { suggestion?: MediaSuggestion; cooldown?: ApiCooldown; error?: string }
          applyCooldown(result.cooldown)

          if (!response.ok || !result.suggestion) {
            throw new Error(result.error || 'Something went wrong while sending your suggestion.')
          }

          setSuggestions(previous => [result.suggestion as MediaSuggestion, ...previous])
          setCurrentPage(1)
          showNotification('Suggestion sent successfully!')
          resolve()
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unable to send your suggestion.'
          setErrorMessage(msg)
          reject(error)
        }
      })
    })
  }

  async function shareAndSnap(id: string) {
    const url = `${window.location.origin}/suggestions/${id}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Media Suggestion',
          text: 'Media suggestion on mikeblocky.com',
          url
        })
      } else {
        await navigator.clipboard.writeText(url)
      }
      showButtonFeedback(`share-${id}`, '✓ Link copied')
    } catch (e) {
      console.error('Share failed', e)
      showButtonFeedback(`share-${id}`, 'Could not share')
    }
  }

  async function snapAndCopy(id: string) {
    try {
      const result = await snapSuggestionCard(id)
      if (result === 'snapped') showButtonFeedback(`snap-${id}`, '✓ Snapped')
      if (result === 'saved') showButtonFeedback(`snap-${id}`, '✓ Saved')
    } catch (e) {
      console.error('Snap failed', e)
      showButtonFeedback(`snap-${id}`, 'Could not snap')
    }
  }

  async function handleReplySubmit(id: string, body: string, imageUrls: string[]) {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          setErrorMessage(null)
          const response = await fetch('/api/suggestions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id,
              reply: body,
              passcode,
              imageUrl: imageUrls[0] || undefined,
              imageUrls: imageUrls.length > 0 ? imageUrls : undefined
            })
          })

          if (!response.ok) {
            throw new Error('Failed to post reply')
          }

          const { suggestion } = await response.json()
          setSuggestions(prev => prev.map(s => s.id === id ? suggestion : s))
          showNotification('Response posted successfully!')
          resolve()
        } catch (error) {
          showNotification('Could not post reply.')
          reject(error)
        }
      })
    })
  }

  async function handleFollowUpSubmit(id: string, body: string, imageUrls: string[]) {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          setErrorMessage(null)
          const response = await fetch('/api/suggestions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id,
              body,
              imageUrl: imageUrls[0] || undefined,
              imageUrls: imageUrls.length > 0 ? imageUrls : undefined
            })
          })

          const result = (await response.json()) as { suggestion?: MediaSuggestion; cooldown?: ApiCooldown; error?: string }
          applyCooldown(result.cooldown)

          if (!response.ok || !result.suggestion) {
            throw new Error(result.error || 'Failed to send follow-up')
          }

          const suggestion = result.suggestion
          setSuggestions(prev => prev.map(s => s.id === id ? suggestion : s))
          showNotification('Follow-up sent!')
          resolve()
        } catch (error) {
          showNotification(error instanceof Error ? error.message : 'Could not send follow-up.')
          reject(error)
        }
      })
    })
  }

  async function handleEditSubmit(suggestionId: string, messageId: string, body: string, imageUrls: string[]) {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          setErrorMessage(null)
          const response = await fetch('/api/suggestions', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: suggestionId,
              messageId,
              body,
              passcode,
              imageUrl: imageUrls[0] || undefined,
              imageUrls: imageUrls.length > 0 ? imageUrls : undefined
            })
          })

          if (!response.ok) {
            throw new Error('Failed to update message')
          }

          const { suggestion } = await response.json()
          setSuggestions(prev => prev.map(s => s.id === suggestionId ? suggestion : s))
          showNotification('Message updated!')
          resolve()
        } catch (error) {
          showNotification('Could not update message.')
          reject(error)
        }
      })
    })
  }

  const totalPages = Math.ceil(suggestions.length / ITEMS_PER_PAGE)
  const paginatedSuggestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return suggestions.slice(start, start + ITEMS_PER_PAGE)
  }, [suggestions, currentPage])

  return (
    <StackVertical gap="lg">
      <SuggestionForm
        onSubmit={handleSubmit}
        isPending={isPending}
        isCooldownActive={isCooldownActive}
        cooldownLabel={cooldownLabel}
        showNotification={showNotification}
      />

      {errorMessage && (
        <div className="rounded-lg border border-orange-350 bg-orange-50 px-3 py-2 text-sm text-orange-900 dark:border-orange-500/50 dark:bg-orange-950/20 dark:text-orange-100">
          {errorMessage}
        </div>
      )}

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border/60 pb-3 sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <TextHeading as="h3" weight="semibold" className="mt-0 mb-0 text-lg">
              Suggestion archive
            </TextHeading>

            <AdminLockToggle
              isAdminMode={isAdminMode}
              setIsAdminMode={setIsAdminMode}
              passcode={passcode}
              setPasscode={setPasscode}
              showPasscodeInput={showPasscodeInput}
              setShowPasscodeInput={setShowPasscodeInput}
              onEnabled={() => showNotification('Admin Mode enabled. You can now toggle suggestion status levels!')}
              accent="teal"
            />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {isRefreshing ? (
              <Text variant="muted" size="xs">
                Refreshing...
              </Text>
            ) : null}
            <Text variant="muted" size="sm" className="whitespace-nowrap">
              {suggestions.length} items collected
            </Text>
          </div>
        </div>

        <div className="grid gap-4">
          {paginatedSuggestions.map(suggestion => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              isAdminMode={isAdminMode}
              activeStatusDropdown={activeStatusDropdown}
              setActiveStatusDropdown={setActiveStatusDropdown}
              onStatusChange={handleStatusChange}
              passcode={passcode}
              setPasscode={setPasscode}
              isPending={isPending}
              buttonFeedback={buttonFeedback}
              onShare={shareAndSnap}
              onSnap={snapAndCopy}
              onReplySubmit={handleReplySubmit}
              onFollowUpSubmit={handleFollowUpSubmit}
              onEditSubmit={handleEditSubmit}
              isCooldownActive={isCooldownActive}
              cooldownLabel={cooldownLabel}
            />
          ))}
        </div>
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 border-t border-border/60 pt-6">
            <button
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-teal-100 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-teal-900/30"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className={cn(monoFont.className, "text-xs text-muted-foreground")}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-teal-100 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-teal-900/30"
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </section>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-2 rounded-xl border border-teal-200 bg-white/95 py-1.5 pl-4 pr-1.5 shadow-sm backdrop-blur-sm dark:border-teal-500/30 dark:bg-[#101a18] md:left-auto md:right-6 md:w-auto md:translate-x-0"
          >
            <div className="h-2 w-2 shrink-0 rounded-full bg-teal-600 dark:bg-teal-300" />
            <span className={cn(sansFont.className, "truncate text-sm text-slate-800 dark:text-slate-200")}>
              {notification}
            </span>
            <button
              onClick={clearNotification}
              className={cn(monoFont.className, "ml-auto rounded-lg border border-teal-100 bg-teal-50/50 px-2 py-0.5 text-xs text-teal-700 hover:bg-teal-100 dark:border-teal-500/20 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-900/50")}
            >
              close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </StackVertical>
  )
}
