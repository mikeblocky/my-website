'use client'

import { useState } from 'react'
import { SketchbookDrawing } from '../_types/sketchbook'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { Button } from '@/components/ui/primitives/button'
import { Heart, Share2, Camera, Download, MessageSquareReply, Trash2, CornerDownRight } from 'lucide-react'
import { formatBoardDate as formatDate } from '@/lib/boards/board-utils'
import { sansFont, monoFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'

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
    <div
      id={`drawing-${drawing.id}`}
      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200/50 dark:border-slate-850/50 bg-white/40 transition-all duration-200 hover:bg-white/65 hover:border-violet-300/60 dark:bg-slate-950/20 dark:hover:bg-slate-950/35 dark:hover:border-violet-900/40 animate-in fade-in-50"
    >
      {/* Drawing Image — full natural size */}
      <div className="relative w-full overflow-hidden border-b border-slate-200/60 bg-white dark:border-slate-800" onClick={e => e.stopPropagation()}>
        <ImageGallery urls={[drawing.imageUrl]} theme="violet" />
      </div>

      {/* Author and Caption contents */}
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className={cn(monoFont.className, "max-w-full truncate text-[11px] font-bold tracking-wider text-violet-600 dark:text-violet-300")}>
            {drawing.author}
          </span>
          <span className={cn(monoFont.className, "text-[11px] text-muted-foreground")}>
            {formatDate(drawing.createdAt).split(',')[0]}
          </span>
        </div>

        {drawing.body && (
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed break-words">
            {drawing.body}
          </p>
        )}
      </div>

      {/* Reaction Likes & Thread bubbles & Control bar */}
      <div className="mt-auto px-4 pb-4">
        {/* Render mini replies thread (Admin replies) */}
        {drawing.thread && drawing.thread.length > 0 && (
          <div className="mb-3 space-y-2 border-t border-slate-100 dark:border-slate-800/45 pt-3">
            {drawing.thread.map((reply) => (
              <div key={reply.id} className="flex gap-2 items-start rounded-md border border-slate-100 bg-slate-50/50 p-3 text-xs dark:border-slate-800/45 dark:bg-slate-900/30">
                <CornerDownRight size={13} className="text-violet-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-violet-650 dark:text-violet-400">mikeblocky</span>
                  <p className="text-slate-650 dark:text-slate-300 break-words leading-relaxed">{reply.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Utility actions: Like / Share / Snap / Download / Moderation */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-850">
          <div className="drawing-actions flex items-center gap-3.5">
            <button
              type="button"
              onClick={(e) => onLike(drawing.id, e)}
              className={cn(
                "flex items-center gap-1 text-xs font-mono font-medium transition-colors duration-150 cursor-pointer",
                hasLiked
                  ? "text-red-500 dark:text-red-400"
                  : "text-muted-foreground hover:text-red-500 dark:hover:text-red-400"
              )}
              title="Like Masterpiece"
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
            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
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
                title="Delete Masterpiece"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Admin inline reply form in gallery card */}
        {isReplying && isAdminMode && (
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/60 pt-3 dark:border-slate-800/60" onClick={e => e.stopPropagation()}>
            <textarea
              placeholder="Mike, write feedback..."
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              className="w-full bg-background border border-slate-200 dark:border-slate-800 p-2 text-xs rounded-lg focus:outline-none resize-none h-12 focus:ring-1 focus:ring-violet-300 dark:text-slate-100"
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
  )
}
