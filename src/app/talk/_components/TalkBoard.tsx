'use client'

import { useEffect, useState, useTransition, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { initialTalks } from '../_data/talks'
import { TalkTopic } from '../_types/talk'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { monoFont } from '@/styles/fonts/fonts'
import { isPushSupported, subscribeToPush, registerServiceWorker } from '@/lib/push/client'
import { sortByCreatedAt, type ApiCooldown } from '@/lib/boards/board-utils'
import { useBoardCooldown, useButtonFeedback, useControlledState, useTimedMessage } from '@/lib/boards/board-hooks'
import { AdminLockToggle } from '@/components/ui/admin/AdminLockToggle'
import { snapTalkCard } from './talk-snap'
import { TalkPostForm } from './TalkPostForm'
import { TalkPostItem } from './TalkPostItem'
import { BoardShell } from '@/app/interact/_components/BoardShell'

const seededTalks = sortByCreatedAt(initialTalks)
const ITEMS_PER_PAGE = 5

export function TalkBoard({ 
  initialTalks: incomingTalks = seededTalks,
  singleMode = false,
  isAdminMode: parentIsAdminMode,
  setIsAdminMode: parentSetIsAdminMode,
  passcode: parentPasscode,
  setPasscode: parentSetPasscode
}: { 
  initialTalks?: TalkTopic[]
  singleMode?: boolean
  isAdminMode?: boolean
  setIsAdminMode?: (v: boolean) => void
  passcode?: string
  setPasscode?: (v: string) => void
}) {
  const [talks, setTalks] = useState<TalkTopic[]>(sortByCreatedAt(incomingTalks))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(incomingTalks.length === 0)
  const [isRefreshing, setIsRefreshing] = useState(incomingTalks.length > 0)
  const [isPending, startTransition] = useTransition()
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  // Fallback states if not parent-controlled:
  const [showPasscodeInput, setShowPasscodeInput] = useState(false)

  const [passcode, setPasscode] = useControlledState(parentPasscode, parentSetPasscode, '')
  const [isAdminMode, setIsAdminMode] = useControlledState(parentIsAdminMode, parentSetIsAdminMode, false)

  // Push notification state
  const [wantNotification, setWantNotification] = useState(true)
  const [pushSupported, setPushSupported] = useState(false)

  // Toast Notification State
  const { message: notification, showMessage: showNotification, clearMessage: clearNotification } = useTimedMessage()

  // Inline button feedback state
  const { feedback: buttonFeedback, showFeedback: showButtonFeedback } = useButtonFeedback()
  const { isCooldownActive, cooldownLabel, applyCooldown } = useBoardCooldown()

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    // Check push support & register service worker
    setPushSupported(isPushSupported())
    registerServiceWorker()

    if (singleMode) {
      setIsLoading(false)
      setIsRefreshing(false)
      return
    }

    async function loadTalks() {
      try {
        const response = await fetch('/api/talk', { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`)
        }

        const payload = (await response.json()) as { questions?: TalkTopic[], cooldown?: ApiCooldown }
        if (!cancelled && Array.isArray(payload.questions)) {
          setTalks(sortByCreatedAt(payload.questions))
          applyCooldown(payload.cooldown)
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        console.error('Unable to load talks', error)
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

    loadTalks()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [applyCooldown, showNotification, singleMode])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      if (hash.startsWith('#talk-')) {
        const id = hash.replace('#talk-', '');
        // Find which index this talk has in the sorted talks array
        const index = talks.findIndex(t => t.id === id);
        if (index !== -1) {
          const page = Math.ceil((index + 1) / ITEMS_PER_PAGE);
          setCurrentPage(page);
          
          // Now scroll and highlight after setting page and allowing DOM to update
          setTimeout(() => {
            const element = document.getElementById(`talk-${id}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('ring-4', 'ring-blue-500/30', 'border-blue-500');
              setTimeout(() => {
                element.classList.remove('ring-4', 'ring-blue-500/30', 'border-blue-500');
              }, 4000);
            }
          }, 600);
        }
      }
    }
  }, [talks]);

  const handleSubmit = async (payload: { author: string, body: string, imageUrls: string[] }) => {
    const postPayload = {
      author: payload.author,
      body: payload.body,
      imageUrl: payload.imageUrls[0] || undefined,
      imageUrls: payload.imageUrls.length > 0 ? payload.imageUrls : undefined
    }

    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          setErrorMessage(null)
          const response = await fetch('/api/talk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postPayload)
          })

          const result = (await response.json()) as { question?: TalkTopic, cooldown?: ApiCooldown, error?: string }
          applyCooldown(result.cooldown)

          if (!response.ok || !result.question) {
            throw new Error(result.error || 'Something went wrong while posting your message.')
          }

          const talk = result.question
          setTalks((previous) => [talk, ...previous])
          setCurrentPage(1)

          // Subscribe to push notifications for this talk
          if (wantNotification && pushSupported) {
            const subscribed = await subscribeToPush(talk.id)
            if (subscribed) {
              setTalks(prev => prev.map(t => t.id === talk.id ? { ...t, notifying: true } : t))
              showNotification('Post sent! You will be notified when replied.')
            } else {
              showNotification('Post sent! (Notifications could not be enabled)')
            }
          } else {
            showNotification('Post sent successfully!')
          }
          resolve()
        } catch (error) {
          const fallback = error instanceof Error ? error.message : 'Unable to send your post.'
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
          const response = await fetch('/api/talk', {
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

          const { question: talk } = await response.json()
          setTalks(prev => prev.map(t => t.id === id ? talk : t))
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
          const response = await fetch('/api/talk', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id,
              body: followUpBody,
              imageUrl: followUpImageUrls[0] || undefined,
              imageUrls: followUpImageUrls.length > 0 ? followUpImageUrls : undefined
            })
          })

          const result = (await response.json()) as { question?: TalkTopic, cooldown?: ApiCooldown, error?: string }
          applyCooldown(result.cooldown)

          if (!response.ok || !result.question) {
            throw new Error(result.error || 'Failed to send follow-up')
          }

          const talk = result.question
          setTalks(prev => prev.map(t => t.id === id ? talk : t))
          showNotification('Follow-up sent!')
          resolve()
        } catch (error) {
          showNotification(error instanceof Error ? error.message : 'Could not send follow-up.')
          reject(error)
        }
      })
    })
  }

  const handleEditSubmit = async (talkId: string, messageId: string, editBody: string, editImageUrls: string[]) => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          setErrorMessage(null)
          const response = await fetch('/api/talk', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: talkId,
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

          const { question: talk } = await response.json()
          setTalks(prev => prev.map(t => t.id === talkId ? talk : t))
          showNotification('Message updated!')
          resolve()
        } catch (error) {
          showNotification('Could not update message.')
          reject(error)
        }
      })
    })
  }

  const totalPages = Math.ceil(talks.length / ITEMS_PER_PAGE)
  const paginatedTalks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return talks.slice(start, start + ITEMS_PER_PAGE)
  }, [talks, currentPage])

  async function shareAndSnap(id: string) {
    const url = `${window.location.origin}/talk/${id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Talk board post',
          text: 'Talk board post on mikeblocky.com',
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
    try {
      const result = await snapTalkCard(id)
      if (result === 'snapped') showButtonFeedback(`snap-${id}`, '✓ Snapped')
      if (result === 'saved') showButtonFeedback(`snap-${id}`, '✓ Saved')
    } catch (e) {
      console.error('Snap failed', e)
      showButtonFeedback(`snap-${id}`, 'Could not snap')
    }
  }

  return (
    <BoardShell
      title={singleMode ? "Post" : "Talk archive"}
      count={talks.length}
      isRefreshing={isRefreshing}
      isLoading={isLoading}
      isAdminMode={isAdminMode}
      setIsAdminMode={setIsAdminMode}
      passcode={passcode}
      setPasscode={setPasscode}
      accent="blue"
      formButtonLabel="write in the guestbook"
      singleMode={singleMode}
      formComponent={
        <TalkPostForm
          onSubmit={handleSubmit}
          isPending={isPending}
          isCooldownActive={isCooldownActive}
          cooldownLabel={cooldownLabel}
          pushSupported={pushSupported}
          wantNotification={wantNotification}
          setWantNotification={setWantNotification}
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
            {isLoading && talks.length === 0 ? (
              <div className="py-8 text-center">
                <Text variant="muted" size="sm">
                  Loading history...
                </Text>
              </div>
            ) : (
              paginatedTalks.map((talk: TalkTopic) => (
                <TalkPostItem
                  key={talk.id}
                  talk={talk}
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
            className="p-2 rounded-lg text-slate-500 hover:bg-blue-100 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-blue-900/30 transition-colors"
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
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 hover:bg-blue-100 dark:text-slate-400 dark:hover:bg-blue-900/30'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg text-slate-500 hover:bg-blue-100 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-blue-900/30 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </BoardShell>
  )
}
