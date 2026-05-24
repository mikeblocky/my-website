'use client'

import { FormEvent, useEffect, useState, useTransition, useMemo } from 'react'
import { initialTalks } from '../_data/talks'
import { TalkTopic, ThreadMessage } from '../_types/talk'
import { RichText } from '@/components/ui/RichText'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { Button } from '@/components/ui/primitives/button'
import { ChevronLeft, ChevronRight, MessageSquareReply, Bell, CornerDownRight, Share2, Image as ImageIcon } from 'lucide-react'
import { sansFont, monoFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { isPushSupported, subscribeToPush, registerServiceWorker } from '@/lib/push/client'

const seededTalks = [...initialTalks].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
)
const dateFormatter = new Intl.DateTimeFormat('en', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
})

type FormState = {
  author: string
  body: string
}

const ITEMS_PER_PAGE = 5

function sortTalks(items: TalkTopic[]) {
  return items.slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

function formatDate(iso: string) {
  try {
    return dateFormatter.format(new Date(iso))
  } catch (error) {
    return iso
  }
}

/** Determine what the last message role is in the thread */
function lastThreadRole(t: TalkTopic): 'asker' | 'admin' | null {
  if (!t.thread || t.thread.length === 0) return null
  return t.thread[t.thread.length - 1].role
}

export function TalkBoard({ 
  initialTalks: incomingTalks = seededTalks,
  singleMode = false
}: { 
  initialTalks?: TalkTopic[]
  singleMode?: boolean
}) {
  const [formState, setFormState] = useState<FormState>({ author: '', body: '' })
  const [talks, setTalks] = useState<TalkTopic[]>(sortTalks(incomingTalks))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(incomingTalks.length === 0)
  const [isRefreshing, setIsRefreshing] = useState(incomingTalks.length > 0)
  const [isPending, startTransition] = useTransition()
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  // Reply state (admin)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [passcode, setPasscode] = useState('')

  // Follow-up state (visitor)
  const [followingUp, setFollowingUp] = useState<string | null>(null)
  const [followUpBody, setFollowUpBody] = useState('')

  // Push notification state
  const [wantNotification, setWantNotification] = useState(true)
  const [pushSupported, setPushSupported] = useState(false)

  // Toast Notification State
  const [notification, setNotification] = useState<string | null>(null)

  // Edit state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')

  // Attachment states (URLs or Base64)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [replyImageUrls, setReplyImageUrls] = useState<string[]>([])
  const [followUpImageUrls, setFollowUpImageUrls] = useState<string[]>([])
  const [editImageUrls, setEditImageUrls] = useState<string[]>([])

  // Inline button feedback state
  const [buttonFeedback, setButtonFeedback] = useState<Record<string, string>>({})

  function showNotification(msg: string) {
    setNotification(msg)
    setTimeout(() => {
      setNotification((current) => current === msg ? null : current)
    }, 4000)
  }

  function showButtonFeedback(key: string, msg: string) {
    setButtonFeedback(prev => ({ ...prev, [key]: msg }))
    setTimeout(() => {
      setButtonFeedback(prev => {
        const next = { ...prev }
        if (next[key] === msg) delete next[key]
        return next
      })
    }, 2000)
  }

  const handleImageUpload = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      callback(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

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

        const payload = (await response.json()) as { questions?: TalkTopic[] }
        if (!cancelled && Array.isArray(payload.questions)) {
          setTalks(sortTalks(payload.questions))
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
  }, [])

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedBody = formState.body.trim()
    if (!trimmedBody) return

    const payload = {
      author: formState.author,
      body: trimmedBody,
      imageUrl: imageUrls[0] || undefined,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined
    }

    startTransition(async () => {
      try {
        setErrorMessage(null)
        const response = await fetch('/api/talk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          throw new Error('Something went wrong while posting your message.')
        }

        const { question: talk } = (await response.json()) as { question: TalkTopic }
        setTalks((previous) => [talk, ...previous])
        setFormState({ author: '', body: '' })
        setImageUrls([])
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
      } catch (error) {
        const fallback = error instanceof Error ? error.message : 'Unable to send your post.'
        setErrorMessage(fallback)
      }
    })
  }

  async function handleReplySubmit(id: string) {
    if (!replyBody.trim()) return

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
        setReplyingTo(null)
        setReplyBody('')
        setReplyImageUrls([])
        showNotification('Response posted successfully!')
      } catch (error) {
        showNotification('Could not post reply.')
      }
    })
  }

  async function handleFollowUpSubmit(id: string) {
    if (!followUpBody.trim()) return

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

        if (!response.ok) {
          throw new Error('Failed to send follow-up')
        }

        const { question: talk } = await response.json()
        setTalks(prev => prev.map(t => t.id === id ? talk : t))
        setFollowingUp(null)
        setFollowUpBody('')
        setFollowUpImageUrls([])
        showNotification('Follow-up sent!')
      } catch (error) {
        showNotification('Could not send follow-up.')
      }
    })
  }

  async function handleEditSubmit(talkId: string, messageId: string) {
    if (!editBody.trim()) return

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
        setEditingMessageId(null)
        setEditBody('')
        setEditImageUrls([])
        showNotification('Message updated!')
      } catch (error) {
        showNotification('Could not update message.')
      }
    })
  }

  const totalPages = Math.ceil(talks.length / ITEMS_PER_PAGE)
  const paginatedTalks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return talks.slice(start, start + ITEMS_PER_PAGE)
  }, [talks, currentPage])

  async function shareAndSnap(id: string) {
    const element = document.getElementById(`talk-${id}`);
    if (!element) return;
    
    const url = `${window.location.origin}/talk/${id}`;
    const isDark = document.documentElement.classList.contains('dark');
    const actionsDiv = element.querySelector('.talk-actions') as HTMLElement;
    if (actionsDiv) actionsDiv.style.visibility = 'hidden';
    
    // Hide +N overlays and zoom icons during screenshot
    const moreOverlays = element.querySelectorAll('.gallery-more-overlay') as NodeListOf<HTMLElement>;
    const zoomOverlays = element.querySelectorAll('.gallery-zoom-overlay') as NodeListOf<HTMLElement>;
    moreOverlays.forEach(el => el.style.display = 'none');
    zoomOverlays.forEach(el => el.style.display = 'none');
    
    // Add URL watermark at bottom
    const linkBar = document.createElement('div');
    linkBar.style.cssText = `margin-top:12px;padding-top:10px;border-top:1px solid ${isDark ? '#ffffff15' : '#00000010'};font-size:12px;color:${isDark ? '#94a3b8' : '#64748b'};font-family:system-ui,sans-serif;letter-spacing:0.02em;`;
    linkBar.textContent = `🔗 ${url}`;
    element.appendChild(linkBar);
    
    try {
      const { toPng } = await import('html-to-image');
      
      const dataUrl = await toPng(element, { 
        backgroundColor: isDark ? '#1a1525' : '#ffffff',
        style: {
          borderRadius: '16px',
          border: isDark ? '1px solid #3b2d5a' : '1px solid #e2e8f0',
          boxShadow: 'none',
          padding: '24px',
          margin: '0',
          display: 'block',
          color: isDark ? '#f1f5f9' : '#0f172a'
        }
      });
      
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showButtonFeedback(`share-${id}`, '✓ Copied');
      } catch (err) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `talk-${id}.png`;
        a.click();
        showButtonFeedback(`share-${id}`, '✓ Saved');
      }
    } catch (e) {
      console.error('Screenshot failed', e);
      navigator.clipboard.writeText(url);
      showButtonFeedback(`share-${id}`, '✓ Link only');
    } finally {
      if (actionsDiv) actionsDiv.style.visibility = '';
      moreOverlays.forEach(el => el.style.display = '');
      zoomOverlays.forEach(el => el.style.display = '');
      linkBar.remove();
    }
  }

  return (
    <StackVertical gap="lg">
      {!singleMode && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 dark:border-blue-900/30 dark:bg-blue-900/10">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <CornerDownRight size={22} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className={cn(sansFont.className, "text-sm font-bold text-blue-900 dark:text-blue-100")}>
                  Threaded conversations
                </h4>
                <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white">
                  New
                </span>
              </div>
              <p className={cn(sansFont.className, "text-xs text-blue-800/70 dark:text-blue-300/70 leading-relaxed")}>
                You can now follow up on any discussion! Click the <b>Follow up</b> button to reply more!
                Threads with active notifications show a <b><Bell size={10} className="inline mb-0.5" /> bell</b> icon.
              </p>
            </div>
          </div>
        </div>
      )}

      {!singleMode && (
        <form 
          className="rounded-2xl border border-border/60 bg-background/90 transition-colors focus-within:border-blue-400 dark:focus-within:border-blue-500" 
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col">
            {/* Top: Alias Field */}
            <div className="border-b border-border/60 px-4 py-3">
              <input
                type="text"
                value={formState.author}
                onChange={(event) => setFormState((state) => ({ ...state, author: event.target.value }))}
                placeholder="Your alias (optional)"
                className={cn(
                  sansFont.className,
                  "w-full bg-transparent text-sm font-semibold text-blue-600 placeholder:text-muted-foreground/60 focus:outline-none dark:text-blue-400"
                )}
              />
            </div>

            {/* Middle: Message Field */}
            <div className="px-4 py-2">
              <textarea
                value={formState.body}
                onChange={(event) => setFormState((state) => ({ ...state, body: event.target.value }))}
                onInput={(e) => {
                  e.currentTarget.style.height = 'auto';
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                }}
                placeholder="Let's talk about anything... (ask questions, ask for suggestions, casual chat)"
                rows={1}
                className={cn(
                  sansFont.className,
                  "w-full bg-transparent py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-600 resize-none overflow-hidden min-h-[100px]"
                )}
              />
            </div>

            {/* Image attachment preview */}
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2.5 px-4 pb-3">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group/thumb rounded-xl overflow-hidden border border-gray-200/80 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/50 p-1">
                    <img src={url} alt="Attachment thumbnail" className="rounded-lg h-16 w-24 object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1.5 right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 text-[9px] leading-none shadow-md cursor-pointer transition-colors"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom: Action Bar */}
            <div className="flex items-center justify-between gap-4 border-t border-border/60 px-4 py-3">
              <div className="flex items-center gap-4">
                {pushSupported && (
                  <label className="flex items-center gap-2.5 cursor-pointer group/notify select-none">
                    <input
                      type="checkbox"
                      checked={wantNotification}
                      onChange={(e) => setWantNotification(e.target.checked)}
                      className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-0 accent-blue-600 cursor-pointer"
                    />
                    <span className={cn(sansFont.className, "text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 group-hover/notify:text-blue-500 transition-colors")}>
                      <Bell size={14} />
                      Notify me
                    </span>
                  </label>
                )}

                <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-blue-500 transition-colors select-none">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files
                      if (files) {
                        Array.from(files).forEach(file => {
                          handleImageUpload(file, (url) => setImageUrls(prev => [...prev, url]))
                        })
                      }
                      e.target.value = ''
                    }}
                    className="hidden"
                  />
                  <ImageIcon size={14} />
                  <span className={cn(sansFont.className, "text-sm font-medium")}>Add images</span>
                </label>
              </div>
              
              <Button 
                type="submit" 
                size="sm"
                disabled={!formState.body.trim() || isPending}
                className="h-10 px-5 text-sm font-semibold"
              >
                Post message
              </Button>
            </div>
          </div>
        </form>
      )}

      {errorMessage && (
        <div className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800 dark:border-orange-500/50 dark:bg-orange-900/20 dark:text-orange-100">
          {errorMessage}
        </div>
      )}

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border/60 pb-3 sm:flex-nowrap">
          <TextHeading as="h3" weight="semibold" className="mt-0 mb-0 text-lg">
            {singleMode ? "Post" : "Talk archive"}
          </TextHeading>
          <div className="flex shrink-0 items-center gap-3">
            {isRefreshing ? (
              <Text variant="muted" size="xs">
                Refreshing...
              </Text>
            ) : null}
            <Text variant="muted" size="sm" className="whitespace-nowrap">
              {talks.length} posts collected
            </Text>
          </div>
        </div>

        <StackVertical gap="md">
          {isLoading && talks.length === 0 ? (
            <div className="py-8 text-center">
              <Text variant="muted" size="sm">
                Loading history...
              </Text>
            </div>
          ) : (
            paginatedTalks.map((talk: TalkTopic) => {
              const thread = talk.thread || []
              const lastRole = lastThreadRole(talk)
              const canFollowUp = lastRole === 'admin'
              const canReply = true

              return (
                <article 
                  id={`talk-${talk.id}`} 
                  key={talk.id} 
                  className="group relative rounded-2xl border border-border/60 bg-background/80 p-6 transition-colors hover:border-blue-500/15 hover:bg-muted/10"
                >
                  <StackVertical gap="sm">
                    {/* Original talk */}
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                        <span className={cn(sansFont.className, "rounded-full border border-blue-200/70 bg-blue-50/70 px-2.5 py-1 dark:border-blue-500/20 dark:bg-blue-500/10")}>{talk.author} shared</span>
                      </h4>
                      <div className="flex items-center gap-1 mt-1.5">
                        {talk.notifying && (
                          <div className="flex items-center mr-1" title="Notifications active">
                            <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/10">
                              <Bell size={14} className="text-blue-600 dark:text-blue-400 fill-blue-600/10" />
                              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 animate-pulse" />
                            </div>
                          </div>
                        )}
                        <span className={cn(sansFont.className, "text-xs text-muted-foreground")}>
                          {formatDate(talk.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className={cn(sansFont.className, "text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-medium mb-2 break-words")}>
                      <RichText text={talk.body} theme="blue" />
                    </div>

                    {/* Talk image attachment */}
                    <ImageGallery 
                      urls={talk.imageUrls?.length ? talk.imageUrls : (talk.imageUrl ? [talk.imageUrl] : [])} 
                      theme="blue"
                    />

                    {/* Thread messages */}
                    {thread.length > 0 && (
                      <div className="mt-2 space-y-3">
                        {thread.map((msg, i) => (
                          <ThreadBubble 
                            key={msg.id} 
                            message={msg} 
                            depth={i} 
                            author={talk.author}
                            talkId={talk.id}
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
                              setReplyingTo(null)
                              setFollowingUp(null)
                            }}
                            onCancel={() => setEditingMessageId(null)}
                            onSave={() => handleEditSubmit(talk.id, msg.id)}
                            passcode={passcode}
                            setPasscode={setPasscode}
                            isPending={isPending}
                          />
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="talk-actions mt-1 flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => shareAndSnap(talk.id)}
                        className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300"
                      >
                        <Share2 size={14} />
                        {buttonFeedback[`share-${talk.id}`] || 'Share'}
                      </button>
                      {canFollowUp && (
                        <button
                          onClick={() => {
                             setFollowingUp(followingUp === talk.id ? null : talk.id)
                             setFollowUpBody('')
                             setFollowUpImageUrls([])
                             setReplyingTo(null)
                          }}
                          className="flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/15"
                        >
                          <CornerDownRight size={14} />
                          Follow up
                        </button>
                      )}
                      {canReply && (
                        <button
                          onClick={() => {
                             setReplyingTo(replyingTo === talk.id ? null : talk.id)
                             setReplyBody('')
                             setReplyImageUrls([])
                             setFollowingUp(null)
                          }}
                          className="flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-blue-50/70 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/15"
                        >
                          <MessageSquareReply size={14} />
                          Reply
                        </button>
                      )}
                    </div>

                    {/* Admin reply form */}
                    {replyingTo === talk.id && (
                      <div className="mt-3 border-t border-border/60 pt-3">
                        <textarea
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          onInput={(e) => {
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                          }}
                          placeholder="Write your response..."
                          rows={1}
                          className={cn(sansFont.className, "min-h-[44px] w-full resize-none overflow-hidden rounded-xl border border-border bg-background px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:text-slate-100")}
                        />
                        {/* image thumbnails */}
                        {replyImageUrls.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2.5">
                            {replyImageUrls.map((url, idx) => (
                              <div key={idx} className="relative group/thumb border border-border bg-muted/40 p-0.5 rounded-lg">
                                <img src={url} alt="Reply attachment" className="rounded max-h-16 w-24 object-cover" />
                                <button 
                                  type="button" 
                                  onClick={() => setReplyImageUrls(prev => prev.filter((_, i) => i !== idx))} 
                                  className="absolute top-1 right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 text-[8px] leading-none transition-colors cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 flex justify-between items-center gap-2">
                          <div className="flex items-center gap-3">
                            <input 
                              type="password"
                              value={passcode}
                              onChange={e => setPasscode(e.target.value)}
                              placeholder="Passcode"
                              className="w-24 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:text-slate-100"
                            />
                            <label className="flex items-center gap-1 cursor-pointer text-slate-500 hover:text-blue-500 text-xs font-semibold select-none">
                              <input 
                                type="file" 
                                accept="image/*" 
                                multiple
                                onChange={e => {
                                  const files = e.target.files
                                  if (files) {
                                    Array.from(files).forEach(file => {
                                      handleImageUpload(file, (url) => setReplyImageUrls(prev => [...prev, url]))
                                    })
                                  }
                                  e.target.value = ''
                                }} 
                                className="hidden" 
                              />
                              <ImageIcon size={12} />
                              Attach images
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="text-xs h-8">
                              Cancel
                            </Button>
                            <Button size="sm" disabled={isPending || !replyBody.trim()} onClick={() => handleReplySubmit(talk.id)} className="h-8 rounded-full px-4 text-xs">
                              Post
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Visitor follow-up form */}
                    {followingUp === talk.id && (
                      <div className="mt-3 border-t border-border/60 pt-3">
                        <textarea
                          value={followUpBody}
                          onChange={(e) => setFollowUpBody(e.target.value)}
                          onInput={(e) => {
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                          }}
                          placeholder="Add to this discussion..."
                          rows={1}
                          className={cn(sansFont.className, "min-h-[44px] w-full resize-none overflow-hidden rounded-xl border border-emerald-200 bg-background px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:border-emerald-500/30 dark:text-slate-100")}
                        />
                        {/* image thumbnails */}
                        {followUpImageUrls.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2.5">
                            {followUpImageUrls.map((url, idx) => (
                              <div key={idx} className="relative group/thumb border border-border bg-muted/40 p-0.5 rounded-lg animate-in zoom-in-95">
                                <img src={url} alt="Followup attachment" className="rounded max-h-16 w-24 object-cover" />
                                <button 
                                  type="button" 
                                  onClick={() => setFollowUpImageUrls(prev => prev.filter((_, i) => i !== idx))} 
                                  className="absolute top-1 right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 text-[8px] leading-none transition-colors cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 flex justify-between items-center gap-2">
                          <label className="flex items-center gap-1 cursor-pointer text-slate-500 hover:text-emerald-500 text-xs font-semibold select-none">
                            <input 
                              type="file" 
                              accept="image/*" 
                              multiple
                              onChange={e => {
                                const files = e.target.files
                                if (files) {
                                  Array.from(files).forEach(file => {
                                    handleImageUpload(file, (url) => setFollowUpImageUrls(prev => [...prev, url]))
                                  })
                                }
                                e.target.value = ''
                              }} 
                              className="hidden" 
                            />
                            <ImageIcon size={12} />
                            Attach images
                          </label>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setFollowingUp(null)} className="text-xs h-8">
                              Cancel
                            </Button>
                            <Button size="sm" disabled={isPending || !followUpBody.trim()} onClick={() => handleFollowUpSubmit(talk.id)} className="h-8 rounded-full px-4 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                              Send follow-up
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </StackVertical>
                </article>
              )
            })
          )}
        </StackVertical>

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
      </section>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, x: '-50%' }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-50 flex items-center gap-2 rounded-xl border border-blue-200 bg-white/95 backdrop-blur-sm pl-4 pr-1.5 py-1.5 shadow-sm dark:border-blue-500/30 dark:bg-[#1a1525] w-[calc(100%-2rem)] md:w-auto max-w-sm"
          >
            <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
            <span className={cn(sansFont.className, "text-sm text-slate-800 dark:text-slate-200 truncate")}>
              {notification}
            </span>
            <button
              onClick={() => setNotification(null)}
              className={cn(monoFont.className, "ml-auto rounded-lg border border-blue-100 bg-blue-50/50 px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50")}
            >
              close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </StackVertical>
  )
}

/** A single thread message rendered as a layered bubble */
function ThreadBubble({ 
  message, 
  depth, 
  author,
  talkId,
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
  isPending
}: { 
  message: ThreadMessage; 
  depth: number; 
  author?: string;
  talkId: string;
  isEditing: boolean;
  editBody: string;
  setEditBody: (v: string) => void;
  editImageUrls: string[];
  setEditImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
  onEditClick: () => void;
  onCancel: () => void;
  onSave: () => void;
  passcode: string;
  setPasscode: (v: string) => void;
  isPending: boolean;
}) {
  const isAdmin = message.role === 'admin'
  const indent = (Math.min(depth, 3) + 1) * 16

  const handleImageUpload = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      callback(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div
      style={{ marginLeft: isEditing ? '0px' : `${indent}px` }}
      className={cn(
        "group/bubble relative rounded-xl border p-4 transition-all duration-300",
        isAdmin
          ? "border-blue-200/60 bg-blue-50/30 dark:border-blue-500/15 dark:bg-blue-500/5"
          : "border-emerald-200/60 bg-emerald-50/30 dark:border-emerald-500/15 dark:bg-emerald-500/5",
        isEditing && "border-blue-400 ring-4 ring-blue-500/5 dark:border-blue-400/50"
      )}
    >
      {!isEditing && (
        <div 
          className={cn(
            "absolute -left-4 top-[-16px] bottom-1/2 w-4 border-l-2 border-b-2 rounded-bl-lg pointer-events-none",
            isAdmin 
              ? "border-blue-200/70 dark:border-blue-500/20" 
              : "border-emerald-200/70 dark:border-emerald-500/20"
          )}
        />
      )}
      <div className="flex items-center gap-2 mb-1.5 overflow-hidden">
        <CornerDownRight size={12} className={isAdmin ? "text-blue-400" : "text-emerald-400"} />
        <span className={cn(
          sansFont.className,
          "text-xs font-bold",
          isAdmin ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"
        )}>
          {isAdmin ? 'Response' : (author || 'anonymous')}
        </span>
        
        <div className="ml-auto flex items-center gap-2">
          <span className={cn(
            sansFont.className, 
            "text-[11px] text-muted-foreground whitespace-nowrap transition-transform duration-300",
            isAdmin && !isEditing && "group-hover/bubble:-translate-x-1"
          )}>
            {formatDate(message.createdAt)}
          </span>
          {isAdmin && !isEditing && (
            <div className="w-0 overflow-hidden opacity-0 group-hover/bubble:w-8 group-hover/bubble:opacity-100 transition-all duration-300">
              <button 
                onClick={onEditClick}
                className="text-[10px] font-bold uppercase tracking-wider text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
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
              e.currentTarget.style.height = 'auto';
              e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
            }}
            rows={Math.max(3, message.body.split('\n').length)}
            autoFocus
            className={cn(sansFont.className, "min-h-[100px] w-full resize-none overflow-hidden rounded-lg border border-blue-200 bg-background px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-blue-500/30 dark:text-slate-100")}
          />
          {editImageUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2.5">
              {editImageUrls.map((url, idx) => (
                <div key={idx} className="relative group/thumb border border-border bg-muted/40 p-0.5 rounded-lg animate-in zoom-in-95">
                  <img src={url} alt="Edit attachment" className="rounded max-h-16 w-24 object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setEditImageUrls(prev => prev.filter((_, i) => i !== idx))} 
                    className="absolute top-1 right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 text-[8px] leading-none transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-3">
              <input 
                type="password"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Passcode"
                className="w-24 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:text-slate-100"
              />
              <label className="flex items-center gap-1 cursor-pointer text-slate-500 hover:text-blue-500 text-xs font-semibold select-none">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={e => {
                    const files = e.target.files
                    if (files) {
                      Array.from(files).forEach(file => {
                        handleImageUpload(file, (url) => setEditImageUrls(prev => [...prev, url]))
                      })
                    }
                    e.target.value = ''
                  }} 
                  className="hidden" 
                />
                <ImageIcon size={12} />
                Attach images
              </label>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs h-8">
                Cancel
              </Button>
              <Button size="sm" disabled={isPending || !editBody.trim()} onClick={onSave} className="h-8 rounded-full px-4 text-xs">
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={cn(sansFont.className, "text-sm text-slate-700 dark:text-slate-350 leading-relaxed break-words")}>
            <RichText text={message.body} theme="blue" />
          </div>
          <ImageGallery 
            urls={message.imageUrls?.length ? message.imageUrls : (message.imageUrl ? [message.imageUrl] : [])} 
            theme="blue"
          />
        </>
      )}
    </div>
  )
}
