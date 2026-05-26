'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Camera, ChevronDown, CornerDownRight, MessageSquareReply, Share2, Star } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/primitives/button'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { RichText } from '@/components/ui/RichText'
import { AttachmentPreviewGrid } from '@/components/ui/attachments/AttachmentPreviewGrid'
import { AttachmentUploadButton } from '@/components/ui/attachments/AttachmentUploadButton'
import { BoardThreadBubble } from '@/components/ui/boards/BoardThreadBubble'
import { MAX_ATTACHMENT_COUNT } from '@/lib/images/attachment-limits'
import { prepareImageForUpload } from '@/lib/images/prepare-upload'
import { formatBoardDate as formatDate } from '@/lib/boards/board-utils'
import { cn } from '@/lib/utils/utils'
import { monoFont, sansFont } from '@/styles/fonts/fonts'
import type { MediaSuggestion, SuggestionStatus } from '../_types/suggestion'
import { getStatusConfig } from './suggestion-board-config'
import { getHighQualitySuggestionImageUrl } from './suggestion-image-url'
import { ReferencePreview } from './ReferencePreview'

type SuggestionCardProps = {
  suggestion: MediaSuggestion
  isAdminMode: boolean
  activeStatusDropdown: string | null
  setActiveStatusDropdown: Dispatch<SetStateAction<string | null>>
  onStatusChange: (id: string, status: SuggestionStatus) => void
  editingMessageId: string | null
  setEditingMessageId: Dispatch<SetStateAction<string | null>>
  editBody: string
  setEditBody: (value: string) => void
  editImageUrls: string[]
  setEditImageUrls: Dispatch<SetStateAction<string[]>>
  onEditSubmit: (suggestionId: string, messageId: string) => void
  passcode: string
  setPasscode: (value: string) => void
  isPending: boolean
  buttonFeedback: Record<string, string>
  onShare: (id: string) => void
  onSnap: (id: string) => void
  replyingTo: string | null
  setReplyingTo: Dispatch<SetStateAction<string | null>>
  replyBody: string
  setReplyBody: (value: string) => void
  replyImageUrls: string[]
  setReplyImageUrls: Dispatch<SetStateAction<string[]>>
  onReplySubmit: (id: string) => void
  followingUp: string | null
  setFollowingUp: Dispatch<SetStateAction<string | null>>
  followUpBody: string
  setFollowUpBody: (value: string) => void
  followUpImageUrls: string[]
  setFollowUpImageUrls: Dispatch<SetStateAction<string[]>>
  isCooldownActive: boolean
  cooldownLabel: string
  onFollowUpSubmit: (id: string) => void
}

function getCardBgStyles(status: SuggestionStatus | undefined) {
  if (status === 'planning') {
    return 'bg-blue-50/40 dark:bg-blue-950/15 border border-blue-100/50 dark:border-blue-900/20 hover:bg-blue-50/60 dark:hover:bg-blue-950/20'
  }
  if (status === 'progressing') {
    return 'bg-amber-50/40 dark:bg-amber-950/15 border border-amber-100/50 dark:border-amber-900/20 hover:bg-amber-50/60 dark:hover:bg-amber-950/20'
  }
  if (status === 'completed') {
    return 'bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-100/50 dark:border-emerald-900/20 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20'
  }
  if (status === 'dropped') {
    return 'bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100/30 dark:border-rose-900/15 hover:bg-rose-50/40 dark:hover:bg-rose-950/15'
  }
  return 'bg-slate-50 dark:bg-slate-900/45 hover:bg-slate-100/50 dark:hover:bg-slate-900/70 border border-transparent'
}

async function attachImages(files: File[], setUrls: Dispatch<SetStateAction<string[]>>) {
  for (const file of files) {
    try {
      const url = await prepareImageForUpload(file)
      setUrls(prev => prev.length >= MAX_ATTACHMENT_COUNT ? prev : [...prev, url])
    } catch (error) {
      console.error(error)
    }
  }
}

