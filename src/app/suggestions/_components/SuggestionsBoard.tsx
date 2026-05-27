'use client'

// Cache-buster comment to force a fresh SuggestionsBoard chunk build hash across client devices
import { FormEvent, useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Link as LinkIcon, Loader2, ChevronDown, Info } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/primitives/button'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import Text from '@/components/ui/text/text'
import TextHeading from '@/components/ui/text-heading/text-heading'
import { cn } from '@/lib/utils/utils'
import { sansFont, monoFont } from '@/styles/fonts/fonts'
import { prepareImageForUpload } from '@/lib/images/prepare-upload'
import { MAX_ATTACHMENT_COUNT } from '@/lib/images/attachment-limits'
import { formatBoardDate as formatDate, sortByCreatedAt, type ApiCooldown } from '@/lib/boards/board-utils'
import { useBoardCooldown, useButtonFeedback, useControlledState, useTimedMessage } from '@/lib/boards/board-hooks'
import { AdminLockToggle } from '@/components/ui/admin/AdminLockToggle'
import { AttachmentPreviewGrid } from '@/components/ui/attachments/AttachmentPreviewGrid'
import { AttachmentUploadButton } from '@/components/ui/attachments/AttachmentUploadButton'
import { getAutomaticReference } from '../_utils/reference'
import type { MediaSuggestion, SuggestionCategory, SuggestionReference, SuggestionStatus } from '../_types/suggestion'
import { ReferencePreview } from './ReferencePreview'
import { SuggestionCard } from './SuggestionCard'
import { categories, ITEMS_PER_PAGE, seededSuggestions } from './suggestion-board-config'
import { snapSuggestionCard } from './suggestion-snap'

