'use client'

// Cache-buster comment to force a fresh DrawBoard chunk build hash across client devices
import { FormEvent, useEffect, useState, useTransition, useMemo } from 'react'
import { initialPrompts } from '../_data/prompts'
import { DrawPrompt } from '../_types/draw'
import { RichText } from '@/components/ui/RichText'
import { ImageGallery } from '@/components/ui/ImageGallery'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { Button } from '@/components/ui/primitives/button'
import { Camera, ChevronLeft, ChevronRight, MessageSquareReply, CornerDownRight, Share2, Palette, Bell } from 'lucide-react'
import { sansFont, monoFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import { prepareImageForUpload } from '@/lib/images/prepare-upload'
import { MAX_ATTACHMENT_COUNT } from '@/lib/images/attachment-limits'
import { formatBoardDate as formatDate, sortByCreatedAt, type ApiCooldown } from '@/lib/boards/board-utils'
import { useBoardCooldown, useButtonFeedback, useControlledState, useTimedMessage } from '@/lib/boards/board-hooks'
import { AdminLockToggle } from '@/components/ui/admin/AdminLockToggle'
import { AttachmentPreviewGrid } from '@/components/ui/attachments/AttachmentPreviewGrid'
import { AttachmentUploadButton } from '@/components/ui/attachments/AttachmentUploadButton'
import { BoardThreadBubble } from '@/components/ui/boards/BoardThreadBubble'

const seededPrompts = sortByCreatedAt(initialPrompts)

type FormState = {
  author: string
  body: string
}

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
  const [formState, setFormState] = useState<FormState>({ author: '', body: '' })
  const [character, setCharacter] = useState('')
  const [media, setMedia] = useState('')
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

  // Reply state (admin)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')

  // Follow-up state (visitor)
  const [followingUp, setFollowingUp] = useState<string | null>(null)
  const [followUpBody, setFollowUpBody] = useState('')

  // Toast Notification State
  const { message: notification, showMessage: showNotification, clearMessage: clearNotification } = useTimedMessage()

  // Edit state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')

  // Image states
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [replyImageUrls, setReplyImageUrls] = useState<string[]>([])
  const [followUpImageUrls, setFollowUpImageUrls] = useState<string[]>([])
  const [editImageUrls, setEditImageUrls] = useState<string[]>([])

  // Inline button feedback state
  const { feedback: buttonFeedback, showFeedback: showButtonFeedback } = useButtonFeedback()
  const { isCooldownActive, cooldownLabel, applyCooldown } = useBoardCooldown()

  const handleImageUpload = async (file: File, callback: (url: string) => void) => {
    try {
      callback(await prepareImageForUpload(file))
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Could not attach image.')
    }
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedBody = formState.body.trim()
    if (!trimmedBody || isCooldownActive) return

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

        const result = (await response.json()) as { prompt?: DrawPrompt, cooldown?: ApiCooldown, error?: string }
        applyCooldown(result.cooldown)

        if (!response.ok || !result.prompt) {
          throw new Error(result.error || 'Something went wrong while sending your prompt.')
        }

        const prompt = result.prompt
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
    if (!followUpBody.trim() || isCooldownActive) return

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
        setFollowingUp(null)
        setFollowUpBody('')
        setFollowUpImageUrls([])
        showNotification('Follow-up sent!')
      } catch (error) {
        showNotification(error instanceof Error ? error.message : 'Could not send follow-up.')
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
    <StackVertical gap="lg">
      {!singleMode && (
        <form 
          className="rounded-2xl bg-slate-50 dark:bg-slate-900/60 transition-all duration-200 focus-within:bg-slate-100/50 dark:focus-within:bg-slate-900 pride-focus-within-glow" 
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
            <AttachmentPreviewGrid
              urls={imageUrls}
              onRemove={(index) => setImageUrls(prev => prev.filter((_, itemIndex) => itemIndex !== index))}
              className="px-4 pb-3"
            />

            {/* Bottom: Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-border/60 px-4 py-3.5 mt-2">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <AttachmentUploadButton
                  onFiles={(files) => files.forEach(file => {
                    handleImageUpload(file, (url) => setImageUrls(prev => prev.length >= MAX_ATTACHMENT_COUNT ? prev : [...prev, url]))
                  })}
                  iconSize={14}
                  className={cn(sansFont.className, 'gap-1.5 text-sm font-medium')}
                  accent="violet"
                >
                  Add images
                </AttachmentUploadButton>
              </div>
              
              <Button 
                type="submit" 
                size="sm"
                disabled={!formState.body.trim() || isPending || isCooldownActive}
                className="w-full sm:w-auto h-11 px-6 text-sm font-semibold rounded-full bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-600 dark:hover:bg-violet-700 border-0"
                title={isCooldownActive ? `You can send another prompt in ${cooldownLabel}` : undefined}
              >
                {isCooldownActive ? cooldownLabel : 'Send prompt'}
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
          <div className="flex items-center gap-2">
            <TextHeading as="h3" weight="semibold" className="mt-0 mb-0 text-lg">
              {singleMode ? "Drawing prompt" : "Drawing prompts"}
            </TextHeading>

            <AdminLockToggle
              isAdminMode={isAdminMode}
              setIsAdminMode={setIsAdminMode}
              passcode={passcode}
              setPasscode={setPasscode}
              showPasscodeInput={showPasscodeInput}
              setShowPasscodeInput={setShowPasscodeInput}
              onEnabled={() => showNotification('Admin Mode enabled. You can now reply and edit!')}
              accent="violet"
            />
          </div>

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
              const canFollowUp = true
              const canReply = isAdminMode

              return (
                <article 
                  id={`prompt-${prompt.id}`} 
                  key={prompt.id} 
                  className="group relative rounded-2xl bg-slate-50 dark:bg-slate-900/40 p-6 transition-all duration-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/70 border-0 shadow-none"
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
                    <div className="prompt-actions mt-4 flex flex-wrap gap-2.5 sm:justify-end opacity-100 transition-all">
                      <button
                        onClick={() => shareAndSnap(prompt.id)}
                        className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/50 hover:bg-slate-200/50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900 px-4.5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-350 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-500/50 shadow-sm transition-all"
                      >
                        <Share2 size={15} />
                        {buttonFeedback[`share-${prompt.id}`] || 'Share'}
                      </button>
                      <button
                        onClick={() => snapAndCopy(prompt.id)}
                        className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/50 hover:bg-slate-200/50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900 px-4.5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-350 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-500/50 shadow-sm transition-all"
                      >
                        <Camera size={15} />
                        {buttonFeedback[`snap-${prompt.id}`] || 'Snap'}
                      </button>
                      {canFollowUp && (
                        <button
                          onClick={() => {
                             setFollowingUp(followingUp === prompt.id ? null : prompt.id)
                             setFollowUpBody('')
                             setFollowUpImageUrls([])
                             setReplyingTo(null)
                          }}
                          className="flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/70 hover:bg-emerald-100/80 px-4.5 py-2.5 text-sm font-semibold text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/15 shadow-sm transition-all"
                        >
                          <CornerDownRight size={15} />
                          Follow up
                        </button>
                      )}
                      {canFollowUp && canReply && (
                        <span className="text-xs text-muted-foreground self-center px-1 font-medium select-none pointer-events-none">
                          or
                        </span>
                      )}
                      {canReply && (
                        <button
                          onClick={() => {
                             setReplyingTo(replyingTo === prompt.id ? null : prompt.id)
                             setReplyBody('')
                             setReplyImageUrls([])
                             setFollowingUp(null)
                          }}
                          className="flex items-center gap-2 rounded-full border border-violet-200/60 bg-violet-50/70 hover:bg-violet-100/80 px-4.5 py-2.5 text-sm font-semibold text-violet-600 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/15 shadow-sm transition-all"
                        >
                          <MessageSquareReply size={15} />
                          Reply (Admin)
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
                            <Button variant="ghost" size="sm" onClick={() => setFollowingUp(null)} className="text-xs h-8">
                              Cancel
                            </Button>
                            <Button size="sm" disabled={isPending || !followUpBody.trim() || isCooldownActive} onClick={() => handleFollowUpSubmit(prompt.id)} className="h-8 rounded-full px-4 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" title={isCooldownActive ? `You can send another prompt in ${cooldownLabel}` : undefined}>
                              {isCooldownActive ? cooldownLabel : 'Send follow-up'}
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

      {notification && (
          <div className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-2 rounded-xl border border-violet-200 bg-white/95 py-1.5 pl-4 pr-1.5 shadow-sm backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-3 motion-safe:zoom-in-95 motion-safe:duration-200 md:left-auto md:right-6 md:w-auto md:translate-x-0 dark:border-violet-500/30 dark:bg-[#1a1525]">
            <div className="h-2 w-2 rounded-full bg-violet-600 dark:bg-violet-400 shrink-0" />
            <span className={cn(sansFont.className, "text-sm text-slate-800 dark:text-slate-200 truncate")}>
              {notification}
            </span>
            <button
              onClick={clearNotification}
              className={cn(monoFont.className, "ml-auto rounded-lg border border-violet-100 bg-violet-50/50 px-2 py-0.5 text-xs text-violet-600 hover:bg-violet-100 dark:border-violet-850 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50")}
            >
              close
            </button>
          </div>
        )}
    </StackVertical>
  )
}