export function SuggestionCard({
  suggestion,
  isAdminMode,
  activeStatusDropdown,
  setActiveStatusDropdown,
  onStatusChange,
  editingMessageId,
  setEditingMessageId,
  editBody,
  setEditBody,
  editImageUrls,
  setEditImageUrls,
  onEditSubmit,
  passcode,
  setPasscode,
  isPending,
  buttonFeedback,
  onShare,
  onSnap,
  replyingTo,
  setReplyingTo,
  replyBody,
  setReplyBody,
  replyImageUrls,
  setReplyImageUrls,
  onReplySubmit,
  followingUp,
  setFollowingUp,
  followUpBody,
  setFollowUpBody,
  followUpImageUrls,
  setFollowUpImageUrls,
  isCooldownActive,
  cooldownLabel,
  onFollowUpSubmit
}: SuggestionCardProps) {
  const thread = suggestion.thread || []
  const canReply = isAdminMode
  const cardImageUrl = getHighQualitySuggestionImageUrl(suggestion.reference?.image)
  const hasCardImage = !!cardImageUrl

  return (
    <article
      id={`suggestion-${suggestion.id}`}
      className={cn(
        'group relative overflow-hidden rounded-2xl text-left shadow-none transition-all duration-200',
        getCardBgStyles(suggestion.status)
      )}
    >
      {hasCardImage && (
        <div className="relative h-48 w-full bg-slate-100 sm:h-64 dark:bg-slate-900">
          <img
            src={cardImageUrl}
            alt=""
            className="h-full w-full object-cover object-center"
          />
        </div>
      )}

      <div className={cn('min-w-0 flex-1 space-y-3', hasCardImage ? 'p-5 sm:p-6' : 'p-6')}>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
              {suggestion.category}
            </span>
            <span className={cn(monoFont.className, 'text-[11px] text-muted-foreground')}>
              {formatDate(suggestion.createdAt)}
            </span>

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
                      'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all select-none',
                      config
                        ? `${config.color} border-slate-200/50 dark:border-slate-800/50`
                        : 'border-dashed border-slate-350 dark:border-slate-700 bg-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-305 hover:bg-slate-100/50 dark:hover:bg-slate-900/50',
                      isAdminMode && 'cursor-pointer hover:scale-102 hover:shadow-xs active:scale-98'
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
                        {(['planning', 'progressing', 'completed', 'dropped'] as SuggestionStatus[]).map((status) => {
                          const statusConfig = getStatusConfig(status, suggestion.category)
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => onStatusChange(suggestion.id, status)}
                              className={cn(
                                'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-colors',
                                suggestion.status === status
                                  ? 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
                                  : 'text-slate-650 hover:bg-slate-55 dark:text-slate-350 dark:hover:bg-slate-900/50'
                              )}
                            >
                              <span>{statusConfig?.label}</span>
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
          <h3 className={cn(sansFont.className, 'break-words text-lg font-bold text-slate-950 dark:text-slate-50')}>
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

        {thread.length > 0 && (
          <div className="mt-6 space-y-4 border-t border-border/60 pt-4">
            {thread.map((message, index) => (
              <BoardThreadBubble
                key={message.id}
                message={message}
                depth={index}
                author={suggestion.author}
                suggestionId={suggestion.id}
                theme="blue"
                isEditing={editingMessageId === message.id}
                editBody={editBody}
                setEditBody={setEditBody}
                editImageUrls={editImageUrls}
                setEditImageUrls={setEditImageUrls}
                onEditClick={() => {
                  setEditingMessageId(message.id)
                  setEditBody(message.body)
                  setEditImageUrls(message.imageUrls || (message.imageUrl ? [message.imageUrl] : []))
                }}
                onCancel={() => {
                  setEditingMessageId(null)
                  setEditBody('')
                  setEditImageUrls([])
                }}
                onSave={() => onEditSubmit(suggestion.id, message.id)}
                passcode={passcode}
                setPasscode={setPasscode}
                isPending={isPending}
              />
            ))}
          </div>
        )}

        <div className="suggestion-actions mt-4 flex flex-wrap gap-2.5 sm:justify-end opacity-100 transition-all">
          <button
            type="button"
            onClick={() => onShare(suggestion.id)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/50 hover:bg-slate-200/50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900 px-4.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-650 dark:text-slate-350 hover:text-teal-655 dark:hover:text-teal-355 hover:border-teal-300 dark:hover:border-teal-500/50 shadow-sm transition-all"
          >
            <Share2 size={15} />
            {buttonFeedback[`share-${suggestion.id}`] || 'Share'}
          </button>
          <button
            type="button"
            onClick={() => onSnap(suggestion.id)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/50 hover:bg-slate-200/50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900 px-4.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-650 dark:text-slate-350 hover:text-teal-655 dark:hover:text-teal-355 hover:border-teal-300 dark:hover:border-teal-500/50 shadow-sm transition-all"
          >
            <Camera size={15} />
            {buttonFeedback[`snap-${suggestion.id}`] || 'Snap'}
          </button>
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
          {canReply && (
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

        {replyingTo === suggestion.id && (
          <div className="mt-3 border-t border-border/60 pt-3">
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              onInput={(e) => {
                e.currentTarget.style.height = 'auto'
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
              }}
              placeholder="Write your response..."
              className={cn(
                sansFont.className,
                'min-h-[100px] w-full resize-none overflow-hidden rounded-xl border border-blue-200 bg-background px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-blue-500/30 dark:text-slate-100'
              )}
            />
            <AttachmentPreviewGrid
              urls={replyImageUrls}
              onRemove={(index) => setReplyImageUrls(prev => prev.filter((_, itemIndex) => itemIndex !== index))}
              className="mt-2"
              compact
            />
            <div className="flex justify-between items-center gap-2 mt-3.5">
              <AttachmentUploadButton
                onFiles={(files) => attachImages(files, setReplyImageUrls)}
                accent="blue"
              />
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
                  onClick={() => onReplySubmit(suggestion.id)}
                  className="h-8 rounded-full px-4 text-xs bg-blue-600 text-white hover:bg-blue-700"
                >
                  Send response
                </Button>
              </div>
            </div>
          </div>
        )}

        {followingUp === suggestion.id && (
          <div className="mt-3 border-t border-border/60 pt-3">
            <textarea
              value={followUpBody}
              onChange={(e) => setFollowUpBody(e.target.value)}
              onInput={(e) => {
                e.currentTarget.style.height = 'auto'
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
              }}
              placeholder="Write your follow-up message..."
              className={cn(
                sansFont.className,
                'min-h-[100px] w-full resize-none overflow-hidden rounded-xl border border-emerald-200 bg-background px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:border-emerald-500/30 dark:text-slate-100'
              )}
            />
            <AttachmentPreviewGrid
              urls={followUpImageUrls}
              onRemove={(index) => setFollowUpImageUrls(prev => prev.filter((_, itemIndex) => itemIndex !== index))}
              className="mt-2"
              compact
            />
            <div className="flex justify-between items-center gap-2 mt-3.5">
              <AttachmentUploadButton
                onFiles={(files) => attachImages(files, setFollowUpImageUrls)}
                accent="emerald"
              />
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
                  onClick={() => onFollowUpSubmit(suggestion.id)}
                  className="h-8 rounded-full px-4 text-xs bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isCooldownActive ? cooldownLabel : 'Send message'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