type FormState = {
  author: string
  title: string
  category: SuggestionCategory
  referenceUrl: string
  note: string
  bestPart: string
}

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
  const [formState, setFormState] = useState<FormState>({
    author: '',
    title: '',
    category: 'manga',
    referenceUrl: '',
    note: '',
    bestPart: ''
  })
  const [suggestions, setSuggestions] = useState<MediaSuggestion[]>(sortByCreatedAt(initialItems))
  const [reference, setReference] = useState<SuggestionReference | undefined>()
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(initialItems.length === 0)
  const [isRefreshing, setIsRefreshing] = useState(initialItems.length > 0)
  const [isPending, startTransition] = useTransition()
  const [isReferenceLoading, setIsReferenceLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { message: notification, showMessage: showNotification, clearMessage: clearNotification } = useTimedMessage()
  const { isCooldownActive, cooldownLabel, applyCooldown } = useBoardCooldown()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Fallback states if not parent-controlled:
  const [showPasscodeInput, setShowPasscodeInput] = useState(false)
  const [activeStatusDropdown, setActiveStatusDropdown] = useState<string | null>(null)

  const [passcode, setPasscode] = useControlledState(parentPasscode, parentSetPasscode, '')
  const [isAdminMode, setIsAdminMode] = useControlledState(parentIsAdminMode, parentSetIsAdminMode, false)

  // Threading / Comments States
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [followingUp, setFollowingUp] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [followUpBody, setFollowUpBody] = useState('')
  const [editBody, setEditBody] = useState('')
  
  // Image attachments for replies/followups
  const [replyImageUrls, setReplyImageUrls] = useState<string[]>([])
  const [followUpImageUrls, setFollowUpImageUrls] = useState<string[]>([])
  const [editImageUrls, setEditImageUrls] = useState<string[]>([])
  
  // Share & Snap Feedback state
  const { feedback: buttonFeedback, showFeedback: showButtonFeedback } = useButtonFeedback()

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isDropdownOpen && !target.closest('.category-dropdown-container')) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isDropdownOpen])

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

  const autoReference = useMemo(() => {
    const title = formState.title.trim()
    if (!title || formState.referenceUrl.trim() || reference) return null
    return getAutomaticReference(title, formState.category)
  }, [formState.title, formState.category, formState.referenceUrl, reference])

  async function handleImageUpload(file: File) {
    try {
      const url = await prepareImageForUpload(file)
      setImageUrls(prev => prev.length >= MAX_ATTACHMENT_COUNT ? prev : [...prev, url])
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Could not attach image.')
    }
  }

  const loadReferenceForUrl = useCallback(async (url: string) => {
    if (!url) return

    setIsReferenceLoading(true)
    setErrorMessage(null)
    try {
      const response = await fetch(`/api/suggestions/reference?url=${encodeURIComponent(url)}`)
      const payload = (await response.json()) as { reference?: SuggestionReference; error?: string }
      if (!response.ok || !payload.reference) {
        throw new Error(payload.error || 'Could not load reference details.')
      }

      setReference(payload.reference)
      if (payload.reference.title) {
        setFormState(prev => prev.title.trim() ? prev : { ...prev, title: payload.reference?.title || prev.title })
      }
      showNotification('Reference details loaded.')
    } catch (error) {
      setReference({ url })
      showNotification(error instanceof Error ? error.message : 'Could not load reference details.')
    } finally {
      setIsReferenceLoading(false)
    }
  }, [showNotification])

  async function loadReference() {
    const url = formState.referenceUrl.trim()
    if (!url) return

    let formattedUrl = url
    if (!/^https?:\/\//i.test(url)) {
      if (url.includes('.') && !url.includes(' ')) {
        formattedUrl = `https://${url}`
      } else {
        const autoRef = getAutomaticReference(url, formState.category)
        formattedUrl = autoRef.url
      }
    }
    loadReferenceForUrl(formattedUrl)
  }

  // Debounced automatic URL reference fetching
  useEffect(() => {
    const url = formState.referenceUrl.trim()
    if (!url) {
      setReference(undefined)
      return
    }

    let formattedUrl = url
    if (!/^https?:\/\//i.test(url)) {
      if (url.includes('.') && !url.includes(' ')) {
        formattedUrl = `https://${url}`
      } else {
        const autoRef = getAutomaticReference(url, formState.category)
        formattedUrl = autoRef.url
      }
    }

    // Basic URL validation
    try {
      new URL(formattedUrl)
    } catch (_error) {
      return
    }

    const timer = setTimeout(() => {
      loadReferenceForUrl(formattedUrl)
    }, 600)

    return () => clearTimeout(timer)
  }, [formState.referenceUrl, formState.category, loadReferenceForUrl])

  async function handleStatusChange(id: string, newStatus: SuggestionStatus) {
    try {
      const response = await fetch('/api/suggestions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, passcode })
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to update suggestion status.')
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = formState.title.trim()
    if (!title || isCooldownActive) return

    const referencePayload = reference || (formState.referenceUrl.trim() ? { url: formState.referenceUrl.trim() } : autoReference || undefined)
    const payload = {
      author: formState.author,
      title,
      category: formState.category,
      note: formState.note.trim() || undefined,
      bestPart: formState.bestPart.trim() || undefined,
      reference: referencePayload,
      imageUrl: imageUrls[0] || undefined,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined
    }

    startTransition(async () => {
      try {
        setErrorMessage(null)
        const response = await fetch('/api/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const result = (await response.json()) as { suggestion?: MediaSuggestion; cooldown?: ApiCooldown; error?: string }
        applyCooldown(result.cooldown)

        if (!response.ok || !result.suggestion) {
          throw new Error(result.error || 'Something went wrong while sending your suggestion.')
        }

        setSuggestions(previous => [result.suggestion as MediaSuggestion, ...previous])
        setFormState({ author: '', title: '', category: 'manga', referenceUrl: '', note: '', bestPart: '' })
        setReference(undefined)
        setImageUrls([])
        setCurrentPage(1)
        showNotification('Suggestion sent successfully!')
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to send your suggestion.')
      }
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

  async function handleReplySubmit(id: string) {
    if (!replyBody.trim()) return

    startTransition(async () => {
      try {
        setErrorMessage(null)
        const response = await fetch('/api/suggestions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            reply: replyBody,
            passcode,
            imageUrl: replyImageUrls[0] || undefined,
            imageUrls: replyImageUrls.length > 0 ? replyImageUrls : undefined
          })
        })

        if (!response.ok) {
          throw new Error('Failed to post reply')
        }

        const { suggestion } = await response.json()
        setSuggestions(prev => prev.map(s => s.id === id ? suggestion : s))
        setReplyingTo(null)
        setReplyBody('')
        setReplyImageUrls([])
        showNotification('Response posted successfully!')
      } catch (error) {
        showNotification('Could not post reply.')
      }
    })
  }

  async function handleFollowUpSubmit(id: string) {
    if (!followUpBody.trim() || isCooldownActive) return

    startTransition(async () => {
      try {
        setErrorMessage(null)
        const response = await fetch('/api/suggestions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            body: followUpBody,
            imageUrl: followUpImageUrls[0] || undefined,
            imageUrls: followUpImageUrls.length > 0 ? followUpImageUrls : undefined
          })
        })

        const result = (await response.json()) as { suggestion?: MediaSuggestion; cooldown?: ApiCooldown; error?: string }
        applyCooldown(result.cooldown)

        if (!response.ok || !result.suggestion) {
          throw new Error(result.error || 'Failed to send follow-up')
        }

        const suggestion = result.suggestion
        setSuggestions(prev => prev.map(s => s.id === id ? suggestion : s))
        setFollowingUp(null)
        setFollowUpBody('')
        setFollowUpImageUrls([])
        showNotification('Follow-up sent!')
      } catch (error) {
        showNotification(error instanceof Error ? error.message : 'Could not send follow-up.')
      }
    })
  }

  async function handleEditSubmit(suggestionId: string, messageId: string) {
    if (!editBody.trim()) return

    startTransition(async () => {
      try {
        setErrorMessage(null)
        const response = await fetch('/api/suggestions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: suggestionId,
            messageId,
            body: editBody,
            passcode,
            imageUrl: editImageUrls[0] || undefined,
            imageUrls: editImageUrls.length > 0 ? editImageUrls : undefined
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update message')
        }

        const { suggestion } = await response.json()
        setSuggestions(prev => prev.map(s => s.id === suggestionId ? suggestion : s))
        setEditingMessageId(null)
        setEditBody('')
        setEditImageUrls([])
        showNotification('Message updated!')
      } catch (error) {
        showNotification('Could not update message.')
      }
    })
  }

  const totalPages = Math.ceil(suggestions.length / ITEMS_PER_PAGE)
  const paginatedSuggestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return suggestions.slice(start, start + ITEMS_PER_PAGE)
  }, [suggestions, currentPage])

  return (
    <StackVertical gap="lg">
      <form
        className="rounded-2xl bg-slate-50 transition-all duration-200 focus-within:bg-slate-100/50 dark:bg-slate-900/60 dark:focus-within:bg-slate-900"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 border-b border-border/60 sm:grid-cols-[1fr_150px]">
          <input
            type="text"
            value={formState.title}
            onChange={(event) => setFormState(state => ({ ...state, title: event.target.value }))}
            placeholder="Title of the book, manga, film, anime, album, song..."
            className={cn(sansFont.className, "min-w-0 border-b border-border/60 bg-transparent px-4 py-3 text-sm font-semibold text-teal-700 placeholder:text-muted-foreground/60 focus:outline-none dark:text-teal-300 sm:border-b-0 sm:border-r")}
            required
          />
          <div className="relative category-dropdown-container w-full sm:w-[150px]">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={cn(
                sansFont.className,
                "flex w-full items-center justify-between bg-transparent px-4 py-3 text-sm font-semibold text-teal-700 dark:text-teal-300 focus:outline-none cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors h-full"
              )}
            >
              <span>{categories.find(c => c.value === formState.category)?.label || formState.category}</span>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.15 }}
                className="text-teal-600 dark:text-teal-400 shrink-0"
              >
                <ChevronDown size={14} />
              </motion.div>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "absolute top-full right-0 z-50 mt-1",
                    "w-full sm:w-[180px]",
                    "bg-white dark:bg-slate-900",
                    "rounded-xl border-2 border-slate-200 dark:border-slate-800",
                    "shadow-lg shadow-slate-100/40 dark:shadow-none",
                    "overflow-hidden py-1"
                  )}
                >
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => {
                        setFormState(state => ({ ...state, category: category.value }))
                        setIsDropdownOpen(false)
                      }}
                      className={cn(
                        sansFont.className,
                        "flex w-full items-center px-4 py-2 text-left text-sm font-semibold transition-colors duration-150",
                        formState.category === category.value 
                          ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      )}
                    >
                      {category.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-1 border-b border-border/60 sm:grid-cols-[1fr_auto]">
          <input
            type="url"
            value={formState.referenceUrl}
            onChange={(event) => {
              setFormState(state => ({ ...state, referenceUrl: event.target.value }))
              setReference(undefined)
            }}
            placeholder="Reference URL (optional, auto-generates if empty)"
            className={cn(sansFont.className, "min-w-0 bg-transparent px-4 py-3 text-sm text-slate-700 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-200")}
          />
          <button
            type="button"
            onClick={loadReference}
            disabled={!formState.referenceUrl.trim() || isReferenceLoading}
            className="flex items-center justify-center gap-2 border-t border-border/60 px-4 py-3 text-xs font-bold text-teal-700 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-teal-300 dark:hover:bg-teal-950/30 sm:border-l sm:border-t-0"
          >
            {isReferenceLoading ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}
            Load info
          </button>
        </div>

        {autoReference && (
          <div className="border-b border-border/60 px-4 py-2.5 bg-teal-50/20 dark:bg-teal-950/5 flex items-center gap-2 text-xs text-slate-500">
            <Info size={14} className="text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Smart link enabled: Will automatically search <strong>{autoReference.siteName}</strong> for <em>"{formState.title}"</em>.</span>
          </div>
        )}

        {reference && (
          <div className="border-b border-border/60 px-4 py-3">
            <ReferencePreview reference={reference} />
          </div>
        )}

        <input
          type="text"
          value={formState.author}
          onChange={(event) => setFormState(state => ({ ...state, author: event.target.value }))}
          placeholder="Your alias (optional)"
          className={cn(sansFont.className, "w-full border-b border-border/60 bg-transparent px-4 py-3 text-sm font-semibold text-teal-700 placeholder:text-muted-foreground/60 focus:outline-none dark:text-teal-300")}
        />

        <textarea
          value={formState.bestPart}
          onChange={(event) => setFormState(state => ({ ...state, bestPart: event.target.value }))}
          placeholder="Best part / chapter / moment / episode / track (optional)"
          rows={2}
          className={cn(sansFont.className, "min-h-[76px] w-full resize-none border-b border-border/60 bg-transparent px-4 py-3 text-sm text-slate-800 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100")}
        />

        <textarea
          value={formState.note}
          onChange={(event) => setFormState(state => ({ ...state, note: event.target.value }))}
          placeholder="Why should I read, watch, or listen to it? Short note is enough."
          rows={4}
          className={cn(sansFont.className, "min-h-[120px] w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-800 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100")}
        />

        <AttachmentPreviewGrid
          urls={imageUrls}
          onRemove={(index) => setImageUrls(prev => prev.filter((_, itemIndex) => itemIndex !== index))}
          alt="Suggestion attachment"
          className={imageUrls.length > 0 ? 'border-t border-border/60 px-4 py-3' : undefined}
          compact
        />

        <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <AttachmentUploadButton
            onFiles={(files) => files.forEach(file => handleImageUpload(file))}
            iconSize={14}
            className="gap-2"
            accent="teal"
          />

          <div className="flex items-center gap-3">
            {errorMessage && (
              <Text size="xs" className="text-rose-500">{errorMessage}</Text>
            )}
            <Button
              type="submit"
              disabled={isPending || !formState.title.trim() || isCooldownActive}
              className="rounded-full bg-teal-700 px-5 text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              title={isCooldownActive ? `You can send another suggestion in ${cooldownLabel}` : undefined}
            >
              {isCooldownActive ? cooldownLabel : isPending ? 'Sending...' : 'Send suggestion'}
            </Button>
          </div>
        </div>
      </form>

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
              editingMessageId={editingMessageId}
              setEditingMessageId={setEditingMessageId}
              editBody={editBody}
              setEditBody={setEditBody}
              editImageUrls={editImageUrls}
              setEditImageUrls={setEditImageUrls}
              onEditSubmit={handleEditSubmit}
              passcode={passcode}
              setPasscode={setPasscode}
              isPending={isPending}
              buttonFeedback={buttonFeedback}
              onShare={shareAndSnap}
              onSnap={snapAndCopy}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyBody={replyBody}
              setReplyBody={setReplyBody}
              replyImageUrls={replyImageUrls}
              setReplyImageUrls={setReplyImageUrls}
              onReplySubmit={handleReplySubmit}
              followingUp={followingUp}
              setFollowingUp={setFollowingUp}
              followUpBody={followUpBody}
              setFollowUpBody={setFollowUpBody}
              followUpImageUrls={followUpImageUrls}
              setFollowUpImageUrls={setFollowUpImageUrls}
              isCooldownActive={isCooldownActive}
              cooldownLabel={cooldownLabel}
              onFollowUpSubmit={handleFollowUpSubmit}
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
