'use client'

import { FormEvent, useEffect, useMemo, useState, useTransition } from 'react'
import { BookOpen, Camera, ChevronLeft, ChevronRight, ExternalLink, Link as LinkIcon, Loader2, ChevronDown, Info, Star, Lock, Unlock, Calendar, User, Share2, CornerDownRight, MessageSquareReply, Image as ImageIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/primitives/button'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { RichText } from '@/components/ui/RichText'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import Text from '@/components/ui/text/text'
import TextHeading from '@/components/ui/text-heading/text-heading'
import { cn } from '@/lib/utils/utils'
import { sansFont, monoFont } from '@/styles/fonts/fonts'
import { prepareImageForUpload } from '@/lib/images/prepare-upload'
import { MAX_ATTACHMENT_COUNT } from '@/lib/images/attachment-limits'
import { initialSuggestions } from '../_data/suggestions'
import { getAutomaticReference } from '../_utils/reference'
import type { MediaSuggestion, SuggestionCategory, SuggestionReference, SuggestionStatus } from '../_types/suggestion'

const ITEMS_PER_PAGE = 8
const categories: Array<{ value: SuggestionCategory; label: string }> = [
  { value: 'manga', label: 'Manga' },
  { value: 'anime', label: 'Anime' },
  { value: 'film', label: 'Film' },
  { value: 'series', label: 'Series' },
  { value: 'book', label: 'Book' },
  { value: 'game', label: 'Game' },
  { value: 'music', label: 'Music' },
  { value: 'other', label: 'Other' }
]

const dateFormatter = new Intl.DateTimeFormat('en', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'Asia/Bangkok'
})

type ApiCooldown = {
  expiresAt: string | null
  remainingMs: number
}

type FormState = {
  author: string
  title: string
  category: SuggestionCategory
  referenceUrl: string
  note: string
  bestPart: string
}

const seededSuggestions = [...initialSuggestions].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
)

function sortSuggestions(items: MediaSuggestion[]) {
  return items.slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

function formatDate(iso: string) {
  try {
    return dateFormatter.format(new Date(iso))
  } catch (_error) {
    return iso
  }
}

function formatCooldown(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
  }

  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}

