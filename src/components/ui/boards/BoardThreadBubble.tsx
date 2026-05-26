'use client'

import type { Dispatch, SetStateAction } from 'react'
import { CornerDownRight } from 'lucide-react'
import { Button } from '@/components/ui/primitives/button'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { RichText } from '@/components/ui/RichText'
import { AttachmentPreviewGrid } from '@/components/ui/attachments/AttachmentPreviewGrid'
import { AttachmentUploadButton } from '@/components/ui/attachments/AttachmentUploadButton'
import { MAX_ATTACHMENT_COUNT } from '@/lib/images/attachment-limits'
import { prepareImageForUpload } from '@/lib/images/prepare-upload'
import { formatBoardDate as formatDate } from '@/lib/boards/board-utils'
import { cn } from '@/lib/utils/utils'
import { sansFont } from '@/styles/fonts/fonts'

type ThreadTheme = 'blue' | 'violet'

type ThreadMessage = {
  body: string
  createdAt: string
  imageUrl?: string
  imageUrls?: string[]
  role: 'asker' | 'admin'
}

const themeClasses = {
  blue: {
    adminAccent: 'text-blue-400',
    adminText: 'text-blue-600 dark:text-blue-400',
    adminBg: 'bg-blue-50/45 dark:bg-blue-950/20',
    adminBorder: 'border-blue-200/70 dark:border-blue-500/20',
    ring: 'ring-blue-500/20',
    editButton: 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
    textarea: 'border-blue-200 focus:ring-blue-300 dark:border-blue-500/30',
    saveButton: 'bg-blue-600 text-white hover:bg-blue-700'
  },
  violet: {
    adminAccent: 'text-violet-400',
    adminText: 'text-violet-600 dark:text-violet-400',
    adminBg: 'bg-violet-50/45 dark:bg-violet-950/20',
    adminBorder: 'border-violet-200/70 dark:border-violet-500/20',
    ring: 'ring-violet-500/20',
    editButton: 'text-violet-500 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300',
    textarea: 'border-violet-200 focus:ring-violet-300 dark:border-violet-500/30',
    saveButton: 'bg-violet-600 hover:bg-violet-700 text-white'
  }
} satisfies Record<ThreadTheme, Record<string, string>>

export function BoardThreadBubble({
  message,
  depth,
  author,
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
  isPending,
  theme,
}: {
  message: ThreadMessage
  depth: number
  author?: string
  promptId?: string
  talkId?: string
  suggestionId?: string
  isEditing: boolean
  editBody: string
  setEditBody: (v: string) => void
  editImageUrls: string[]
  setEditImageUrls: Dispatch<SetStateAction<string[]>>
  onEditClick: () => void
  onCancel: () => void
  onSave: () => void
  passcode: string
  setPasscode: (v: string) => void
  isPending: boolean
  theme: ThreadTheme
}) {
  const isAdmin = message.role === 'admin'
  const classes = themeClasses[theme]
  const indentClass = [
    'ml-2 sm:ml-4',
    'ml-3 sm:ml-8',
    'ml-4 sm:ml-12',
    'ml-5 sm:ml-16'
  ][Math.min(depth, 3)]

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
        'group/bubble relative rounded-xl transition-all duration-300 p-4 border-0 shadow-none text-base text-left',
        indentClass,
        isAdmin
          ? `${classes.adminBg} text-slate-800 dark:text-slate-200`
          : 'bg-emerald-50/45 dark:bg-emerald-950/20 text-slate-800 dark:text-slate-200',
        isEditing && `ring-2 ${classes.ring}`
      )}
    >
      {!isEditing && (
        <div
          className={cn(
            'hidden sm:block absolute -left-4 top-[-16px] bottom-1/2 w-4 border-l-2 border-b-2 rounded-bl-lg pointer-events-none',
            isAdmin ? classes.adminBorder : 'border-emerald-200/70 dark:border-emerald-500/20'
          )}
        />
      )}
      <div className="flex items-center gap-2 mb-1.5 overflow-hidden">
        <CornerDownRight size={12} className={isAdmin ? classes.adminAccent : 'text-emerald-400'} />
        <span className={cn(
          sansFont.className,
          'text-xs font-bold',
          isAdmin ? classes.adminText : 'text-emerald-600 dark:text-emerald-400'
        )}>
          {isAdmin ? 'Response' : (author || 'anonymous')}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <span className={cn(
            sansFont.className,
            'text-[11px] text-muted-foreground whitespace-nowrap transition-transform duration-300',
            isAdmin && !isEditing && 'group-hover/bubble:-translate-x-1'
          )}>
            {formatDate(message.createdAt)}
          </span>
          {isAdmin && !isEditing && (
            <div className="w-0 overflow-hidden opacity-0 group-hover/bubble:w-8 group-hover/bubble:opacity-100 transition-all duration-300">
              <button
                onClick={onEditClick}
                className={cn('text-[10px] font-bold uppercase tracking-wider', classes.editButton)}
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
              e.currentTarget.style.height = 'auto'
              e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
            }}
            rows={Math.max(3, message.body.split('\n').length)}
            autoFocus
            className={cn(sansFont.className, 'min-h-[100px] w-full resize-none overflow-hidden rounded-lg border bg-background px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 dark:text-slate-100', classes.textarea)}
          />
          <AttachmentPreviewGrid
            urls={editImageUrls}
            onRemove={(index) => setEditImageUrls(prev => prev.filter((_, itemIndex) => itemIndex !== index))}
            alt="Edit attachment"
            className="mt-2.5"
            compact
          />
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-3">
              <input
                type="password"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Passcode"
                className={cn('w-24 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 dark:text-slate-100', theme === 'violet' ? 'focus:ring-violet-300' : 'focus:ring-blue-300')}
              />
              <AttachmentUploadButton
                onFiles={(files) => files.forEach(file => {
                  handleImageUpload(file, (url) => setEditImageUrls(prev => prev.length >= MAX_ATTACHMENT_COUNT ? prev : [...prev, url]))
                })}
                accent={theme}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs h-8">
                Cancel
              </Button>
              <Button size="sm" disabled={isPending || !editBody.trim()} onClick={onSave} className={cn('h-8 rounded-full px-4 text-xs', classes.saveButton)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={cn(sansFont.className, 'text-base text-slate-700 dark:text-slate-300 leading-relaxed break-words')}>
            <RichText text={message.body} theme={theme} />
          </div>
          <ImageGallery
            urls={message.imageUrls?.length ? message.imageUrls : (message.imageUrl ? [message.imageUrl] : [])}
            theme={theme}
          />
        </>
      )}
    </div>
  )
}
