'use client'

import { useEffect, useState, useTransition, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { initialPrompts } from '../_data/prompts'
import { DrawPrompt } from '../_types/draw'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { sortByCreatedAt, type ApiCooldown } from '@/lib/boards/board-utils'
import { useBoardCooldown, useButtonFeedback, useControlledState, useTimedMessage } from '@/lib/boards/board-hooks'
import { AdminLockToggle } from '@/components/ui/admin/AdminLockToggle'
import { DrawPromptForm } from './DrawPromptForm'
import { DrawPromptItem } from './DrawPromptItem'
import { BoardShell } from '@/app/interact/_components/BoardShell'

const seededPrompts = sortByCreatedAt(initialPrompts)
const ITEMS_PER_PAGE = 5

export function DrawBoard({ 
  initialPrompts = seededPrompts,
  singleMode = false,
  isAdminMode: parentIsAdminMode,
  setIsAdminMode: parentSetIsAdminMode,
  passcode: parentPasscode,
  setPasscode: parentSetPasscode
}: { 
  initialPrompts?: DrawPrompt[]
  singleMode?: boolean
  isAdminMode?: boolean
  setIsAdminMode?: (v: boolean) => void
  passcode?: string
  setPasscode?: (v: string) => void
}) {
  const [prompts, setPrompts] = useState<DrawPrompt[]>(sortByCreatedAt(initialPrompts))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(initialPrompts.length === 0)
  const [isRefreshing, setIsRefreshing] = useState(initialPrompts.length > 0)
  const [isPending, startTransition] = useTransition()
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  // Fallback states if not parent-controlled:
  const [showPasscodeInput, setShowPasscodeInput] = useState(false)

  const [passcode, setPasscode] = useControlledState(parentPasscode, parentSetPasscode, '')
  const [isAdminMode, setIsAdminMode] = useControlledState(parentIsAdminMode, parentSetIsAdminMode, false)

  // Toast Notification State
  const { message: notification, showMessage: showNotification, clearMessage: clearNotification } = useTimedMessage()

  // Inline button feedback state
  const { feedback: buttonFeedback, showFeedback: showButtonFeedback } = useButtonFeedback()
  const { isCooldownActive, cooldownLabel, applyCooldown } = useBoardCooldown()

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    if (singleMode) {
      setIsLoading(false)
      setIsRefreshing(false)
      return
    }

    async function loadPrompts() {
      try {
        const response = await fetch('/api/draw', { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`)
        }

        const payload = (await response.json()) as { prompts?: DrawPrompt[], cooldown?: ApiCooldown }
        if (!cancelled && Array.isArray(payload.prompts)) {
          setPrompts(sortByCreatedAt(payload.prompts))
          applyCooldown(payload.cooldown)
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        console.error('Unable to load prompts', error)
        if (!cancelled) {
          showNotification('Unable to refresh the archive. Showing the latest cached list.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    }

    loadPrompts()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [applyCooldown, showNotification, singleMode])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      if (hash.startsWith('#prompt-')) {
        const id = hash.replace('#prompt-', '');
        const index = prompts.findIndex(p => p.id === id);
        if (index !== -1) {
          const page = Math.ceil((index + 1) / ITEMS_PER_PAGE);
          setCurrentPage(page);
          
          setTimeout(() => {
            const element = document.getElementById(`prompt-${id}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('ring-4', 'ring-violet-500/30', 'border-violet-500');
              setTimeout(() => {
                element.classList.remove('ring-4', 'ring-violet-500/30', 'border-violet-500');
              }, 4000);
            }
          }, 600);
        }
      }
    }
  }, [prompts]);

  const handleSubmit = async (payload: { author: string, body: string, character: string, media: string, imageUrls: string[] }) => {
    const postPayload = {
      author: payload.author,
      body: payload.body,
      character: payload.character || undefined,
      media: payload.media || undefined,
      imageUrl: payload.imageUrls[0] || undefined,
      imageUrls: payload.imageUrls.length > 0 ? payload.imageUrls : undefined
    }

    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          setErrorMessage(null)
          const response = await fetch('/api/draw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postPayload)
          })

          const result = (await response.json()) as { prompt?: DrawPrompt, cooldown?: ApiCooldown, error?: string }
          applyCooldown(result.cooldown)

          if (!response.ok || !result.prompt) {
            throw new Error(result.error || 'Something went wrong while sending your prompt.')
          }

          const prompt = result.prompt
          setPrompts((previous) => [prompt, ...previous])
          setCurrentPage(1)
          showNotification('Prompt suggestion sent successfully!')
          resolve()
        } catch (error) {
          const fallback = error instanceof Error ? error.message : 'Unable to send your prompt.'
          setErrorMessage(fallback)
          reject(error)
        }
      })
    })
  }

  const handleReplySubmit = async (id: string, replyBody: string, replyImageUrls: string[]) => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          setErrorMessage(null)
          const response = await fetch('/api/draw', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id,
              reply: replyBody,
              passcode,
              imageUrl: replyImageUrls[0] || undefined,
              imageUrls: replyImageUrls.length > 0 ? replyImageUrls : undefined
            })
          })

          if (!response.ok) {
            throw new Error('Failed to post reply')
          }

          const { prompt } = await response.json()
          setPrompts(prev => prev.map(p => p.id === id ? prompt : p))
          showNotification('Response posted successfully!')
          resolve()
        } catch (error) {
          showNotification('Could not post reply.')
          reject(error)
        }
      })
    })
  }

  const handleFollowUpSubmit = async (id: string, followUpBody: string, followUpImageUrls: string[]) => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          setErrorMessage(null)
          const response = await fetch('/api/draw', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id,
              body: followUpBody,
              imageUrl: followUpImageUrls[0] || undefined,
              imageUrls: followUpImageUrls.length > 0 ? followUpImageUrls : undefined
            })
          })

          const result = (await response.json()) as { prompt?: DrawPrompt, cooldown?: ApiCooldown, error?: string }
          applyCooldown(result.cooldown)

          if (!response.ok || !result.prompt) {
            throw new Error(result.error || 'Failed to send follow-up')
          }

          const prompt = result.prompt
          setPrompts(prev => prev.map(p => p.id === id ? prompt : p))
          showNotification('Follow-up sent!')
          resolve()
        } catch (error) {
          showNotification(error instanceof Error ? error.message : 'Could not send follow-up.')
          reject(error)
        }
      })
    })
  }

  const handleEditSubmit = async (promptId: string, messageId: string, editBody: string, editImageUrls: string[]) => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          setErrorMessage(null)
          const response = await fetch('/api/draw', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: promptId,
              messageId,
              body: editBody,
              passcode,
              imageUrl: editImageUrls[0] || undefined,
              imageUrls: editImageUrls.length > 0 ? editImageUrls : undefined
            })
          })

          if (!response.ok) {
            throw new Error('Failed to update message')
          }

          const { prompt } = await response.json()
          setPrompts(prev => prev.map(p => p.id === promptId ? prompt : p))
          showNotification('Message updated!')
          resolve()
        } catch (error) {
          showNotification('Could not update message.')
          reject(error)
        }
      })
    })
  }

  const totalPages = Math.ceil(prompts.length / ITEMS_PER_PAGE)
  const paginatedPrompts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return prompts.slice(start, start + ITEMS_PER_PAGE)
  }, [prompts, currentPage])

  async function shareAndSnap(id: string) {
    const url = `${window.location.origin}/draw/${id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Drawing prompt suggestion',
          text: 'Drawing prompt suggestion on mikeblocky.com',
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
      showButtonFeedback(`share-${id}`, '✓ Link copied');
    } catch (e) {
      console.error('Share failed', e);
      showButtonFeedback(`share-${id}`, 'Could not share');
    }
  }

  async function snapAndCopy(id: string) {
    const element = document.getElementById(`prompt-${id}`);
    if (!element) return;

    const url = `${window.location.origin}/draw/${id}`;
    const isDark = document.documentElement.classList.contains('dark');
    const actionsDiv = element.querySelector('.prompt-actions') as HTMLElement;
    if (actionsDiv) actionsDiv.style.visibility = 'hidden';

    const moreOverlays = element.querySelectorAll('.gallery-more-overlay') as NodeListOf<HTMLElement>;
    const zoomOverlays = element.querySelectorAll('.gallery-zoom-overlay') as NodeListOf<HTMLElement>;
    moreOverlays.forEach(el => el.style.display = 'none');
    zoomOverlays.forEach(el => el.style.display = 'none');

    const linkBar = document.createElement('div');
    linkBar.style.cssText = `margin-top:12px;padding-top:10px;border-top:1px solid ${isDark ? '#ffffff15' : '#00000010'};font-size:12px;color:${isDark ? '#94a3b8' : '#64748b'};font-family:system-ui,sans-serif;letter-spacing:0.02em;`;
    linkBar.textContent = `Link: ${url}`;
    element.appendChild(linkBar);

    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(element, {
        backgroundColor: isDark ? '#110c1c' : '#ffffff',
        style: {
          borderRadius: '16px',
          border: isDark ? '1px solid #4c2f77' : '1px solid #f3e8ff',
          boxShadow: 'none',
          padding: '24px',
          margin: '0',
          display: 'block',
          color: isDark ? '#f5f3ff' : '#1e1b4b'
        }
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showButtonFeedback(`snap-${id}`, '✓ Snapped');
      } catch (err) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `draw-${id}.png`;
        a.click();
        showButtonFeedback(`snap-${id}`, '✓ Saved');
      }
    } catch (e) {
      console.error('Snap failed', e);
      showButtonFeedback(`snap-${id}`, 'Could not snap');
    } finally {
      if (actionsDiv) actionsDiv.style.visibility = '';
      moreOverlays.forEach(el => el.style.display = '');
      zoomOverlays.forEach(el => el.style.display = '');
      linkBar.remove();
    }
  }

  return (
    <BoardShell
      title={singleMode ? "Drawing prompt" : "Drawing prompts"}
      count={prompts.length}
      isRefreshing={isRefreshing}
      isLoading={isLoading}
      isAdminMode={isAdminMode}
      setIsAdminMode={setIsAdminMode}
      passcode={passcode}
      setPasscode={setPasscode}
      accent="violet"
      formButtonLabel="suggest a drawing prompt"
      singleMode={singleMode}
      formComponent={
        <DrawPromptForm
          onSubmit={handleSubmit}
          isPending={isPending}
          isCooldownActive={isCooldownActive}
          cooldownLabel={cooldownLabel}
          showNotification={showNotification}
        />
      }
      notification={notification}
      clearNotification={clearNotification}
    >
      {errorMessage && (
        <div className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800 dark:border-orange-500/50 dark:bg-orange-900/20 dark:text-orange-100">
          {errorMessage}
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        >
          <StackVertical gap="md">
            {isLoading && prompts.length === 0 ? (
              <div className="py-8 text-center">
                <Text variant="muted" size="sm">
                  Loading prompts...
                </Text>
              </div>
            ) : (
              paginatedPrompts.map((prompt: DrawPrompt) => (
                <DrawPromptItem
                  key={prompt.id}
                  prompt={prompt}
                  isAdminMode={isAdminMode}
                  passcode={passcode}
                  setPasscode={setPasscode}
                  isPending={isPending}
                  buttonFeedback={buttonFeedback}
                  isCooldownActive={isCooldownActive}
                  cooldownLabel={cooldownLabel}
                  onShare={shareAndSnap}
                  onSnap={snapAndCopy}
                  onReplySubmit={handleReplySubmit}
                  onFollowUpSubmit={handleFollowUpSubmit}
                  onEditSubmit={handleEditSubmit}
                  showNotification={showNotification}
                />
              ))
            )}
          </StackVertical>
        </motion.div>
      </AnimatePresence>

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4 border-t border-border/60 pt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg text-slate-500 hover:bg-violet-100 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-violet-900/30 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === i + 1
                    ? 'bg-violet-500 text-white'
                    : 'text-slate-600 hover:bg-violet-100 dark:text-slate-400 dark:hover:bg-violet-900/30'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg text-slate-500 hover:bg-violet-100 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-violet-900/30 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </BoardShell>
  )
}
