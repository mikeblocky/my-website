'use client'

import { useState } from 'react'
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
  setActiveStatusDropdown: (id: string | null) => void
  onStatusChange: (id: string, status: SuggestionStatus) => void
  passcode: string
  setPasscode: (value: string) => void
  isPending: boolean
  buttonFeedback: Record<string, string>
  onShare: (id: string) => void
  onSnap: (id: string) => void
  onReplySubmit: (id: string, body: string, imageUrls: string[]) => Promise<void>
  onFollowUpSubmit: (id: string, body: string, imageUrls: string[]) => Promise<void>
  onEditSubmit: (suggestionId: string, messageId: string, body: string, imageUrls: string[]) => Promise<void>
  isCooldownActive: boolean
  cooldownLabel: string
}

function getCardBgStyles(status: SuggestionStatus | undefined) {
  if (status === 'planning') {
    return 'bg-blue-50/30 dark:bg-blue-950/10 border border-blue-200/50 dark:border-blue-900/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/15'
  }
  if (status === 'progressing') {
    return 'bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/40 hover:bg-amber-50/50 dark:hover:bg-amber-950/15'
  }
  if (status === 'completed') {
    return 'bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/15'
  }
  if (status === 'dropped') {
    return 'bg-rose-50/20 dark:bg-rose-950/5 border border-rose-200/40 dark:border-rose-900/30 hover:bg-rose-50/30 dark:hover:bg-rose-950/10'
  }
  return 'bg-white/40 dark:bg-slate-950/20 hover:bg-white/65 dark:hover:bg-slate-950/35 border border-slate-200/50 dark:border-slate-850/50'
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
  passcode,
  setPasscode,
  isPending,
  buttonFeedback,
  onShare,
  onSnap,
  onReplySubmit,
  onFollowUpSubmit,
  onEditSubmit,
  isCooldownActive,
  cooldownLabel
}: SuggestionCardProps) {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [editImageUrls, setEditImageUrls] = useState<string[]>([])

  const [isReplying, setIsReplying] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [replyImageUrls, setReplyImageUrls] = useState<string[]>([])

  const [isFollowingUp, setIsFollowingUp] = useState(false)
  const [followUpBody, setFollowUpBody] = useState('')
  const [followUpImageUrls, setFollowUpImageUrls] = useState<string[]>([])

  const thread = suggestion.thread || []
  const canReply = isAdminMode
  const cardImageUrl = getHighQualitySuggestionImageUrl(suggestion.reference?.image)
  const hasCardImage = !!cardImageUrl

  const actionButtons = (
    <div className="suggestion-actions mt-3 flex flex-wrap gap-4 opacity-100 transition-all">
      <button
        type="button"
        onClick={() => onShare(suggestion.id)}
        className="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-teal-655 dark:hover:text-teal-355 transition-colors duration-150 cursor-pointer"
      >
        <Share2 size={13} />
        <span>{buttonFeedback[`share-${suggestion.id}`] || 'Share'}</span>
      </button>
      <button
        type="button"
        onClick={() => onSnap(suggestion.id)}
        className="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-teal-655 dark:hover:text-teal-355 transition-colors duration-150 cursor-pointer"
      >
        <Camera size={13} />
        <span>{buttonFeedback[`snap-${suggestion.id}`] || 'Snap'}</span>
      </button>
      <button
        type="button"
        onClick={() => {
          setIsFollowingUp(!isFollowingUp)
          setFollowUpBody('')
          setFollowUpImageUrls([])
          setIsReplying(false)
        }}
        className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 hover:underline transition-all cursor-pointer"
      >
        <CornerDownRight size={13} />
        <span>Follow up</span>
      </button>
      {canReply && (
        <button
          type="button"
          onClick={() => {
            setIsReplying(!isReplying)
            setReplyBody('')
            setReplyImageUrls([])
            setIsFollowingUp(false)
          }}
          className="flex items-center gap-1.5 text-xs font-mono font-medium text-blue-655 dark:text-blue-355 hover:underline transition-colors duration-150 cursor-pointer"
        >
          <MessageSquareReply size={13} />
          <span>Reply (Admin)</span>
        </button>
      )}
    </div>
  )

  const handleReplyFormSubmit = async () => {
    if (!replyBody.trim()) return
    try {
      await onReplySubmit(suggestion.id, replyBody, replyImageUrls)
      setIsReplying(false)
      setReplyBody('')
      setReplyImageUrls([])
    } catch (e) {}
  }

  const handleFollowUpFormSubmit = async () => {
    if (!followUpBody.trim() || isCooldownActive) return
    try {
      await onFollowUpSubmit(suggestion.id, followUpBody, followUpImageUrls)
      setIsFollowingUp(false)
      setFollowUpBody('')
      setFollowUpImageUrls([])
    } catch (e) {}
  }

  const handleEditFormSubmit = async (messageId: string) => {
    if (!editBody.trim()) return
    try {
      await onEditSubmit(suggestion.id, messageId, editBody, editImageUrls)
      setEditingMessageId(null)
      setEditBody('')
      setEditImageUrls([])
    } catch (e) {}
  }

  return (
    <article
      id={`suggestion-${suggestion.id}`}
      className={cn(
        'group relative overflow-hidden rounded-xl text-left shadow-none transition-all duration-200',
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

      <div className={cn('min-w-0 flex-1 flex flex-col gap-4', hasCardImage ? 'p-5 sm:p-6' : 'p-6')}>
        {/* Original Post */}
        <div className="flex gap-4">
          {/* Left Column: Avatar & Thread Line */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-10 h-10 rounded-full border border-teal-200/30 dark:border-teal-900/30 overflow-hidden select-none">
              <img src="/q.jpg" alt="Question Avatar" className="w-full h-full object-cover" />
            </div>
            {(thread.length > 0 || isReplying || isFollowingUp) && (
              <div className="w-0.5 bg-slate-200 dark:bg-slate-800 flex-grow mt-2 -mb-8 rounded-full" />
            )}
          </div>

          {/* Right Column: Content */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn(monoFont.className, "text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-900/50 bg-teal-50/50 dark:bg-teal-950/20 px-1.5 py-0.5 rounded")}>
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
                          monoFont.className,
                          'flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold transition-all select-none',
                          config
                            ? `${config.color} border-slate-200/50 dark:border-slate-800/50`
                            : 'border-dashed border-slate-350 dark:border-slate-700 bg-transparent text-slate-400 hover:text-slate-550 dark:hover:text-slate-355 hover:bg-slate-100/50 dark:hover:bg-slate-900/50',
                          isAdminMode && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800'
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
                                      : 'text-slate-655 hover:bg-slate-55 dark:text-slate-350 dark:hover:bg-slate-900/50'
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
              <div className="rounded-md border border-amber-150/70 bg-amber-50/30 px-3 py-2 dark:border-amber-950/30 dark:bg-amber-950/10">
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

            {thread.length === 0 && actionButtons}
          </div>
        </div>

        {/* Thread messages */}
        {thread.length > 0 && (
          <div className="space-y-4">
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
                  setIsReplying(false)
                  setIsFollowingUp(false)
                }}
                onCancel={() => {
                  setEditingMessageId(null)
                  setEditBody('')
                  setEditImageUrls([])
                }}
                onSave={() => handleEditFormSubmit(message.id)}
                passcode={passcode}
                setPasscode={setPasscode}
                isPending={isPending}
                isLast={index === thread.length - 1 && !isReplying && !isFollowingUp}
                actions={index === thread.length - 1 ? actionButtons : undefined}
                isAdminMode={isAdminMode}
              />
            ))}
          </div>
        )}

        {/* Admin reply form */}
        {isReplying && (
          <div className="flex gap-4 border-t border-slate-100/50 dark:border-slate-800/50 pt-3">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 flex justify-center">
                <div className="w-10 h-10 rounded-full border border-black/[0.04] overflow-hidden select-none">
                  <img src="/a.jpg" alt="Response Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
              {!isFollowingUp && (
                <div className="w-0.5 bg-slate-200 dark:bg-slate-800 flex-grow mt-2 -mb-8 rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0">
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
                  'min-h-[44px] w-full resize-none overflow-hidden rounded-md border border-blue-200/70 bg-background px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-300 dark:border-blue-500/30 dark:text-slate-100'
                )}
              />
              <AttachmentPreviewGrid
                urls={replyImageUrls}
                onRemove={(index) => setReplyImageUrls(prev => prev.filter((_, itemIndex) => itemIndex !== index))}
                className="mt-2"
                compact
              />
              <div className="flex justify-between items-center gap-2 mt-3.5">
                <div className="flex items-center gap-3">
                  <input 
                    type="password"
                    value={passcode}
                    onChange={e => setPasscode(e.target.value)}
                    placeholder="Passcode"
                    className="w-24 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:text-slate-100"
                  />
                  <AttachmentUploadButton
                    onFiles={(files) => attachImages(files, setReplyImageUrls)}
                    accent="blue"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    type="button"
                    size="sm"
                    onClick={() => {
                      setIsReplying(false)
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
                    onClick={handleReplyFormSubmit}
                    className="h-8 rounded px-4 text-xs bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Send response
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visitor follow-up form */}
        {isFollowingUp && (
          <div className="flex gap-4 border-t border-slate-100/50 dark:border-slate-800/50 pt-3">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 flex justify-center">
                <div className="w-10 h-10 rounded-full border border-black/[0.04] overflow-hidden select-none">
                  <img src="/q.jpg" alt="Question Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
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
                  'min-h-[44px] w-full resize-none overflow-hidden rounded-md border border-emerald-250 bg-background px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-300 dark:border-emerald-500/30 dark:text-slate-100'
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
                      setIsFollowingUp(false)
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
                    onClick={handleFollowUpFormSubmit}
                    className="h-8 rounded px-4 text-xs bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isCooldownActive ? cooldownLabel : 'Send message'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
