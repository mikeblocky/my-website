'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Info, Link as LinkIcon, Loader2, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/primitives/button'
import Text from '@/components/ui/text/text'
import { cn } from '@/lib/utils/utils'
import { sansFont } from '@/styles/fonts/fonts'
import { prepareImageForUpload } from '@/lib/images/prepare-upload'
import { MAX_ATTACHMENT_COUNT } from '@/lib/images/attachment-limits'
import { AttachmentPreviewGrid } from '@/components/ui/attachments/AttachmentPreviewGrid'
import { AttachmentUploadButton } from '@/components/ui/attachments/AttachmentUploadButton'
import { getAutomaticReference } from '../_utils/reference'
import type { SuggestionCategory, SuggestionReference } from '../_types/suggestion'
import { ReferencePreview } from './ReferencePreview'
import { categories } from './suggestion-board-config'

interface SuggestionFormProps {
  onSubmit: (payload: {
    title: string
    category: SuggestionCategory
    reference?: SuggestionReference
    author: string
    bestPart: string
    note: string
    imageUrls: string[]
  }) => Promise<void>
  isPending: boolean
  isCooldownActive: boolean
  cooldownLabel: string
  showNotification: (msg: string) => void
}

type FormState = {
  author: string
  title: string
  category: SuggestionCategory
  referenceUrl: string
  note: string
}

