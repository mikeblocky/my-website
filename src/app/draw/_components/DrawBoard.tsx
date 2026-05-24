'use client'

import { FormEvent, useEffect, useState, useTransition, useMemo } from 'react'
import { initialPrompts } from '../_data/prompts'
import { DrawPrompt, DrawThreadMessage } from '../_types/draw'
import { RichText } from '@/components/ui/RichText'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { Button } from '@/components/ui/primitives/button'
import { ChevronLeft, ChevronRight, MessageSquareReply, Camera, CornerDownRight, Share2, Palette, Bell, Image as ImageIcon } from 'lucide-react'
import { sansFont, monoFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import { AnimatePresence, motion } from 'framer-motion'

const seededPrompts = [...initialPrompts].sort(
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

function sortPrompts(items: DrawPrompt[]) {
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
function lastThreadRole(p: DrawPrompt): 'asker' | 'admin' | null {
  if (!p.thread || p.thread.length === 0) return null
  return p.thread[p.thread.length - 1].role
}

export function DrawBoard({ 
  initialPrompts = seededPrompts,
  singleMode = false
}: { 
  initialPrompts?: DrawPrompt[]
  singleMode?: boolean
}) {
  const [formState, setFormState] = useState<FormState>({ author: '', body: '' })
  const [character, setCharacter] = useState('')
  const [media, setMedia] = useState('')
  const [prompts, setPrompts] = useState<DrawPrompt[]>(sortPrompts(initialPrompts))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(initialPrompts.length === 0)
  const [isRefreshing, setIsRefreshing] = useState(initialPrompts.length > 0)
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

  // Toast Notification State
  const [notification, setNotification] = useState<string | null>(null)

  // Edit state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')

  // Image states
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [replyImageUrls, setReplyImageUrls] = useState<string[]>([])
  const [followUpImageUrls, setFollowUpImageUrls] = useState<string[]>([])
  const [editImageUrls, setEditImageUrls] = useState<string[]>([])

  function showNotification(msg: string) {
    setNotification(msg)
    setTimeout(() => {
      setNotification((current) => current === msg ? null : current)
    }, 4000)
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

        const payload = (await response.json()) as { prompts?: DrawPrompt[] }
        if (!cancelled && Array.isArray(payload.prompts)) {
          setPrompts(sortPrompts(payload.prompts))
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
  }, [])

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedBody = formState.body.trim()
    if (!trimmedBody) return

    const payload = {
      author: formState.author,
      body: trimmedBody,
      character: character.trim() || undefined,
      media: media.trim() || undefined,
      imageUrl: imageUrls[0] || undefined,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined
    }

    startTransition(async () => {
      try {
        setErrorMessage(null)
        const response = await fetch('/api/draw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          throw new Error('Something went wrong while sending your prompt.')
        }

        const { prompt } = (await response.json()) as { prompt: DrawPrompt }
        setPrompts((previous) => [prompt, ...previous])
        setFormState({ author: '', body: '' })
        setCharacter('')
        setMedia('')
        setImageUrls([])
        setCurrentPage(1)
        showNotification('Prompt suggestion sent successfully!')
      } catch (error) {
        const fallback = error instanceof Error ? error.message : 'Unable to send your prompt.'
        setErrorMessage(fallback)
      }
    })
  }

  async function handleReplySubmit(id: string) {
    if (!replyBody.trim()) return

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

        if (!response.ok) {
          throw new Error('Failed to send follow-up')
        }

        const { prompt } = await response.json()
        setPrompts(prev => prev.map(p => p.id === id ? prompt : p))
        setFollowingUp(null)
        setFollowUpBody('')
        setFollowUpImageUrls([])
        showNotification('Follow-up sent!')
      } catch (error) {
        showNotification('Could not send follow-up.')
      }
    })
  }

  async function handleEditSubmit(promptId: string, messageId: string) {
    if (!editBody.trim()) return

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
        setEditingMessageId(null)
        setEditBody('')
        setEditImageUrls([])
        showNotification('Message updated!')
      } catch (error) {
        showNotification('Could not update message.')
      }
    })
  }

  const totalPages = Math.ceil(prompts.length / ITEMS_PER_PAGE)
  const paginatedPrompts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return prompts.slice(start, start + ITEMS_PER_PAGE)
  }, [prompts, currentPage])

  async function takeScreenshot(id: string) {
    const element = document.getElementById(`prompt-${id}`);
    if (!element) return;
    
    const actionsDiv = element.querySelector('.prompt-actions') as HTMLElement;
    if (actionsDiv) actionsDiv.style.visibility = 'hidden';
    
    try {
      const { toPng } = await import('html-to-image');
      const isDark = document.documentElement.classList.contains('dark');
      
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
        showNotification('Copied');
      } catch (err) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `draw-${id}.png`;
        a.click();
        showNotification('Downloaded');
      }
    } catch (e) {
      console.error('Screenshot failed', e);
      showNotification('Failed');
    } finally {
      if (actionsDiv) actionsDiv.style.visibility = '';
    }
  }

  function copyLink(id: string) {
    const url = `${window.location.origin}/draw/${id}`
    navigator.clipboard.writeText(url)
    showNotification('Link copied!')
  }

  return (
    <StackVertical gap="lg">
      {!singleMode && (
        <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-5 dark:border-violet-950/30 dark:bg-violet-950/15">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
              <Palette size={22} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className={cn(sansFont.className, "text-sm font-bold text-violet-900 dark:text-violet-100")}>
                  Suggest a drawing!
                </h4>
                <span className="rounded-full bg-violet-600 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white">
                  Creative
                </span>
              </div>
              <p className={cn(sansFont.className, "text-xs text-violet-800/70 dark:text-violet-300/70 leading-relaxed")}>
                Looking for new inspiration! Suggest a drawing prompt, scene, or character idea below. 
                I will respond to prompts by discussing or linking my completed sketches directly in the threads.
              </p>
            </div>
          </div>
        </div>
      )}

      {!singleMode && (
        <form 
          className="rounded-2xl border border-border/60 bg-background/90 transition-all focus-within:border-violet-400 dark:focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/5" 
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col">
            {/* Top: Alias, Character, Media Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border/60">
              <div className="px-4 py-3 border-b sm:border-b-0 sm:border-r border-border/60">
                <input
                  type="text"
                  value={formState.author}
                  onChange={(event) => setFormState((state) => ({ ...state, author: event.target.value }))}
                  placeholder="Your alias (optional)"
                  className={cn(
                    sansFont.className,
                    "w-full bg-transparent text-sm font-semibold text-violet-600 placeholder:text-muted-foreground/60 focus:outline-none dark:text-violet-400"
                  )}
                />
              </div>
              <div className="px-4 py-3 border-b sm:border-b-0 sm:border-r border-border/60">
                <input
                  type="text"
                  value={character}
                  onChange={(event) => setCharacter(event.target.value)}
                  placeholder="Character(s) (optional)"
                  className={cn(
                    sansFont.className,
                    "w-full bg-transparent text-sm font-semibold text-violet-600 placeholder:text-muted-foreground/60 focus:outline-none dark:text-violet-400"
                  )}
                />
              </div>
              <div className="px-4 py-3">
                <input
                  type="text"
                  value={media}
                  onChange={(event) => setMedia(event.target.value)}
                  placeholder="Series / Media (optional)"
                  className={cn(
                    sansFont.className,
                    "w-full bg-transparent text-sm font-semibold text-violet-600 placeholder:text-muted-foreground/60 focus:outline-none dark:text-violet-400"
                  )}
                />
              </div>
            </div>

            {/* Middle: Prompt Field */}
            <div className="px-4 py-2">
              <textarea
                value={formState.body}
                onChange={(event) => setFormState((state) => ({ ...state, body: event.target.value }))}
                onInput={(e) => {
                  e.currentTarget.style.height = 'auto';
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                }}
                placeholder="Suggest a drawing prompt... (e.g. A lazy cat asleep on old books)"
                rows={1}
                className={cn(
                  sansFont.className,
                  "w-full bg-transparent py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-600 resize-none overflow-hidden min-h-[100px]"
                )}
              />
            </div>

            {/* Attachment thumbnails */}
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
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-violet-500 transition-colors select-none">
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
                className="h-10 px-5 text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-600 dark:hover:bg-violet-700"
              >
                Send prompt
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
            {singleMode ? "Drawing prompt" : "Drawing prompts"}
          </TextHeading>
          <div className="flex shrink-0 items-center gap-3">
            {isRefreshing ? (
              <Text variant="muted" size="xs">
                Refreshing...
              </Text>
            ) : null}
            <Text variant="muted" size="sm" className="whitespace-nowrap">
              {prompts.length} suggestions collected
            </Text>
          </div>
        </div>

        <StackVertical gap="md">
          {isLoading && prompts.length === 0 ? (
            <div className="py-8 text-center">
              <Text variant="muted" size="sm">
                Loading prompts...
              </Text>
            </div>
          ) : (
            paginatedPrompts.map((prompt: DrawPrompt) => {
              const thread = prompt.thread || []
              const lastRole = lastThreadRole(prompt)
              const canFollowUp = lastRole === 'admin'
              const canReply = true

              return (
                <article 
                  id={`prompt-${prompt.id}`} 
                  key={prompt.id} 
                  className="group relative rounded-2xl border border-border/60 bg-background/80 p-6 transition-all duration-300 hover:border-violet-500/15 hover:bg-muted/10 hover:shadow-lg hover:shadow-violet-500/[0.01]"
                >
                  <StackVertical gap="sm">
                    {/* Original prompt */}
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400">
                        <span className={cn(sansFont.className, "rounded-full border border-violet-200/70 bg-violet-50/70 px-2.5 py-1 dark:border-violet-500/20 dark:bg-violet-500/10")}>{prompt.author} suggested</span>
                      </h4>
                      <div className="flex items-center gap-1 mt-1.5">
                        {/* Strictly notification enabled - violet theme */}
                        <div className="flex items-center mr-1" title="Notifications active (strict)">
                          <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-violet-50 dark:bg-violet-500/10">
                            <Bell size={14} className="text-violet-600 dark:text-violet-400 fill-violet-600/10" />
                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-violet-600 border-2 border-white dark:border-slate-900 animate-pulse" />
                          </div>
                        </div>
                        <span className={cn(sansFont.className, "text-xs text-muted-foreground")}>
                          {formatDate(prompt.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Tags for Character and Media */}
                    {(prompt.character || prompt.media) && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {prompt.character && (
                          <span className={cn(sansFont.className, "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200/55 dark:border-violet-800/40")}>
                            👤 {prompt.character}
                          </span>
                        )}
                        {prompt.media && (
                          <span className={cn(sansFont.className, "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200/55 dark:border-indigo-800/40")}>
                            🎬 {prompt.media}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className={cn(sansFont.className, "text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-medium mb-2 break-words")}>
                      <RichText text={prompt.body} theme="violet" />
                    </div>

                    {/* Image Attachment */}
                    <ImageGallery 
                      urls={prompt.imageUrls?.length ? prompt.imageUrls : (prompt.imageUrl ? [prompt.imageUrl] : [])} 
                      theme="violet"
                    />

                    {/* Thread messages */}
                    {thread.length > 0 && (
                      <div className="mt-2 space-y-3">
                        {thread.map((msg, i) => (
                          <ThreadBubble 
                            key={msg.id} 
                            message={msg} 
                            depth={i} 
                            author={prompt.author}
                            promptId={prompt.id}
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
                            onSave={() => handleEditSubmit(prompt.id, msg.id)}
                            passcode={passcode}
                            setPasscode={setPasscode}
                            isPending={isPending}
                          />
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="prompt-actions mt-1 flex justify-end gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <button
                        onClick={() => copyLink(prompt.id)}
                        className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300"
                      >
                        <Share2 size={14} />
                        Share
                      </button>
                      <button
                        onClick={() => takeScreenshot(prompt.id)}
                        className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300"
                      >
                        <Camera size={14} />
                        Snap
                      </button>
                      {canFollowUp && (
                        <button
                          onClick={() => {
                             setFollowingUp(followingUp === prompt.id ? null : prompt.id)
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
                             setReplyingTo(replyingTo === prompt.id ? null : prompt.id)
                             setReplyBody('')
                             setReplyImageUrls([])
                             setFollowingUp(null)
                          }}
                          className="flex items-center gap-1.5 rounded-full border border-violet-200/70 bg-violet-50/70 px-3 py-1.5 text-xs font-medium text-violet-600 transition-colors hover:border-violet-300 hover:bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/15"
                        >
                          <MessageSquareReply size={14} />
                          Reply
                        </button>
                      )}
                    </div>

                    {/* Admin reply form */}
                    {replyingTo === prompt.id && (
                      <div className="mt-3 border-t border-border/60 pt-3">
                        <textarea
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          onInput={(e) => {
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                          }}
                          placeholder="Write your answer..."
                          rows={1}
                          className={cn(sansFont.className, "min-h-[44px] w-full resize-none overflow-hidden rounded-xl border border-border bg-background px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:text-slate-100")}
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
                              className="w-24 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:text-slate-100"
                            />
                            <label className="flex items-center gap-1 cursor-pointer text-slate-500 hover:text-violet-500 text-xs font-semibold select-none">
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
                            <Button size="sm" disabled={isPending || !replyBody.trim()} onClick={() => handleReplySubmit(prompt.id)} className="h-8 rounded-full px-4 text-xs bg-violet-600 hover:bg-violet-700 text-white">
                              Post
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Visitor follow-up form */}
                    {followingUp === prompt.id && (
                      <div className="mt-3 border-t border-border/60 pt-3">
                        <textarea
                          value={followUpBody}
                          onChange={(e) => setFollowUpBody(e.target.value)}
                          onInput={(e) => {
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                          }}
                          placeholder="Ask a follow-up..."
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
                            <Button size="sm" disabled={isPending || !followUpBody.trim()} onClick={() => handleFollowUpSubmit(prompt.id)} className="h-8 rounded-full px-4 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
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
                      ? 'bg-violet-600 text-white'
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
      </section>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, x: '-50%' }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-50 flex items-center gap-2 rounded-xl border border-violet-200 bg-white/95 backdrop-blur-sm pl-4 pr-1.5 py-1.5 shadow-sm dark:border-violet-500/30 dark:bg-[#1a1525] w-[calc(100%-2rem)] md:w-auto max-w-sm"
          >
            <div className="h-2 w-2 rounded-full bg-violet-600 dark:bg-violet-400 shrink-0" />
            <span className={cn(sansFont.className, "text-sm text-slate-800 dark:text-slate-200 truncate")}>
              {notification}
            </span>
            <button
              onClick={() => setNotification(null)}
              className={cn(monoFont.className, "ml-auto rounded-lg border border-violet-100 bg-violet-50/50 px-2 py-0.5 text-xs text-violet-600 hover:bg-violet-100 dark:border-violet-850 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50")}
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
  promptId,
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
  message: DrawThreadMessage; 
  depth: number; 
  author?: string;
  promptId: string;
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
          ? "border-violet-200/60 bg-violet-50/30 dark:border-violet-500/15 dark:bg-violet-500/5"
          : "border-emerald-200/60 bg-emerald-50/30 dark:border-emerald-500/15 dark:bg-emerald-500/5",
        isEditing && "border-violet-400 ring-4 ring-violet-500/5 dark:border-violet-400/50"
      )}
    >
      {!isEditing && (
        <div 
          className={cn(
            "absolute -left-4 top-[-16px] bottom-1/2 w-4 border-l-2 border-b-2 rounded-bl-lg pointer-events-none",
            isAdmin 
              ? "border-violet-200/70 dark:border-violet-500/20" 
              : "border-emerald-200/70 dark:border-emerald-500/20"
          )}
        />
      )}
      <div className="flex items-center gap-2 mb-1.5 overflow-hidden">
        <CornerDownRight size={12} className={isAdmin ? "text-violet-400" : "text-emerald-400"} />
        <span className={cn(
          sansFont.className,
          "text-xs font-bold",
          isAdmin ? "text-violet-600 dark:text-violet-400" : "text-emerald-600 dark:text-emerald-400"
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
                className="text-[10px] font-bold uppercase tracking-wider text-violet-500 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
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
            className={cn(sansFont.className, "min-h-[100px] w-full resize-none overflow-hidden rounded-lg border border-violet-200 bg-background px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:border-violet-500/30 dark:text-slate-100")}
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
                className="w-24 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:text-slate-100"
              />
              <label className="flex items-center gap-1 cursor-pointer text-slate-500 hover:text-violet-500 text-xs font-semibold select-none">
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
              <Button size="sm" disabled={isPending || !editBody.trim()} onClick={onSave} className="h-8 rounded-full px-4 text-xs bg-violet-600 hover:bg-violet-700 text-white">
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={cn(sansFont.className, "text-sm leading-relaxed text-slate-700 dark:text-slate-350 break-words")}>
            <RichText text={message.body} theme="violet" />
          </div>
          <ImageGallery 
            urls={message.imageUrls?.length ? message.imageUrls : (message.imageUrl ? [message.imageUrl] : [])} 
            theme="violet"
          />
        </>
      )}
    </div>
  )
}
