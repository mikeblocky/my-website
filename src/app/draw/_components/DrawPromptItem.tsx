'use client'

import { useState } from 'react'
import { DrawPrompt } from '../_types/draw'
import { RichText } from '@/components/ui/RichText'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { Button } from '@/components/ui/primitives/button'
import { Camera, CornerDownRight, MessageSquareReply, Bell, Share2 } from 'lucide-react'
import { sansFont, monoFont, dmSans } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import { prepareImageForUpload } from '@/lib/images/prepare-upload'
import { MAX_ATTACHMENT_COUNT } from '@/lib/images/attachment-limits'
import { formatBoardDate as formatDate, formatBoardDateCompact as formatDateCompact } from '@/lib/boards/board-utils'
import { AttachmentPreviewGrid } from '@/components/ui/attachments/AttachmentPreviewGrid'
import { AttachmentUploadButton } from '@/components/ui/attachments/AttachmentUploadButton'
import { BoardThreadBubble } from '@/components/ui/boards/BoardThreadBubble'

interface DrawPromptItemProps {
  prompt: DrawPrompt
  isAdminMode: boolean
  passcode: string
  setPasscode: (value: string) => void
  isPending: boolean
  buttonFeedback: Record<string, string>
  isCooldownActive: boolean
  cooldownLabel: string
  onShare: (id: string) => void
  onSnap: (id: string) => void
  onReplySubmit: (id: string, body: string, imageUrls: string[]) => Promise<void>
  onFollowUpSubmit: (id: string, body: string, imageUrls: string[]) => Promise<void>
  onEditSubmit: (promptId: string, messageId: string, body: string, imageUrls: string[]) => Promise<void>
  showNotification: (msg: string) => void
}

