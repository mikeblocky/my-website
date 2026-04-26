'use client'

import { FormEvent, useEffect, useState, useTransition, useMemo } from 'react'
import { initialQuestions } from '../_data/questions'
import { AskQuestion } from '../_types/ask'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { Button } from '@/components/ui/primitives/button'
import { ChevronLeft, ChevronRight, MessageSquareReply } from 'lucide-react'
import { sansFont, monoFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'

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

  useEffect(() => {
    let cancelled = false

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
          setErrorMessage('Unable to load the archive right now. Showing starter questions instead.')
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
          const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null
          const message = errorPayload?.error ?? 'Something went wrong while sending your question.'
          throw new Error(message)
        }

        const { question } = (await response.json()) as { question: AskQuestion }
        setQuestions((previous) => [question, ...previous])
        setFormState({ author: '', body: '' })
        setCurrentPage(1)
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
      } catch (error) {
        setErrorMessage('Could not post reply.')
      }
    })
  }

  const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE)
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return questions.slice(start, start + ITEMS_PER_PAGE)
  }, [questions, currentPage])

  return (
    <StackVertical gap="lg">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-base font-semibold text-foreground">
              Alias (optional)
            </span>
            <input
              type="text"
              value={formState.author}
              onChange={(event) => setFormState((state) => ({ ...state, author: event.target.value }))}
              placeholder="How should I call you?"
              className="w-full rounded-lg border border-purple-200/50 bg-white/70 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:border-purple-500/30 dark:bg-slate-950/40 dark:text-slate-100 dark:focus:border-purple-400 dark:focus:ring-purple-500/30"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-base font-semibold text-foreground">
              Your question
            </span>
            <textarea
              value={formState.body}
              onChange={(event) => setFormState((state) => ({ ...state, body: event.target.value }))}
              placeholder="Ask me anything..."
              rows={4}
              className="w-full rounded-lg border border-purple-200/50 bg-white/70 px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:border-purple-500/30 dark:bg-slate-950/40 dark:text-slate-100 dark:focus:border-purple-400 dark:focus:ring-purple-500/30"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={!formState.body.trim() || isPending}>
            Send question
          </Button>
        </div>
      </form>

      {errorMessage && (
        <div className="rounded-lg border border-orange-300/40 bg-orange-50/80 px-3 py-2 text-sm text-orange-800 dark:border-orange-500/50 dark:bg-orange-900/20 dark:text-orange-100">
          {errorMessage}
        </div>
      )}

      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-purple-200/50 dark:border-purple-500/30 pb-3">
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
              <article key={question.id} className="rounded-2xl border border-purple-200/60 bg-white/60 p-6 shadow-sm dark:border-purple-500/20 dark:bg-[#2a1f3f]/40 relative group transition-all">
                <StackVertical gap="sm">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                      <span className={cn(monoFont.className, "bg-purple-100 dark:bg-purple-900/50 px-2.5 py-1 rounded-full")}>{question.author} asked</span>
                    </h4>
                    <span className={cn(monoFont.className, "text-xs text-muted-foreground mt-1.5")}>
                      {formatDate(question.createdAt)}
                    </span>
                  </div>
                  
                  <p className={cn(sansFont.className, "text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-medium mb-2")}>
                    "{question.body}"
                  </p>

                  {question.reply ? (
                    <div className="mt-3 rounded-xl bg-purple-50/80 p-5 border border-purple-100 dark:bg-purple-900/20 dark:border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">M</div>
                        <span className="text-sm font-bold text-purple-900 dark:text-purple-200">Mike</span>
                        {question.repliedAt && (
                          <span className={cn(monoFont.className, "text-xs text-purple-400 dark:text-purple-500 ml-auto")}>
                            {formatDate(question.repliedAt)}
                          </span>
                        )}
                      </div>
                      <p className={cn(sansFont.className, "text-base text-slate-700 dark:text-slate-300 leading-relaxed ml-8")}>
                        {question.reply}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setReplyingTo(replyingTo === question.id ? null : question.id)
                          setReplyBody('')
                        }}
                        className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-full"
                      >
                        <MessageSquareReply size={14} />
                        Reply
                      </button>
                    </div>
                  )}

                  {replyingTo === question.id && !question.reply && (
                    <div className="mt-3 pt-3 border-t border-purple-100 dark:border-purple-500/20">
                      <textarea
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        onInput={(e) => {
                          e.currentTarget.style.height = 'auto';
                          e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                        }}
                        placeholder="Write your answer..."
                        rows={1}
                        className={cn(sansFont.className, "w-full rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-300 dark:border-purple-500/30 dark:bg-slate-900 dark:text-slate-100 resize-none overflow-hidden min-h-[44px]")}
                      />
                      <div className="mt-2 flex justify-between items-center gap-2">
                        <input 
                          type="password"
                          value={passcode}
                          onChange={e => setPasscode(e.target.value)}
                          placeholder="Passcode"
                          className="w-24 rounded-full border border-purple-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-purple-500/30 dark:bg-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
                        />
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="text-xs h-8">
                            Cancel
                          </Button>
                          <Button size="sm" disabled={isPending || !replyBody.trim()} onClick={() => handleReplySubmit(question.id)} className="text-xs h-8 rounded-full px-4 bg-purple-600 hover:bg-purple-700 text-white">
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
          <div className="mt-8 flex items-center justify-center gap-4 border-t border-purple-200/50 dark:border-purple-500/30 pt-6">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-slate-500 hover:bg-purple-100 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-purple-900/30 transition-colors"
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
                      ? 'bg-purple-500 text-white'
                      : 'text-slate-600 hover:bg-purple-100 dark:text-slate-400 dark:hover:bg-purple-900/30'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-slate-500 hover:bg-purple-100 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-purple-900/30 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </section>
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
