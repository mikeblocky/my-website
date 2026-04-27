'use client'

import { FormEvent, useEffect, useState, useTransition, useMemo } from 'react'
import { initialQuestions } from '../_data/questions'
import { AskQuestion } from '../_types/ask'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { Button } from '@/components/ui/primitives/button'
import { ChevronLeft, ChevronRight, MessageSquareReply, Camera, Bell } from 'lucide-react'
import { sansFont, monoFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { isPushSupported, subscribeToPush, registerServiceWorker } from '@/lib/push/client'

const seededQuestions = [...initialQuestions].sort(
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

export function AskBoard() {
  const [formState, setFormState] = useState<FormState>({ author: '', body: '' })
  const [questions, setQuestions] = useState<AskQuestion[]>(seededQuestions)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  // Reply state
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [passcode, setPasscode] = useState('')

  // Push notification state
  const [wantNotification, setWantNotification] = useState(true)
  const [pushSupported, setPushSupported] = useState(false)

  // Toast Notification State
  const [notification, setNotification] = useState<string | null>(null)

  function showNotification(msg: string) {
    setNotification(msg)
    setTimeout(() => {
      setNotification((current) => current === msg ? null : current)
    }, 4000)
  }

  useEffect(() => {
    let cancelled = false

    // Check push support & register service worker
    setPushSupported(isPushSupported())
    registerServiceWorker()

    async function loadQuestions() {
      try {
        const response = await fetch('/api/ask', { cache: 'no-store' })
        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`)
        }

        const payload = (await response.json()) as { questions?: AskQuestion[] }
        if (!cancelled && Array.isArray(payload.questions)) {
          setQuestions(payload.questions)
        }
      } catch (error) {
        console.error('Unable to load questions', error)
        if (!cancelled) {
          showNotification('Unable to load archive. Showing starter questions.')
          setQuestions(seededQuestions)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadQuestions()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedBody = formState.body.trim()
    if (!trimmedBody) return

    const payload = {
      author: formState.author,
      body: trimmedBody
    }

    startTransition(async () => {
      try {
        setErrorMessage(null)
        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          throw new Error('Something went wrong while sending your question.')
        }

        const { question } = (await response.json()) as { question: AskQuestion }
        setQuestions((previous) => [question, ...previous])
        setFormState({ author: '', body: '' })
        setCurrentPage(1)

        // Subscribe to push notifications for this question
        if (wantNotification && pushSupported) {
          const subscribed = await subscribeToPush(question.id)
          if (subscribed) {
            showNotification('Question sent! You will be notified when answered.')
          } else {
            showNotification('Question sent! (Notifications could not be enabled)')
          }
        } else {
          showNotification('Question sent successfully!')
        }
      } catch (error) {
        const fallback = error instanceof Error ? error.message : 'Unable to send your question.'
        setErrorMessage(fallback)
      }
    })
  }

  async function handleReplySubmit(id: string) {
    if (!replyBody.trim()) return

    startTransition(async () => {
      try {
        setErrorMessage(null)
        const response = await fetch('/api/ask', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id, reply: replyBody, passcode })
        })

        if (!response.ok) {
          throw new Error('Failed to post reply')
        }

        const { question } = await response.json()
        setQuestions(prev => prev.map(q => q.id === id ? question : q))
        setReplyingTo(null)
        setReplyBody('')
        showNotification('Answer posted successfully!')
      } catch (error) {
        showNotification('Could not post reply.')
      }
    })
  }

  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE)
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return questions.slice(start, start + ITEMS_PER_PAGE)
  }, [questions, currentPage])

  async function takeScreenshot(id: string) {
    const element = document.getElementById(`question-${id}`);
    if (!element) return;
    
    // Hide the action buttons temporarily for the screenshot
    const actionsDiv = element.querySelector('.question-actions') as HTMLElement;
    if (actionsDiv) actionsDiv.style.visibility = 'hidden';
    
    try {
      const { toPng } = await import('html-to-image');
      const isDark = document.documentElement.classList.contains('dark');
      
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
        showNotification('Copied');
      } catch (err) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `ask-${id}.png`;
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

  return (
    <StackVertical gap="lg">
      <form 
        className="rounded-xl border border-blue-200 bg-white dark:border-blue-800 dark:bg-slate-950 transition-colors focus-within:border-blue-400 dark:focus-within:border-blue-500" 
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col">
          {/* Top: Alias Field */}
          <div className="px-4 py-3 border-b border-blue-100 dark:border-blue-900">
            <input
              type="text"
              value={formState.author}
              onChange={(event) => setFormState((state) => ({ ...state, author: event.target.value }))}
              placeholder="Your alias (optional)"
              className={cn(
                sansFont.className,
                "w-full bg-transparent text-sm font-semibold text-blue-600 placeholder:text-blue-300 focus:outline-none dark:text-blue-400 dark:placeholder:text-blue-500/40"
              )}
            />
          </div>

          {/* Middle: Question Field */}
          <div className="px-4 py-2">
            <textarea
              value={formState.body}
              onChange={(event) => setFormState((state) => ({ ...state, body: event.target.value }))}
              onInput={(e) => {
                e.currentTarget.style.height = 'auto';
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
              }}
              placeholder="Ask me anything..."
              rows={1}
              className={cn(
                sansFont.className,
                "w-full bg-transparent py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-600 resize-none overflow-hidden min-h-[100px]"
              )}
            />
          </div>

          {/* Bottom: Action Bar */}
          <div className="px-4 py-3 border-t border-blue-500/10 flex items-center justify-between gap-4">
            <div className="flex items-center">
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
            </div>
            
            <Button 
              type="submit" 
              size="sm"
              disabled={!formState.body.trim() || isPending}
              className="rounded-lg px-5 py-1.5 h-10 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Send question
            </Button>
          </div>
        </div>
      </form>

      {errorMessage && (
        <div className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm text-orange-800 dark:border-orange-500/50 dark:bg-orange-900/20 dark:text-orange-100">
          {errorMessage}
        </div>
      )}

      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-blue-200 dark:border-blue-500/50 pb-3">
          <TextHeading as="h3" weight="semibold" className="text-lg">
            Questions
          </TextHeading>
          <Text variant="muted" size="sm">
            {questions.length} questions collected
          </Text>
        </div>

        <StackVertical gap="md">
          {isLoading ? (
            <div className="py-8 text-center">
              <Text variant="muted" size="sm">
                Loading history...
              </Text>
            </div>
          ) : (
            paginatedQuestions.map((question: AskQuestion) => (
              <article 
                id={`question-${question.id}`} 
                key={question.id} 
                className="rounded-2xl border border-blue-200 bg-white p-6 dark:border-blue-500/40 dark:bg-[#1a1525] relative group transition-all"
              >
                <StackVertical gap="sm">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <span className={cn(sansFont.className, "bg-blue-50 dark:bg-blue-900/40 px-2.5 py-1 rounded-full")}>{question.author} asked</span>
                    </h4>
                    <span className={cn(sansFont.className, "text-xs text-muted-foreground mt-1.5")}>
                      {formatDate(question.createdAt)}
                    </span>
                  </div>
                  
                  <p className={cn(sansFont.className, "text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-medium mb-2")}>
                    "{question.body}"
                  </p>

                  {question.reply && (
                    <div className="mt-3 rounded-xl bg-blue-50/50 p-5 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-blue-900 dark:text-blue-200">Answer</span>
                        {question.repliedAt && (
                          <span className={cn(sansFont.className, "text-xs text-blue-400 dark:text-blue-500 ml-auto")}>
                            {formatDate(question.repliedAt)}
                          </span>
                        )}
                      </div>
                      <p className={cn(sansFont.className, "text-base text-slate-700 dark:text-slate-300 leading-relaxed")}>
                        {question.reply}
                      </p>
                    </div>
                  )}

                  <div className="question-actions mt-1 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => takeScreenshot(question.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full"
                    >
                      <Camera size={14} />
                      Snap
                    </button>
                    {!question.reply && (
                      <button
                        onClick={() => {
                          setReplyingTo(replyingTo === question.id ? null : question.id)
                          setReplyBody('')
                        }}
                        className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full"
                      >
                        <MessageSquareReply size={14} />
                        Reply
                      </button>
                    )}
                  </div>

                  {replyingTo === question.id && !question.reply && (
                    <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-500/30">
                      <textarea
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        onInput={(e) => {
                          e.currentTarget.style.height = 'auto';
                          e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                        }}
                        placeholder="Write your answer..."
                        rows={1}
                        className={cn(sansFont.className, "w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-blue-500/50 dark:bg-slate-900 dark:text-slate-100 resize-none overflow-hidden min-h-[44px]")}
                      />
                      <div className="mt-2 flex justify-between items-center gap-2">
                        <input 
                          type="password"
                          value={passcode}
                          onChange={e => setPasscode(e.target.value)}
                          placeholder="Passcode"
                          className="w-24 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-blue-500/50 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="text-xs h-8">
                            Cancel
                          </Button>
                          <Button size="sm" disabled={isPending || !replyBody.trim()} onClick={() => handleReplySubmit(question.id)} className="text-xs h-8 rounded-full px-4 bg-blue-600 hover:bg-blue-700 text-white">
                            Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </StackVertical>
              </article>
            ))
          )}
        </StackVertical>

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4 border-t border-blue-200 dark:border-blue-500/50 pt-6">
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

function formatDate(iso: string) {
  try {
    return dateFormatter.format(new Date(iso))
  } catch (error) {
    return iso
  }
}
