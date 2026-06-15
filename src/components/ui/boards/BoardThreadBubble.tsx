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
import { formatBoardDate as formatDate, formatBoardDateCompact as formatDateCompact } from '@/lib/boards/board-utils'
import { cn } from '@/lib/utils/utils'
import { sansFont, monoFont, dmSans } from '@/styles/fonts/fonts'

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
  isLast = false,
  actions,
  isAdminMode = false,
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
  isLast?: boolean
  actions?: React.ReactNode
  isAdminMode?: boolean
}) {
  const isAdmin = message.role === 'admin'
  const classes = themeClasses[theme]

  const handleImageUpload = async (file: File, callback: (url: string) => void) => {
    try {
      callback(await prepareImageForUpload(file))
    } catch (error) {
      console.error('Could not attach image', error)
    }
  }

  return (
    <div
      className={cn(
        'group/bubble relative flex gap-3 sm:gap-4 text-base text-left transition-all duration-300 pl-0 pr-1 py-1 rounded-xl'
      )}
    >
      <div className="flex flex-col items-center shrink-0">
        <div className="w-9 sm:w-12 flex justify-center">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-black/[0.04] dark:border-white/[0.04] overflow-hidden select-none">
            <img 
              src={isAdmin ? "/a.jpg" : "/q.jpg"} 
              alt={isAdmin ? "Response Avatar" : "Question Avatar"} 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
        {!isLast && (
          <div className="w-0.5 bg-slate-200 dark:bg-slate-800 flex-grow mt-2 -mb-8 rounded-full" />
        )}
      </div>

      {/* Right Column: Message Content */}
      <div className="flex-grow min-w-0">
        {!isEditing && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1.5 gap-1 sm:gap-2">
            <span className={cn(
              dmSans.className,
              'text-sm font-bold tracking-wider truncate',
              isAdmin ? classes.adminText : 'text-emerald-650 dark:text-emerald-400'
            )}>
              {isAdmin ? 'mikeblocky' : (author || 'anonymous')}
            </span>
            <div className="flex items-center gap-2">
              {isAdmin && isAdminMode && (
                <button
                  onClick={onEditClick}
                  className={cn(dmSans.className, 'text-xs font-bold opacity-0 group-hover/bubble:opacity-100 transition-opacity cursor-pointer mr-1 shrink-0', classes.editButton)}
                >
                  Edit
                </button>
              )}
              <span className={cn(
                dmSans.className,
                'text-xs text-muted-foreground whitespace-nowrap shrink-0'
              )}>
                <span className="hidden sm:inline">{formatDate(message.createdAt)}</span>
                <span className="inline sm:hidden">{formatDateCompact(message.createdAt)}</span>
              </span>
            </div>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              ref={(el) => {
                if (el) {
                  el.style.height = 'auto'
                  el.style.height = `${el.scrollHeight}px`
                }
              }}
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              onInput={(e) => {
                const textarea = e.currentTarget
                textarea.style.height = 'auto'
                textarea.style.height = `${textarea.scrollHeight}px`

                // Scroll cursor into view dynamically when typing
                const { selectionStart, value } = textarea
                const lines = value.substring(0, selectionStart).split('\n')
                const currentLineIndex = lines.length
                const totalLines = value.split('\n').length || 1

                const textareaRect = textarea.getBoundingClientRect()
                const lineHeight = textareaRect.height / totalLines
                const cursorTop = textareaRect.top + window.scrollY + (currentLineIndex * lineHeight)

                const viewportTop = window.scrollY
                const viewportBottom = window.scrollY + window.innerHeight
                const padding = 100 // Contextual vertical padding around text caret

                if (cursorTop + padding > viewportBottom) {
                  window.scrollTo({
                    top: cursorTop + padding - window.innerHeight,
                    behavior: 'auto'
                  })
                } else if (cursorTop - padding < viewportTop) {
                  window.scrollTo({
                    top: cursorTop - padding,
                    behavior: 'auto'
                  })
                }
              }}
              rows={Math.max(3, message.body.split('\n').length)}
              autoFocus
              className={cn(dmSans.className, 'min-h-[44px] w-full resize-none overflow-hidden rounded-md border bg-background px-4 py-3 text-base md:text-[17px] text-slate-900 focus:outline-none focus:ring-1 dark:text-slate-100', classes.textarea)}
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
            <div className={cn(dmSans.className, 'text-base md:text-[17px] text-slate-700 dark:text-slate-300 leading-relaxed break-words')}>
              <RichText text={message.body} theme={theme} />
            </div>
            <ImageGallery
              urls={message.imageUrls?.length ? message.imageUrls : (message.imageUrl ? [message.imageUrl] : [])}
              theme={theme}
            />
            {actions && (
              <div className="mt-3">
                {actions}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