export function SuggestionForm({
  onSubmit,
  isPending,
  isCooldownActive,
  cooldownLabel,
  showNotification
}: SuggestionFormProps) {
  const [formState, setFormState] = useState<FormState>({
    author: '',
    title: '',
    category: 'manga',
    referenceUrl: '',
    note: ''
  })
  const [reference, setReference] = useState<SuggestionReference | undefined>()
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isReferenceLoading, setIsReferenceLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  const autoReference = useMemo(() => {
    const title = formState.title.trim()
    if (!title || formState.referenceUrl.trim() || reference) return null
    return getAutomaticReference(title, formState.category)
  }, [formState.title, formState.category, formState.referenceUrl, reference])

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

  async function handleImageUpload(file: File) {
    try {
      const url = await prepareImageForUpload(file)
      setImageUrls(prev => prev.length >= MAX_ATTACHMENT_COUNT ? prev : [...prev, url])
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Could not attach image.')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const title = formState.title.trim()
    if (!title || isCooldownActive) return

    const referencePayload = reference || (formState.referenceUrl.trim() ? { url: formState.referenceUrl.trim() } : autoReference || undefined)

    try {
      setErrorMessage(null)
      await onSubmit({
        title,
        category: formState.category,
        reference: referencePayload,
        author: formState.author.trim(),
        bestPart: '',
        note: formState.note.trim(),
        imageUrls
      })
      setFormState({ author: '', title: '', category: 'manga', referenceUrl: '', note: '' })
      setReference(undefined)
      setImageUrls([])
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to send your suggestion.')
    }
  }

  return (
    <form
      className="bg-white/40 dark:bg-slate-950/20 rounded-xl border border-slate-200/50 dark:border-slate-850/50 shadow-sm flex flex-col pride-focus-within-glow"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 border-b border-slate-100 dark:border-slate-900 bg-slate-50/20 dark:bg-slate-950/20 sm:grid-cols-[1fr_150px] rounded-t-xl">
        <input
          type="text"
          value={formState.title}
          onChange={(event) => setFormState(state => ({ ...state, title: event.target.value }))}
          placeholder="Title (e.g. Skip and Loafer, Perfect Blue, Kid A)"
          className={cn(sansFont.className, "min-w-0 border-b border-slate-100 dark:border-slate-900 bg-transparent px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100 sm:border-b-0 sm:border-r rounded-tl-xl sm:rounded-tr-none rounded-tr-xl")}
          required
        />
        <div className="relative category-dropdown-container w-full sm:w-[150px]">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              sansFont.className,
              "flex w-full items-center justify-between bg-transparent px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-355 focus:outline-none cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors h-full rounded-tr-xl sm:rounded-tl-none rounded-tl-xl"
            )}
          >
            <span>{categories.find(c => c.value === formState.category)?.label || formState.category}</span>
            <motion.div
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.15 }}
              className="text-slate-500 dark:text-slate-400 shrink-0"
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
                  "rounded-xl border border-slate-200 dark:border-slate-800",
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
                        ? "bg-slate-50 text-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
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

      <div className="grid grid-cols-1 border-b border-slate-100 dark:border-slate-900 sm:grid-cols-[1fr_auto]">
        <input
          type="url"
          value={formState.referenceUrl}
          onChange={(event) => {
            setFormState(state => ({ ...state, referenceUrl: event.target.value }))
            setReference(undefined)
          }}
          placeholder="Link (optional, e.g. AniList, Spotify)"
          className={cn(sansFont.className, "min-w-0 bg-transparent px-4 py-3 text-sm text-slate-800 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100")}
        />
        <button
          type="button"
          onClick={loadReference}
          disabled={!formState.referenceUrl.trim() || isReferenceLoading}
          className="flex items-center justify-center gap-2 border-t border-slate-100 dark:border-slate-900 px-4 py-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-350 dark:hover:bg-slate-950/30 sm:border-l sm:border-t-0"
        >
          {isReferenceLoading ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}
          Load info
        </button>
      </div>

      {autoReference && (
        <div className="border-b border-slate-100 dark:border-slate-900 px-4 py-2.5 bg-slate-50/10 dark:bg-slate-950/5 flex items-center gap-2 text-xs text-slate-500">
          <Info size={14} className="text-slate-500 shrink-0" />
          <span>Will link to <strong>{autoReference.siteName}</strong> search results for <em>"{formState.title}"</em> automatically.</span>
        </div>
      )}

      {reference && (
        <div className="border-b border-slate-100 dark:border-slate-900 px-4 py-3">
          <ReferencePreview reference={reference} />
        </div>
      )}

      <input
        type="text"
        value={formState.author}
        onChange={(event) => setFormState(state => ({ ...state, author: event.target.value }))}
        placeholder="Your name or alias (optional)"
        className={cn(sansFont.className, "w-full border-b border-slate-100 dark:border-slate-900 bg-transparent px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100")}
      />

      <textarea
        value={formState.note}
        onChange={(event) => setFormState(state => ({ ...state, note: event.target.value }))}
        placeholder="Why do you recommend it? Favorite tracks, key highlights, or general thoughts..."
        rows={4}
        className={cn(sansFont.className, "min-h-[120px] w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-800 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100")}
      />

      <AttachmentPreviewGrid
        urls={imageUrls}
        onRemove={(index) => setImageUrls(prev => prev.filter((_, itemIndex) => itemIndex !== index))}
        alt="Suggestion attachment"
        className={imageUrls.length > 0 ? 'border-t border-slate-100 dark:border-slate-900 px-4 py-3' : undefined}
        compact
      />

      <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-900 px-4 py-3 bg-slate-50/20 dark:bg-slate-950/20 sm:flex-row sm:items-center sm:justify-between rounded-b-xl">
        <AttachmentUploadButton
          onFiles={(files) => files.forEach(file => handleImageUpload(file))}
          iconSize={13}
          className="gap-2"
          accent="teal"
        />

        <div className="flex items-center gap-3">
          {errorMessage && (
            <Text size="xs" className="text-rose-550">{errorMessage}</Text>
          )}
          <Button
            type="submit"
            disabled={isPending || !formState.title.trim() || isCooldownActive}
            className="rounded-md pride-button h-9 px-4.5 text-xs font-semibold"
            title={isCooldownActive ? `You can send another suggestion in ${cooldownLabel}` : undefined}
          >
            {isCooldownActive ? cooldownLabel : isPending ? 'Sending...' : 'Send suggestion'}
          </Button>
        </div>
      </div>
    </form>
  )
}