export function DrawPromptItem({
  prompt,
  isAdminMode,
  passcode,
  setPasscode,
  isPending,
  buttonFeedback,
  isCooldownActive,
  cooldownLabel,
  onShare,
  onSnap,
  onReplySubmit,
  onFollowUpSubmit,
  onEditSubmit,
  showNotification
}: DrawPromptItemProps) {
  // Local edit states
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [editImageUrls, setEditImageUrls] = useState<string[]>([])
  
  // Local reply states
  const [isReplying, setIsReplying] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [replyImageUrls, setReplyImageUrls] = useState<string[]>([])

  // Local follow-up states
  const [isFollowingUp, setIsFollowingUp] = useState(false)
  const [followUpBody, setFollowUpBody] = useState('')
  const [followUpImageUrls, setFollowUpImageUrls] = useState<string[]>([])

  const handleImageUpload = async (file: File, callback: (url: string) => void) => {
    try {
      callback(await prepareImageForUpload(file))
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Could not attach image.')
    }
  }

  const handleReplyClick = () => {
    setIsReplying(!isReplying)
    setReplyBody('')
    setReplyImageUrls([])
    setIsFollowingUp(false)
  }

  const handleFollowUpClick = () => {
    setIsFollowingUp(!isFollowingUp)
    setFollowUpBody('')
    setFollowUpImageUrls([])
    setIsReplying(false)
  }

  const handleReplyFormSubmit = async () => {
    if (!replyBody.trim()) return
    try {
      await onReplySubmit(prompt.id, replyBody, replyImageUrls)
      setIsReplying(false)
      setReplyBody('')
      setReplyImageUrls([])
    } catch (e) {
      // Handled in parent
    }
  }

  const handleFollowUpFormSubmit = async () => {
    if (!followUpBody.trim() || isCooldownActive) return
    try {
      await onFollowUpSubmit(prompt.id, followUpBody, followUpImageUrls)
      setIsFollowingUp(false)
      setFollowUpBody('')
      setFollowUpImageUrls([])
    } catch (e) {
      // Handled in parent
    }
  }

  const handleEditFormSubmit = async (messageId: string) => {
    if (!editBody.trim()) return
    try {
      await onEditSubmit(prompt.id, messageId, editBody, editImageUrls)
      setEditingMessageId(null)
      setEditBody('')
      setEditImageUrls([])
    } catch (e) {
      // Handled in parent
    }
  }

  const thread = prompt.thread || []
  const canFollowUp = true
  const canReply = isAdminMode

  const actionButtons = (
    <div className="prompt-actions mt-3 flex flex-wrap gap-4 opacity-100 transition-all">
      <button
        onClick={() => onShare(prompt.id)}
        className="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer"
      >
        <Share2 size={13} />
        <span>{buttonFeedback[`share-${prompt.id}`] || 'Share'}</span>
      </button>
      <button
        onClick={() => onSnap(prompt.id)}
        className="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer"
      >
        <Camera size={13} />
        <span>{buttonFeedback[`snap-${prompt.id}`] || 'Snap'}</span>
      </button>
      {canFollowUp && (
        <button
          onClick={handleFollowUpClick}
          className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-450 hover:underline transition-all cursor-pointer"
        >
          <CornerDownRight size={13} />
          <span>Follow up</span>
        </button>
      )}
      {canReply && (
        <button
          onClick={handleReplyClick}
          className="flex items-center gap-1.5 text-xs font-mono font-medium text-violet-655 dark:text-violet-455 hover:underline transition-colors duration-150 cursor-pointer"
        >
          <MessageSquareReply size={13} />
          <span>Reply (Admin)</span>
        </button>
      )}
    </div>
  )

  return (
    <article 
      id={`prompt-${prompt.id}`} 
      className="group relative rounded-xl border border-slate-200/50 dark:border-slate-850/50 bg-white/40 dark:bg-slate-950/20 p-4 sm:p-6 transition-all duration-200 hover:bg-white/65 dark:hover:bg-slate-950/35 shadow-none text-left"
    >
      <div className="flex flex-col gap-4">
        {/* Original prompt */}
        <div className="flex gap-3 sm:gap-4">
          {/* Left Column: Avatar & Thread Line */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-9 sm:w-12 flex justify-center">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-violet-200/30 dark:border-violet-900/30 overflow-hidden select-none">
                <img src="/q.jpg" alt="Question Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
            {(thread.length > 0 || isReplying || isFollowingUp) && (
              <div className="w-0.5 bg-slate-200 dark:bg-slate-800 flex-grow mt-2 -mb-8 rounded-full" />
            )}
          </div>

          {/* Right Column: Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1.5 gap-1 sm:gap-2">
              <span className={cn(dmSans.className, "text-sm font-bold tracking-wider text-violet-600 dark:text-violet-300 truncate")}>
                {prompt.author}
              </span>
              <div className="flex items-center gap-1">
                <div className="flex items-center mr-1 shrink-0" title="Notifications active (strict)">
                  <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-violet-50 dark:bg-violet-500/10">
                    <Bell size={14} className="text-violet-600 dark:text-violet-400 fill-violet-600/10" />
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-violet-600 border-2 border-white dark:border-slate-900 animate-pulse" />
                  </div>
                </div>
                <span className={cn(dmSans.className, "text-xs text-muted-foreground whitespace-nowrap shrink-0")}>
                  <span className="hidden sm:inline">{formatDate(prompt.createdAt)}</span>
                  <span className="inline sm:hidden">{formatDateCompact(prompt.createdAt)}</span>
                </span>
              </div>
            </div>

            {/* Tags for Character and Media */}
            {(prompt.character || prompt.media) && (
              <div className="flex flex-wrap gap-2 mb-2">
                {prompt.character && (
                  <span className={cn(monoFont.className, "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-50/50 text-violet-750 border border-violet-200/55 dark:bg-violet-900/10 dark:text-violet-300 dark:border-violet-800/40")}>
                    👤 {prompt.character}
                  </span>
                )}
                {prompt.media && (
                  <span className={cn(monoFont.className, "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50/50 text-indigo-750 border border-indigo-200/55 dark:bg-indigo-900/10 dark:text-indigo-300 dark:border-indigo-800/40")}>
                    🎬 {prompt.media}
                  </span>
                )}
              </div>
            )}
            
            <div className={cn(dmSans.className, "text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-medium mb-3 break-words")}>
              <RichText text={prompt.body} theme="violet" />
            </div>

            {/* Image Attachment */}
            <ImageGallery 
              urls={prompt.imageUrls?.length ? prompt.imageUrls : (prompt.imageUrl ? [prompt.imageUrl] : [])} 
              theme="violet"
            />

            {thread.length === 0 && actionButtons}
          </div>
        </div>

        {/* Thread messages */}
        {thread.length > 0 && (
          <div className="space-y-4">
            {thread.map((msg, i) => (
              <BoardThreadBubble
                key={msg.id} 
                message={msg} 
                depth={i} 
                author={prompt.author}
                promptId={prompt.id}
                theme="violet"
                isEditing={editingMessageId === msg.id}
                editBody={editBody}
                setEditBody={setEditBody}
                editImageUrls={editImageUrls}
                setEditImageUrls={setEditImageUrls}
                onEditClick={() => {
                  setEditingMessageId(msg.id)
                  setEditBody(msg.body)
                  const mergedUrls = msg.imageUrls?.length 
                    ? msg.imageUrls 
                    : (msg.imageUrl ? [msg.imageUrl] : [])
                  setEditImageUrls(mergedUrls)
                  setIsReplying(false)
                  setIsFollowingUp(false)
                }}
                onCancel={() => setEditingMessageId(null)}
                onSave={() => handleEditFormSubmit(msg.id)}
                passcode={passcode}
                setPasscode={setPasscode}
                isPending={isPending}
                isLast={i === thread.length - 1 && !isReplying && !isFollowingUp}
                actions={i === thread.length - 1 ? actionButtons : undefined}
                isAdminMode={isAdminMode}
              />
            ))}
          </div>
        )}

        {/* Admin reply form */}
        {isReplying && (
          <div className="flex gap-3 sm:gap-4 border-t border-slate-100/50 dark:border-slate-800/50 pt-3">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-9 sm:w-12 flex justify-center">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-black/[0.04] overflow-hidden select-none">
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
                  e.currentTarget.style.height = 'auto';
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                }}
                placeholder="Write your answer..."
                rows={1}
                className={cn(dmSans.className, "min-h-[44px] w-full resize-none overflow-hidden rounded-md border border-border bg-background px-4 py-3 text-base md:text-[17px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-350 dark:text-slate-100")}
              />
              <AttachmentPreviewGrid
                urls={replyImageUrls}
                onRemove={(index) => setReplyImageUrls(prev => prev.filter((_, itemIndex) => itemIndex !== index))}
                alt="Reply attachment"
                className="mt-2.5"
                compact
              />
              <div className="mt-2 flex justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                  <input 
                    type="password"
                    value={passcode}
                    onChange={e => setPasscode(e.target.value)}
                    placeholder="Passcode"
                    className="w-24 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:text-slate-100"
                  />
                  <AttachmentUploadButton
                    onFiles={(files) => files.forEach(file => {
                      handleImageUpload(file, (url) => setReplyImageUrls(prev => prev.length >= MAX_ATTACHMENT_COUNT ? prev : [...prev, url]))
                    })}
                    accent="violet"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)} className="text-xs h-8">
                    Cancel
                  </Button>
                  <Button size="sm" disabled={isPending || !replyBody.trim()} onClick={handleReplyFormSubmit} className="h-8 rounded px-4 text-xs bg-violet-600 hover:bg-violet-700 text-white">
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visitor follow-up form */}
        {isFollowingUp && (
          <div className="flex gap-3 sm:gap-4 border-t border-slate-100/50 dark:border-slate-800/50 pt-3">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-9 sm:w-12 flex justify-center">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-black/[0.04] overflow-hidden select-none">
                  <img src="/q.jpg" alt="Question Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <textarea
                value={followUpBody}
                onChange={(e) => setFollowUpBody(e.target.value)}
                onInput={(e) => {
                  e.currentTarget.style.height = 'auto';
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                }}
                placeholder="Ask a follow-up..."
                rows={1}
                className={cn(dmSans.className, "min-h-[44px] w-full resize-none overflow-hidden rounded-md border border-emerald-250 bg-background px-4 py-3 text-base md:text-[17px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-350 dark:border-emerald-500/30 dark:text-slate-100")}
              />
              <AttachmentPreviewGrid
                urls={followUpImageUrls}
                onRemove={(index) => setFollowUpImageUrls(prev => prev.filter((_, itemIndex) => itemIndex !== index))}
                alt="Follow-up attachment"
                className="mt-2.5"
                compact
              />
              <div className="mt-2 flex justify-between items-center gap-2">
                <AttachmentUploadButton
                  onFiles={(files) => files.forEach(file => {
                    handleImageUpload(file, (url) => setFollowUpImageUrls(prev => prev.length >= MAX_ATTACHMENT_COUNT ? prev : [...prev, url]))
                  })}
                  accent="emerald"
                />
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsFollowingUp(false)} className="text-xs h-8">
                    Cancel
                  </Button>
                  <Button size="sm" disabled={isPending || !followUpBody.trim() || isCooldownActive} onClick={handleFollowUpFormSubmit} className="h-8 rounded px-4 text-xs bg-emerald-650 hover:bg-emerald-750 text-white" title={isCooldownActive ? `You can send another prompt in ${cooldownLabel}` : undefined}>
                    {isCooldownActive ? cooldownLabel : 'Send follow-up'}
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
