'use client'

import { useState } from 'react'
import { SketchbookDrawing } from '../_types/sketchbook'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { Button } from '@/components/ui/primitives/button'
import { Heart, Share2, Camera, Download, MessageSquareReply, Trash2, CornerDownRight } from 'lucide-react'
import { formatBoardDate as formatDate } from '@/lib/boards/board-utils'
import { sansFont, monoFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'

interface SketchbookCardProps {
  drawing: SketchbookDrawing
  isAdminMode: boolean
  likedList: string[]
  passcode: string
  isPending: boolean
  buttonFeedback: Record<string, string>
  onLike: (id: string, e: React.MouseEvent) => void
  onShare: (id: string, e: React.MouseEvent) => void
  onSnap: (id: string, e: React.MouseEvent) => void
  onDownload: (imageUrl: string, id: string, e: React.MouseEvent) => void
  onReplySubmit: (id: string, body: string) => Promise<void>
  onDeleteDrawing: (id: string, e: React.MouseEvent) => void
}

export function SketchbookCard({
  drawing,
  isAdminMode,
  likedList,
  passcode,
  isPending,
  buttonFeedback,
  onLike,
  onShare,
  onSnap,
  onDownload,
  onReplySubmit,
  onDeleteDrawing
}: SketchbookCardProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyBody, setReplyBody] = useState('')

  const hasLiked = likedList.includes(drawing.id)

  const handleReplyFormSubmit = async () => {
    if (!replyBody.trim()) return
    try {
      await onReplySubmit(drawing.id, replyBody)
      setIsReplying(false)
      setReplyBody('')
    } catch (e) {
      // Handled in parent
    }
  }

  return (
    <article
      id={`drawing-${drawing.id}`}
      className="group flex flex-col sm:flex-row min-h-[220px] overflow-hidden rounded-md border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/40 dark:hover:bg-slate-900/50 transition-colors duration-150 shadow-none animate-in fade-in-50"
    >
      {/* Drawing Image on the Left */}
      <div 
        className="relative bg-white dark:bg-slate-950 shrink-0 border-slate-200/60 dark:border-slate-800/60 h-64 sm:h-auto w-full sm:w-64 md:w-80 border-b sm:border-b-0 sm:border-r flex flex-col justify-center overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full p-3 flex justify-center">
          <ImageGallery urls={[drawing.imageUrl]} theme="violet" />
        </div>
      </div>

      {/* Right Column details */}
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 min-w-0">
        <StackVertical gap="sm" className="min-w-0">
          <div>
            <h2 className={cn(sansFont.className, 'break-words text-lg font-bold text-slate-950 dark:text-slate-50')}>
              {drawing.author}
            </h2>
            <p className={cn(monoFont.className, 'text-xs text-muted-foreground')}>
              {formatDate(drawing.createdAt).split(',')[0]}
            </p>
          </div>

          {drawing.body && (
            <p className={cn(sansFont.className, 'text-sm leading-relaxed text-slate-700 dark:text-slate-300')}>
              {drawing.body}
            </p>
          )}

          {/* Render mini replies thread (Admin replies) */}
          {drawing.thread && drawing.thread.length > 0 && (
            <div className="space-y-2 border-t border-slate-200/45 dark:border-slate-850/45 pt-3">
              {drawing.thread.map((reply) => (
                <div key={reply.id} className="flex gap-2 items-start rounded-md border border-slate-200/30 bg-slate-100/30 p-2.5 text-xs dark:border-slate-800/30 dark:bg-slate-900/20">
                  <CornerDownRight size={13} className="text-violet-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-violet-650 dark:text-violet-400">mikeblocky</span>
                    <p className="text-slate-655 dark:text-slate-300 break-words leading-relaxed">{reply.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </StackVertical>

        <div className="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800/40 space-y-3">
          {/* Utility actions: Like / Share / Snap / Download / Moderation */}
          <div className="flex items-center justify-between gap-3">
            <div className="drawing-actions flex items-center gap-4">
              <button
                type="button"
                onClick={(e) => onLike(drawing.id, e)}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-mono font-medium transition-colors duration-150 cursor-pointer",
                  hasLiked
                    ? "text-red-500 dark:text-red-400"
                    : "text-muted-foreground hover:text-red-500 dark:hover:text-red-400"
                )}
                title="Like Artwork"
              >
                <Heart size={13} className={cn(hasLiked && "fill-red-500")} />
                <span>{drawing.likes || 0}</span>
              </button>

              <button
                type="button"
                onClick={(e) => onShare(drawing.id, e)}
                className="flex items-center justify-center text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer"
                title={buttonFeedback[`share-${drawing.id}`] || "Share link"}
              >
                <Share2 size={13} />
              </button>

              <button
                type="button"
                onClick={(e) => onSnap(drawing.id, e)}
                className="flex items-center justify-center text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer"
                title={buttonFeedback[`snap-${drawing.id}`] || "Snap card to clipboard"}
              >
                <Camera size={13} />
              </button>

              <button
                type="button"
                onClick={(e) => onDownload(drawing.imageUrl, drawing.id, e)}
                className="flex items-center justify-center text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer"
                title="Download"
              >
                <Download size={13} />
              </button>
            </div>

            {/* Admin moderation controls */}
            {isAdminMode && (
              <div className="flex items-center gap-2.5" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => {
                    setIsReplying(!isReplying)
                    setReplyBody('')
                  }}
                  className="flex items-center justify-center text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer"
                  title="Reply to drawing"
                >
                  <MessageSquareReply size={13} />
                </button>
                <button
                  type="button"
                  onClick={(e) => onDeleteDrawing(drawing.id, e)}
                  className="flex items-center justify-center text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors duration-150 cursor-pointer"
                  title="Delete Artwork"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Admin inline reply form in gallery card */}
          {isReplying && isAdminMode && (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/30 dark:border-slate-800/30" onClick={e => e.stopPropagation()}>
              <textarea
                placeholder="Mike, write feedback..."
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                className="w-full bg-background border border-slate-200 dark:border-slate-850 p-2 text-xs rounded-lg focus:outline-none resize-none h-12 focus:ring-1 focus:ring-violet-300 dark:text-slate-100"
              />
              <div className="flex justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] px-2 font-mono"
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-6 text-[10px] px-3 bg-violet-600 hover:bg-violet-750 text-white rounded border-0 font-mono"
                  disabled={!replyBody.trim()}
                  onClick={handleReplyFormSubmit}
                >
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