function getStatusConfig(status: SuggestionStatus | undefined, category: SuggestionCategory) {
  if (!status) return null

  const isBook = category === 'book' || category === 'manga'
  const isShow = category === 'anime' || category === 'film' || category === 'series'
  const isMusic = category === 'music'
  const isGame = category === 'game'

  switch (status) {
    case 'planning':
      return {
        label: isBook ? 'Plan to read' : isShow ? 'Plan to watch' : isMusic ? 'Plan to listen' : isGame ? 'Plan to play' : 'Plan to check',
        color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-150'
      }
    case 'progressing':
      return {
        label: isBook ? 'Reading' : isShow ? 'Watching' : isMusic ? 'Listening' : isGame ? 'Playing' : 'Checking',
        color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-150'
      }
    case 'completed':
      return {
        label: isBook ? 'Read' : isShow ? 'Watched' : isMusic ? 'Listened' : isGame ? 'Played' : 'Checked',
        color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-150'
      }
    case 'dropped':
      return {
        label: 'Dropped',
        color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-150'
      }
  }
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
  const [suggestions, setSuggestions] = useState<MediaSuggestion[]>(sortSuggestions(initialItems))
  const [reference, setReference] = useState<SuggestionReference | undefined>()
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(initialItems.length === 0)
  const [isRefreshing, setIsRefreshing] = useState(initialItems.length > 0)
  const [isPending, startTransition] = useTransition()
  const [isReferenceLoading, setIsReferenceLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [cooldownExpiresAt, setCooldownExpiresAt] = useState<string | null>(null)
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Fallback states if not parent-controlled:
  const [localPasscode, localSetPasscode] = useState('')
  const [localIsAdminMode, localSetIsAdminMode] = useState(false)
  const [showPasscodeInput, setShowPasscodeInput] = useState(false)
  const [activeStatusDropdown, setActiveStatusDropdown] = useState<string | null>(null)

  const passcode = parentPasscode !== undefined ? parentPasscode : localPasscode
  const setPasscode = parentSetPasscode !== undefined ? parentSetPasscode : localSetPasscode
  const isAdminMode = parentIsAdminMode !== undefined ? parentIsAdminMode : localIsAdminMode
  const setIsAdminMode = parentSetIsAdminMode !== undefined ? parentSetIsAdminMode : localSetIsAdminMode

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
  const [buttonFeedback, setButtonFeedback] = useState<Record<string, string>>({})

  const isCooldownActive = cooldownRemainingMs > 0

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

  const cooldownLabel = formatCooldown(cooldownRemainingMs)

  const autoReference = useMemo(() => {
    const title = formState.title.trim()
    if (!title || formState.referenceUrl.trim() || reference) return null
    return getAutomaticReference(title, formState.category)
  }, [formState.title, formState.category, formState.referenceUrl, reference])

  function applyCooldown(cooldown?: ApiCooldown | null) {
    if (!cooldown?.expiresAt || cooldown.remainingMs <= 0) {
      setCooldownExpiresAt(null)
      setCooldownRemainingMs(0)
      return
    }

    setCooldownExpiresAt(cooldown.expiresAt)
    setCooldownRemainingMs(cooldown.remainingMs)
  }

  function showNotification(message: string) {
    setNotification(message)
    setTimeout(() => {
      setNotification((current) => current === message ? null : current)
    }, 4000)
  }

  async function handleImageUpload(file: File) {
    try {
      const url = await prepareImageForUpload(file)
      setImageUrls(prev => prev.length >= MAX_ATTACHMENT_COUNT ? prev : [...prev, url])
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Could not attach image.')
    }
  }

  async function loadReferenceForUrl(url: string) {
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
      if (!formState.title.trim() && payload.reference.title) {
        setFormState(prev => ({ ...prev, title: payload.reference?.title || prev.title }))
      }
      showNotification('Reference details loaded.')
    } catch (error) {
      setReference({ url })
      showNotification(error instanceof Error ? error.message : 'Could not load reference details.')
    } finally {
      setIsReferenceLoading(false)
    }
  }

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
  }, [formState.referenceUrl, formState.category])

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
    if (!cooldownExpiresAt) return

    const tick = () => {
      const remaining = Math.max(0, new Date(cooldownExpiresAt).getTime() - Date.now())
      setCooldownRemainingMs(remaining)
      if (remaining === 0) {
        setCooldownExpiresAt(null)
      }
    }

    tick()
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [cooldownExpiresAt])

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
          setSuggestions(sortSuggestions(payload.suggestions))
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
  }, [])

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

  function showButtonFeedback(key: string, message: string) {
    setButtonFeedback(prev => ({ ...prev, [key]: message }))
    setTimeout(() => {
      setButtonFeedback(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }, 2000)
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
    const element = document.getElementById(`suggestion-${id}`)
    if (!element) return

    const url = `${window.location.origin}/suggestions/${id}`
    const isDark = document.documentElement.classList.contains('dark')
    const actionsDiv = element.querySelector('.suggestion-actions') as HTMLElement
    if (actionsDiv) actionsDiv.style.visibility = 'hidden'

    const moreOverlays = element.querySelectorAll('.gallery-more-overlay') as NodeListOf<HTMLElement>;
    const zoomOverlays = element.querySelectorAll('.gallery-zoom-overlay') as NodeListOf<HTMLElement>;
    moreOverlays.forEach(el => el.style.display = 'none');
    zoomOverlays.forEach(el => el.style.display = 'none');

    const linkBar = document.createElement('div')
    linkBar.style.cssText = `margin-top:12px;padding-top:10px;border-top:1px solid ${isDark ? '#ffffff15' : '#00000010'};font-size:12px;color:${isDark ? '#94a3b8' : '#64748b'};font-family:system-ui,sans-serif;letter-spacing:0.02em;`
    linkBar.textContent = `Link: ${url}`
    element.appendChild(linkBar)

    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(element, {
        backgroundColor: isDark ? '#1a1525' : '#ffffff',
        style: {
          borderRadius: '16px',
          border: isDark ? '1px solid #3b2d5a' : '1px solid #e2e8f0',
          boxShadow: 'none',
          padding: '24px',
          margin: '0',
          display: 'block',
          color: isDark ? '#f1f5f9' : '#0f172a'
        }
      })
      const res = await fetch(dataUrl)
      const blob = await res.blob()

      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        showButtonFeedback(`snap-${id}`, '✓ Snapped')
      } catch (err) {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `suggestion-${id}.png`
        a.click()
        showButtonFeedback(`snap-${id}`, '✓ Saved')
      }
    } catch (e) {
      console.error('Snap failed', e)
      showButtonFeedback(`snap-${id}`, 'Could not snap')
    } finally {
      if (actionsDiv) actionsDiv.style.visibility = ''
      moreOverlays.forEach(el => el.style.display = '');
      zoomOverlays.forEach(el => el.style.display = '');
      linkBar.remove()
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

        {imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-border/60 px-4 py-3">
            {imageUrls.map((url, index) => (
              <div key={url} className="relative rounded-lg border border-border bg-muted/40 p-0.5">
                <img src={url} alt="Suggestion attachment" className="h-16 w-24 rounded object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrls(prev => prev.filter((_, itemIndex) => itemIndex !== index))}
                  className="absolute right-1 top-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold leading-none text-white hover:bg-rose-600"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-500 hover:text-teal-600 dark:hover:text-teal-300">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                const files = event.target.files
                if (files) {
                  Array.from(files).forEach(file => handleImageUpload(file))
                }
                event.target.value = ''
              }}
            />
            <Camera size={14} />
            Attach images
          </label>

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

            {/* Elegant admin passcode lock toggle */}
            <div className="flex items-center gap-1.5 ml-2">
              <button
                type="button"
                onClick={() => {
                  if (isAdminMode) {
                    setIsAdminMode(false)
                    setPasscode('')
                  } else {
                    setShowPasscodeInput(!showPasscodeInput)
                  }
                }}
                className={cn(
                  "rounded-full p-1.5 transition-colors duration-150 flex items-center justify-center hover:bg-slate-200/50 dark:hover:bg-slate-800/40 text-slate-400 hover:text-teal-650 dark:hover:text-teal-350",
                  isAdminMode && "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20"
                )}
                title={isAdminMode ? "Disable Admin Mode" : "Enable Admin Mode"}
              >
                {isAdminMode ? <Unlock size={14} /> : <Lock size={14} />}
              </button>

              <AnimatePresence>
                {showPasscodeInput && !isAdminMode && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 90, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="overflow-hidden flex items-center"
                  >
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value)
                        // Auto lock check
                        if (e.target.value.length >= 4) {
                          setIsAdminMode(true)
                          setShowPasscodeInput(false)
                          showNotification('Admin Mode enabled. You can now toggle suggestion status levels!')
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsAdminMode(true)
                          setShowPasscodeInput(false)
                          showNotification('Admin Mode enabled. You can now toggle suggestion status levels!')
                        }
                      }}
                      placeholder="Passcode"
                      className="w-20 rounded-md border border-slate-200 bg-background px-2 py-0.5 text-[10px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-800 dark:text-slate-100"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
          {paginatedSuggestions.map(suggestion => {
            const thread = suggestion.thread || []
            const lastRole = thread.length > 0 ? thread[thread.length - 1].role : null
            const canFollowUp = lastRole === 'admin'
            const canReply = isAdminMode

            // Card status styles
            let cardBgStyles = "bg-slate-50 dark:bg-slate-900/45 hover:bg-slate-100/50 dark:hover:bg-slate-900/70 border border-transparent"
            if (suggestion.status === 'planning') {
              cardBgStyles = "bg-blue-50/40 dark:bg-blue-950/15 border border-blue-100/50 dark:border-blue-900/20 hover:bg-blue-50/60 dark:hover:bg-blue-950/20"
            } else if (suggestion.status === 'progressing') {
              cardBgStyles = "bg-amber-50/40 dark:bg-amber-950/15 border border-amber-100/50 dark:border-amber-900/20 hover:bg-amber-50/60 dark:hover:bg-amber-950/20"
            } else if (suggestion.status === 'completed') {
              cardBgStyles = "bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-100/50 dark:border-emerald-900/20 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20"
            } else if (suggestion.status === 'dropped') {
              cardBgStyles = "bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100/30 dark:border-rose-900/15 hover:bg-rose-50/40 dark:hover:bg-rose-950/15"
            }

            return (
              <article
                id={`suggestion-${suggestion.id}`}
                key={suggestion.id}
                className={cn("group relative rounded-2xl p-6 transition-all duration-200 shadow-none text-left", cardBgStyles)}
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  {suggestion.reference?.image && (
                    <img
                      src={suggestion.reference.image}
                      alt=""
                      className="h-32 w-full rounded-xl object-cover sm:w-28"
                    />
                  )}
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                          {suggestion.category}
                        </span>
                        <span className={cn(monoFont.className, "text-[11px] text-muted-foreground")}>
                          {formatDate(suggestion.createdAt)}
                        </span>

                        {/* Dynamic status levels dropdown picker */}
                        {(() => {
                          const config = getStatusConfig(suggestion.status, suggestion.category)
                          if (!config && !isAdminMode) return null

                          return (
                            <div className="relative status-dropdown-container">
                               <button
                                type="button"
                                disabled={!isAdminMode}
                                onClick={() => setActiveStatusDropdown(activeStatusDropdown === suggestion.id ? null : suggestion.id)}
                                className={cn(
                                  "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all select-none",
                                  config
                                    ? `${config.color} border-slate-200/50 dark:border-slate-800/50`
                                    : "border-dashed border-slate-350 dark:border-slate-700 bg-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-305 hover:bg-slate-100/50 dark:hover:bg-slate-900/50",
                                  isAdminMode && "cursor-pointer hover:scale-102 hover:shadow-xs active:scale-98"
                                )}
                              >
                                <span>{config ? config.label : 'Add Level'}</span>
                                {isAdminMode && <ChevronDown size={10} className="text-slate-400" />}
                              </button>

                              <AnimatePresence>
                                {activeStatusDropdown === suggestion.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.12 }}
                                    className="absolute left-0 z-50 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-950"
                                  >
                                    {(['planning', 'progressing', 'completed', 'dropped'] as SuggestionStatus[]).map((st) => {
                                      const stConf = getStatusConfig(st, suggestion.category)
                                      return (
                                        <button
                                          key={st}
                                          type="button"
                                          onClick={() => handleStatusChange(suggestion.id, st)}
                                          className={cn(
                                            "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-colors",
                                            suggestion.status === st
                                              ? "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                              : "text-slate-650 hover:bg-slate-55 dark:text-slate-350 dark:hover:bg-slate-900/50"
                                          )}
                                        >
                                          <span>{stConf?.label}</span>
                                        </button>
                                      )
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )
                        })()}
                      </div>
                      <h3 className={cn(sansFont.className, "break-words text-lg font-bold text-slate-950 dark:text-slate-50")}>
                        {suggestion.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        suggested by <span className="font-semibold text-teal-700 dark:text-teal-300">{suggestion.author || 'anonymous'}</span>
                      </p>
                    </div>

                    {suggestion.reference && (
                      <ReferencePreview reference={suggestion.reference} compact />
                    )}

                    {suggestion.bestPart && (
                      <div className="rounded-xl bg-amber-50/70 px-3 py-2 dark:bg-amber-950/15">
                        <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <Star size={13} className="fill-amber-500/20 text-amber-600 dark:text-amber-400" />
                          Best part
                        </div>
                        <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                          <RichText text={suggestion.bestPart} theme="blue" />
                        </div>
                      </div>
                    )}

                    {suggestion.note && (
                      <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        <RichText text={suggestion.note} theme="blue" />
                      </div>
                    )}

                    <ImageGallery
                      urls={suggestion.imageUrls?.length ? suggestion.imageUrls : (suggestion.imageUrl ? [suggestion.imageUrl] : [])}
                      theme="teal"
                    />

                    {/* Thread messages */}
                    {thread.length > 0 && (
                      <div className="mt-6 space-y-4 border-t border-border/60 pt-4">
                        {thread.map((msg, index) => (
                          <ThreadBubble
                            key={msg.id}
                            message={msg}
                            depth={index}
                            author={suggestion.author}
                            suggestionId={suggestion.id}
                            isEditing={editingMessageId === msg.id}
                            editBody={editBody}
                            setEditBody={setEditBody}
                            editImageUrls={editImageUrls}
                            setEditImageUrls={setEditImageUrls}
                            onEditClick={() => {
                              setEditingMessageId(msg.id)
                              setEditBody(msg.body)
                              setEditImageUrls(msg.imageUrls || (msg.imageUrl ? [msg.imageUrl] : []))
                            }}
                            onCancel={() => {
                              setEditingMessageId(null)
                              setEditBody('')
                              setEditImageUrls([])
                            }}
                            onSave={() => handleEditSubmit(suggestion.id, msg.id)}
                            passcode={passcode}
                            setPasscode={setPasscode}
                            isPending={isPending}
                          />
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="suggestion-actions mt-4 flex flex-wrap gap-2.5 sm:justify-end opacity-100 transition-all">
                      <button
                        type="button"
                        onClick={() => shareAndSnap(suggestion.id)}
                        className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/50 hover:bg-slate-200/50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900 px-4.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-650 dark:text-slate-350 hover:text-teal-655 dark:hover:text-teal-355 hover:border-teal-300 dark:hover:border-teal-500/50 shadow-sm transition-all"
                      >
                        <Share2 size={15} />
                        {buttonFeedback[`share-${suggestion.id}`] || 'Share'}
                      </button>
                      <button
                        type="button"
                        onClick={() => snapAndCopy(suggestion.id)}
                        className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/50 hover:bg-slate-200/50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900 px-4.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-650 dark:text-slate-350 hover:text-teal-655 dark:hover:text-teal-355 hover:border-teal-300 dark:hover:border-teal-500/50 shadow-sm transition-all"
                      >
                        <Camera size={15} />
                        {buttonFeedback[`snap-${suggestion.id}`] || 'Snap'}
                      </button>
                      {canFollowUp && (
                        <button
                          type="button"
                          onClick={() => {
                             setFollowingUp(followingUp === suggestion.id ? null : suggestion.id)
                             setFollowUpBody('')
                             setFollowUpImageUrls([])
                             setReplyingTo(null)
                          }}
                          className="flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/70 hover:bg-emerald-100/80 px-4.5 py-2.5 text-xs sm:text-sm font-semibold text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/15 shadow-sm transition-all animate-in zoom-in-95 duration-200"
                        >
                          <CornerDownRight size={15} />
                          Follow up
                        </button>
                      )}
                      {canFollowUp && canReply && (
                        <span className="text-xs text-muted-foreground self-center px-1 font-medium select-none pointer-events-none">
                          or
                        </span>
                      )}
                      {canReply && (
                        <button
                          type="button"
                          onClick={() => {
                             setReplyingTo(replyingTo === suggestion.id ? null : suggestion.id)
                             setReplyBody('')
                             setReplyImageUrls([])
                             setFollowingUp(null)
                          }}
                          className="flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/70 hover:bg-blue-100/80 px-4.5 py-2.5 text-xs sm:text-sm font-semibold text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/15 shadow-sm transition-all"
                        >
                          <MessageSquareReply size={15} />
                          Reply (Admin)
                        </button>
                      )}
                    </div>

                    {/* Admin reply form */}
                    {replyingTo === suggestion.id && (
                      <div className="mt-3 border-t border-border/60 pt-3">
                        <textarea
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          onInput={(e) => {
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                          }}
                          placeholder="Write your response..."
                          className={cn(
                            sansFont.className,
                            "min-h-[100px] w-full resize-none overflow-hidden rounded-xl border border-blue-200 bg-background px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-blue-500/30 dark:text-slate-100"
                          )}
                        />
                        {replyImageUrls.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {replyImageUrls.map((url, idx) => (
                              <div key={idx} className="relative group/thumb border border-border bg-muted/40 p-0.5 rounded-lg">
                                <img src={url} alt="Attachment thumbnail" className="rounded max-h-16 w-24 object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setReplyImageUrls(prev => prev.filter((_, i) => i !== idx))}
                                  className="absolute top-1 right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 text-[8px] leading-none transition-colors"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between items-center gap-2 mt-3.5">
                          <label className="flex items-center gap-1 cursor-pointer text-slate-500 hover:text-blue-500 text-xs font-semibold select-none">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={async (e) => {
                                const files = e.target.files
                                if (files) {
                                  for (const file of Array.from(files)) {
                                    try {
                                      const url = await prepareImageForUpload(file)
                                      setReplyImageUrls(prev => prev.length >= MAX_ATTACHMENT_COUNT ? prev : [...prev, url])
                                    } catch (err) {
                                      console.error(err)
                                    }
                                  }
                                }
                                e.target.value = ''
                              }}
                              className="hidden"
                            />
                            <ImageIcon size={12} />
                            Attach images
                          </label>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              type="button"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyBody('')
                                setReplyImageUrls([])
                              }}
                              className="text-xs h-8"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              type="button"
                              disabled={isPending || !replyBody.trim()}
                              onClick={() => handleReplySubmit(suggestion.id)}
                              className="h-8 rounded-full px-4 text-xs bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Send response
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Visitor follow-up form */}
                    {followingUp === suggestion.id && (
                      <div className="mt-3 border-t border-border/60 pt-3">
                        <textarea
                          value={followUpBody}
                          onChange={(e) => setFollowUpBody(e.target.value)}
                          onInput={(e) => {
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                          }}
                          placeholder="Write your follow-up message..."
                          className={cn(
                            sansFont.className,
                            "min-h-[100px] w-full resize-none overflow-hidden rounded-xl border border-emerald-200 bg-background px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:border-emerald-500/30 dark:text-slate-100"
                          )}
                        />
                        {followUpImageUrls.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {followUpImageUrls.map((url, idx) => (
                              <div key={idx} className="relative group/thumb border border-border bg-muted/40 p-0.5 rounded-lg">
                                <img src={url} alt="Attachment thumbnail" className="rounded max-h-16 w-24 object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setFollowUpImageUrls(prev => prev.filter((_, i) => i !== idx))}
                                  className="absolute top-1 right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 text-[8px] leading-none transition-colors"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between items-center gap-2 mt-3.5">
                          <label className="flex items-center gap-1 cursor-pointer text-slate-500 hover:text-emerald-500 text-xs font-semibold select-none">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={async (e) => {
                                const files = e.target.files
                                if (files) {
                                  for (const file of Array.from(files)) {
                                    try {
                                      const url = await prepareImageForUpload(file)
                                      setFollowUpImageUrls(prev => prev.length >= MAX_ATTACHMENT_COUNT ? prev : [...prev, url])
                                    } catch (err) {
                                      console.error(err)
                                    }
                                  }
                                }
                                e.target.value = ''
                              }}
                              className="hidden"
                            />
                            <ImageIcon size={12} />
                            Attach images
                          </label>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              type="button"
                              size="sm"
                              onClick={() => {
                                setFollowingUp(null)
                                setFollowUpBody('')
                                setFollowUpImageUrls([])
                              }}
                              className="text-xs h-8"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              type="button"
                              disabled={isPending || !followUpBody.trim() || isCooldownActive}
                              onClick={() => handleFollowUpSubmit(suggestion.id)}
                              className="h-8 rounded-full px-4 text-xs bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {isCooldownActive ? cooldownLabel : 'Send message'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
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
              onClick={() => setNotification(null)}
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

function ReferencePreview({ reference, compact = false }: { reference: SuggestionReference; compact?: boolean }) {
  const hasMeta = reference.author || reference.releaseDate || reference.episodes || reference.chapters || reference.rating

  return (
    <div className={cn(
      "flex flex-col sm:flex-row min-w-0 gap-4 rounded-xl bg-teal-50/45 p-4 dark:bg-teal-950/10 border border-teal-100/40 dark:border-teal-950/20",
      compact && "bg-slate-100/40 dark:bg-slate-900/50 p-3 sm:p-4 border-0"
    )}>
      {reference.image && (
        <img
          src={reference.image}
          alt=""
          className={cn(
            "h-28 w-full shrink-0 rounded-lg object-cover sm:w-20 sm:h-20 shadow-sm border border-slate-200/40 dark:border-slate-800/40",
            compact && "h-20 w-16 sm:w-16"
          )}
        />
      )}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <LinkIcon size={12} className="shrink-0 text-teal-600 dark:text-teal-400" />
            {reference.url ? (
              <a
                href={reference.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-w-0 items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-teal-700 hover:underline dark:text-teal-300"
              >
                <span className="truncate">{reference.siteName || 'Link'}</span>
                <ExternalLink size={10} className="shrink-0" />
              </a>
            ) : (
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">Reference</span>
            )}
          </div>

          {reference.rating && (
            <div className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <Star size={10} className="fill-amber-500 text-amber-600 dark:text-amber-400" />
              <span>{reference.rating}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          {reference.title && (
            <p className="line-clamp-2 text-sm font-bold text-slate-800 dark:text-slate-100">
              {reference.title}
            </p>
          )}

          {/* Metadata Badges Row */}
          {hasMeta && (
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-0.5">
              {reference.author && (
                <span className="flex items-center gap-1">
                  <User size={11} className="text-teal-600/70" />
                  <span className="truncate max-w-[120px]" title={reference.author}>{reference.author}</span>
                </span>
              )}
              {reference.releaseDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={11} className="text-teal-600/70" />
                  <span>{reference.releaseDate}</span>
                </span>
              )}
              {reference.episodes && (
                <span className="flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.25 text-[10px] font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                  {reference.episodes} eps
                </span>
              )}
              {reference.chapters && (
                <span className="flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.25 text-[10px] font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                  {reference.chapters}
                </span>
              )}
            </div>
          )}

          {reference.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground pt-0.5">
              {reference.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/** A single thread message rendered as a layered bubble */
function ThreadBubble({ 
  message, 
  depth, 
  author,
  suggestionId,
  isEditing,
  editBody,
  setEditBody,
  editImageUrls,
  setEditImageUrls,
  onEditClick,
  onCancel,
  onSave,
  passcode,
  setPasscode,
  isPending
}: { 
  message: import('../_types/suggestion').SuggestionThreadMessage; 
  depth: number; 
  author?: string;
  suggestionId: string;
  isEditing: boolean;
  editBody: string;
  setEditBody: (v: string) => void;
  editImageUrls: string[];
  setEditImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
  onEditClick: () => void;
  onCancel: () => void;
  onSave: () => void;
  passcode: string;
  setPasscode: (v: string) => void;
  isPending: boolean;
}) {
  const isAdmin = message.role === 'admin'
  const indentClass = [
    "ml-2 sm:ml-4",
    "ml-3 sm:ml-8",
    "ml-4 sm:ml-12",
    "ml-5 sm:ml-16"
  ][Math.min(depth, 3)];

  const handleImageUpload = async (file: File, callback: (url: string) => void) => {
    try {
      callback(await prepareImageForUpload(file))
    } catch (error) {
      console.error('Could not attach image', error)
    }
  }

  return (
    <div
      style={{ marginLeft: isEditing ? '0px' : undefined }}
      className={cn(
        "group/bubble relative rounded-xl transition-all duration-300 p-4 border-0 shadow-none text-base text-left",
        indentClass,
        isAdmin
          ? "bg-blue-50/45 dark:bg-blue-950/20 text-slate-800 dark:text-slate-200"
          : "bg-emerald-50/45 dark:bg-emerald-950/20 text-slate-800 dark:text-slate-200",
        isEditing && "ring-2 ring-blue-500/20"
      )}
    >
      {!isEditing && (
        <div 
          className={cn(
            "hidden sm:block absolute -left-4 top-[-16px] bottom-1/2 w-4 border-l-2 border-b-2 rounded-bl-lg pointer-events-none",
            isAdmin 
              ? "border-blue-200/70 dark:border-blue-500/20" 
              : "border-emerald-200/70 dark:border-emerald-500/20"
          )}
        />
      )}
      <div className="flex items-center gap-2 mb-1.5 overflow-hidden">
        <CornerDownRight size={12} className={isAdmin ? "text-blue-400" : "text-emerald-400"} />
        <span className={cn(
          sansFont.className,
          "text-xs font-bold",
          isAdmin ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"
        )}>
          {isAdmin ? 'Response' : (author || 'anonymous')}
        </span>
        
        <div className="ml-auto flex items-center gap-2">
          <span className={cn(
            sansFont.className, 
            "text-[11px] text-muted-foreground whitespace-nowrap transition-transform duration-300",
            isAdmin && !isEditing && "group-hover/bubble:-translate-x-1"
          )}>
            {formatDate(message.createdAt)}
          </span>
          {isAdmin && !isEditing && (
            <div className="w-0 overflow-hidden opacity-0 group-hover/bubble:w-8 group-hover/bubble:opacity-100 transition-all duration-300">
              <button 
                onClick={onEditClick}
                className="text-[10px] font-bold uppercase tracking-wider text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            onInput={(e) => {
              e.currentTarget.style.height = 'auto';
              e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
            }}
            rows={Math.max(3, message.body.split('\n').length)}
            autoFocus
            className={cn(sansFont.className, "min-h-[100px] w-full resize-none overflow-hidden rounded-lg border border-blue-200 bg-background px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-blue-500/30 dark:text-slate-100")}
          />
          {editImageUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2.5">
              {editImageUrls.map((url, idx) => (
                <div key={idx} className="relative group/thumb border border-border bg-muted/40 p-0.5 rounded-lg animate-in zoom-in-95">
                  <img src={url} alt="Edit attachment" className="rounded max-h-16 w-24 object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setEditImageUrls(prev => prev.filter((_, i) => i !== idx))} 
                    className="absolute top-1 right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 text-[8px] leading-none transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-3">
              <input 
                type="password"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Passcode"
                className="w-24 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:text-slate-100"
              />
              <label className="flex items-center gap-1 cursor-pointer text-slate-500 hover:text-blue-500 text-xs font-semibold select-none">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={e => {
                    const files = e.target.files
                    if (files) {
                      Array.from(files).forEach(file => {
                        handleImageUpload(file, (url) => setEditImageUrls(prev => prev.length >= MAX_ATTACHMENT_COUNT ? prev : [...prev, url]))
                      })
                    }
                    e.target.value = ''
                  }} 
                  className="hidden" 
                />
                <ImageIcon size={12} />
                Attach images
              </label>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs h-8">
                Cancel
              </Button>
              <Button size="sm" disabled={isPending || !editBody.trim()} onClick={onSave} className="h-8 rounded-full px-4 text-xs bg-blue-600 text-white hover:bg-blue-700">
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={cn(sansFont.className, "text-base text-slate-700 dark:text-slate-300 leading-relaxed break-words")}>
            <RichText text={message.body} theme="blue" />
          </div>
          <ImageGallery 
            urls={message.imageUrls?.length ? message.imageUrls : (message.imageUrl ? [message.imageUrl] : [])} 
            theme="blue"
          />
        </>
      )}
    </div>
  )
}
