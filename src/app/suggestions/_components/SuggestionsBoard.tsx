'use client'

import { FormEvent, useEffect, useMemo, useState, useTransition } from 'react'
import { BookOpen, Camera, ChevronLeft, ChevronRight, ExternalLink, Link as LinkIcon, Loader2, ChevronDown, Info, Star } from 'lucide-react'
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
import type { MediaSuggestion, SuggestionCategory, SuggestionReference } from '../_types/suggestion'

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

export function SuggestionsBoard({
  initialItems = seededSuggestions
}: {
  initialItems?: MediaSuggestion[]
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

  async function loadReference() {
    const url = formState.referenceUrl.trim()
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
          <TextHeading as="h3" weight="semibold" className="mt-0 mb-0 text-lg">
            Suggestion archive
          </TextHeading>
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
            <article
              key={suggestion.id}
              className="group relative rounded-2xl bg-slate-50 dark:bg-slate-900/40 p-6 transition-all duration-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/70 border-0 shadow-none"
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
                </div>
              </div>
            </article>
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
  return (
    <div className={cn(
      "flex min-w-0 gap-3 rounded-xl bg-teal-50/70 p-3 dark:bg-teal-950/15",
      compact && "bg-slate-50 dark:bg-slate-900/70"
    )}>
      {!compact && reference.image && (
        <img src={reference.image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
      )}
      <div className="min-w-0 space-y-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <LinkIcon size={13} className="shrink-0 text-teal-600 dark:text-teal-300" />
          {reference.url ? (
            <a
              href={reference.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-w-0 items-center gap-1 text-xs font-bold text-teal-700 hover:underline dark:text-teal-300"
            >
              <span className="truncate">{reference.siteName || reference.url}</span>
              <ExternalLink size={11} className="shrink-0" />
            </a>
          ) : (
            <span className="text-xs font-bold text-teal-700 dark:text-teal-300">Reference</span>
          )}
        </div>
        {reference.title && (
          <p className="line-clamp-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {reference.title}
          </p>
        )}
        {reference.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {reference.description}
          </p>
        )}
      </div>
    </div>
  )
}
