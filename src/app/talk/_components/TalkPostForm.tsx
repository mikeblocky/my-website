'use client'

import { FormEvent, useState } from 'react'
import { sansFont, dmSans } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import { Button } from '@/components/ui/primitives/button'
import { Bell } from 'lucide-react'
import { AttachmentPreviewGrid } from '@/components/ui/attachments/AttachmentPreviewGrid'
import { AttachmentUploadButton } from '@/components/ui/attachments/AttachmentUploadButton'
import { MAX_ATTACHMENT_COUNT } from '@/lib/images/attachment-limits'
import { prepareImageForUpload } from '@/lib/images/prepare-upload'

interface TalkPostFormProps {
  onSubmit: (payload: { author: string; body: string; imageUrls: string[] }) => Promise<void>
  isPending: boolean
  isCooldownActive: boolean
  cooldownLabel: string
  pushSupported: boolean
  wantNotification: boolean
  setWantNotification: (value: boolean) => void
  showNotification: (msg: string) => void
}

export function TalkPostForm({
  onSubmit,
  isPending,
  isCooldownActive,
  cooldownLabel,
  pushSupported,
  wantNotification,
  setWantNotification,
  showNotification
}: TalkPostFormProps) {
  const [author, setAuthor] = useState('')
  const [body, setBody] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])

  const handleImageUpload = async (file: File) => {
    try {
      const url = await prepareImageForUpload(file)
      setImageUrls(prev => prev.length >= MAX_ATTACHMENT_COUNT ? prev : [...prev, url])
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Could not attach image.')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedBody = body.trim()
    if (!trimmedBody || isCooldownActive) return

    try {
      await onSubmit({ author: author.trim(), body: trimmedBody, imageUrls })
      setBody('')
      setImageUrls([])
    } catch (e) {
      // The parent handles display of the error message
    }
  }

  return (
    <form 
      className="bg-white/40 dark:bg-slate-950/20 rounded-xl border border-slate-200/50 dark:border-slate-850/50 shadow-sm flex flex-col overflow-hidden pride-focus-within-glow" 
      onSubmit={handleSubmit}
    >
      {/* Top: Alias Field */}
      <div className="border-b border-slate-100 dark:border-slate-900 px-4 py-3 bg-slate-50/20 dark:bg-slate-950/20">
        <input
          type="text"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="Your alias (optional)"
          className={cn(
            dmSans.className,
            "w-full bg-transparent text-base font-semibold text-slate-800 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100"
          )}
        />
      </div>

      {/* Middle: Message Field */}
      <div className="px-4 py-2">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onInput={(e) => {
            e.currentTarget.style.height = 'auto';
            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
          }}
          placeholder="Let's talk about anything... (ask questions, ask for suggestions, casual chat)"
          rows={1}
          className={cn(
            dmSans.className,
            "w-full bg-transparent py-2 text-base text-slate-900 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-600 resize-none overflow-hidden min-h-[100px]"
          )}
        />
      </div>

      <AttachmentPreviewGrid
        urls={imageUrls}
        onRemove={(index) => setImageUrls(prev => prev.filter((_, itemIndex) => itemIndex !== index))}
        className="px-4 pb-3"
      />

      {/* Bottom: Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100 dark:border-slate-900 px-4 py-3.5 bg-slate-50/20 dark:bg-slate-950/20">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {pushSupported && (
            <label className="flex items-center gap-2.5 cursor-pointer group/notify select-none">
              <input
                type="checkbox"
                checked={wantNotification}
                onChange={(e) => setWantNotification(e.target.checked)}
                className="h-4 w-4 rounded border-slate-350 text-[hsl(var(--pride-glow-val))] focus:ring-0 accent-[hsl(var(--pride-glow-val))] cursor-pointer dark:border-slate-700"
              />
              <span className={cn(dmSans.className, "text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 group-hover/notify:text-[hsl(var(--pride-glow-val))] transition-colors")}>
                <Bell size={13} />
                Notify me
              </span>
            </label>
          )}

          <AttachmentUploadButton
            onFiles={(files) => files.forEach(file => handleImageUpload(file))}
            iconSize={13}
            className={cn(dmSans.className, 'gap-1.5 text-sm font-semibold')}
            accent="blue"
          >
            Add images
          </AttachmentUploadButton>
        </div>
        
        <Button 
          type="submit" 
          size="sm"
          disabled={!body.trim() || isPending || isCooldownActive}
          className={cn(dmSans.className, "w-full sm:w-auto h-9 px-4.5 text-sm font-semibold rounded-md pride-button")}
          title={isCooldownActive ? `You can send another message in ${cooldownLabel}` : undefined}
        >
          {isCooldownActive ? cooldownLabel : 'Post message'}
        </Button>
      </div>
    </form>
  )
}
