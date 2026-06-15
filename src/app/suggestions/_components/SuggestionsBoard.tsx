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
import { BoardShell } from '@/app/interact/_components/BoardShell'

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
    <BoardShell
      title="Suggestion archive"
      count={suggestions.length}
      isRefreshing={isRefreshing}
      isLoading={isLoading}
      isAdminMode={isAdminMode}
      setIsAdminMode={setIsAdminMode}
      passcode={passcode}
      setPasscode={setPasscode}
      accent="teal"
      formButtonLabel="suggest something to read, watch, or listen to"
      formComponent={
        <SuggestionForm
          onSubmit={handleSubmit}
          isPending={isPending}
          isCooldownActive={isCooldownActive}
          cooldownLabel={cooldownLabel}
          showNotification={showNotification}
        />
      }
      notification={notification}
      clearNotification={clearNotification}
    >
      {errorMessage && (
        <div className="rounded-lg border border-orange-355 bg-orange-50 px-3 py-2 text-sm text-orange-900 dark:border-orange-500/50 dark:bg-orange-955/20 dark:text-orange-100">
          {errorMessage}
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        >
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
        </motion.div>
      </AnimatePresence>

      {/* Pagination Controls */}
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
    </BoardShell>
  )
}
