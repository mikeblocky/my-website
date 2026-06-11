'use client'

import { FormEvent, useState } from 'react'
import { sansFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import { Button } from '@/components/ui/primitives/button'
import { AttachmentPreviewGrid } from '@/components/ui/attachments/AttachmentPreviewGrid'
import { AttachmentUploadButton } from '@/components/ui/attachments/AttachmentUploadButton'
import { MAX_ATTACHMENT_COUNT } from '@/lib/images/attachment-limits'
import { prepareImageForUpload } from '@/lib/images/prepare-upload'

interface DrawPromptFormProps {
  onSubmit: (payload: { author: string; body: string; character: string; media: string; imageUrls: string[] }) => Promise<void>
  isPending: boolean
  isCooldownActive: boolean
  cooldownLabel: string
  showNotification: (msg: string) => void
}

export function DrawPromptForm({
  onSubmit,
  isPending,
  isCooldownActive,
  cooldownLabel,
  showNotification
}: DrawPromptFormProps) {
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
      await onSubmit({
        author: author.trim(),
        body: trimmedBody,
        character: '',
        media: '',
        imageUrls
      })
      setBody('')
      setImageUrls([])
    } catch (e) {
      // Parent handles showing error
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
            sansFont.className,
            "w-full bg-transparent text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100"
          )}
        />
      </div>

      {/* Middle: Prompt Field */}
      <div className="px-4 py-2">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onInput={(e) => {
            e.currentTarget.style.height = 'auto';
            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
          }}
          placeholder="Suggest a drawing prompt... (describe characters, actions, or series here)"
          rows={1}
          className={cn(
            sansFont.className,
            "w-full bg-transparent py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-600 resize-none overflow-hidden min-h-[100px]"
          )}
        />
      </div>

      {/* Attachment thumbnails */}
      <AttachmentPreviewGrid
        urls={imageUrls}
        onRemove={(index) => setImageUrls(prev => prev.filter((_, itemIndex) => itemIndex !== index))}
        className="px-4 pb-3"
      />

      {/* Bottom: Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100 dark:border-slate-900 px-4 py-3.5 bg-slate-50/20 dark:bg-slate-950/20">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <AttachmentUploadButton
            onFiles={(files) => files.forEach(file => handleImageUpload(file))}
            iconSize={13}
            className={cn(sansFont.className, 'gap-1.5 text-xs font-semibold')}
            accent="violet"
          >
            Add images
          </AttachmentUploadButton>
        </div>
        
        <Button 
          type="submit" 
          size="sm"
          disabled={!body.trim() || isPending || isCooldownActive}
          className="w-full sm:w-auto h-9 px-4.5 text-xs font-semibold rounded-md pride-button"
          title={isCooldownActive ? `You can send another prompt in ${cooldownLabel}` : undefined}
        >
          {isCooldownActive ? cooldownLabel : 'Send prompt'}
        </Button>
      </div>
    </form>
  )
}
