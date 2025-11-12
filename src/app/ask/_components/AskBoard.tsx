'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { initialQuestions } from '../_data/questions'
import { AskQuestion } from '../_types/ask'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { Button } from '@/components/ui/primitives/button'
import { cn } from '@/lib/utils/utils'

const STORAGE_KEY = 'ask.anonymous.questions'
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

export function AskBoard() {
  const [formState, setFormState] = useState<FormState>({ author: '', body: '' })
  const [submittedQuestions, setSubmittedQuestions] = useState<AskQuestion[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as AskQuestion[]
        const ordered = parsed
          .slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setSubmittedQuestions(ordered)
      }
    } catch (error) {
      console.error('Unable to load stored questions', error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (submittedQuestions.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    const persist = () => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submittedQuestions))
      } catch (error) {
        console.error('Unable to persist questions', error)
      }
    }

    const { requestIdleCallback, cancelIdleCallback } = window as typeof window & {
      requestIdleCallback?: (callback: IdleRequestCallback) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (typeof requestIdleCallback === 'function') {
      const handle = requestIdleCallback(persist)
      return () => {
        cancelIdleCallback?.(handle)
      }
    }

    const timeout = window.setTimeout(persist, 0)
    return () => window.clearTimeout(timeout)
  }, [submittedQuestions])

  const questions = useMemo(() => {
    if (submittedQuestions.length === 0) {
      return seededQuestions
    }
    return [...submittedQuestions, ...seededQuestions]
  }, [submittedQuestions])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedBody = formState.body.trim()
    if (!trimmedBody) return

    const newQuestion: AskQuestion = {
      id: `user-${Date.now()}`,
      author: formState.author.trim() || 'anonymous',
      body: trimmedBody,
      createdAt: new Date().toISOString()
    }

    setSubmittedQuestions((previous) => [newQuestion, ...previous])
    setFormState({ author: '', body: '' })
  }

  return (
    <StackVertical gap="lg">
      <section
        className={cn(
          'rounded-2xl border border-purple-500/20 bg-[#f2f5ff] p-6 shadow-sm',
          'dark:border-purple-400/20 dark:bg-[#2a1f3f]'
        )}
      >
        <StackVertical gap="md">
          <header className="space-y-1">
            <TextHeading as="h2" weight="semibold">
              Ask something anonymously
            </TextHeading>
            <Text variant="muted" size="sm">
              Drop a question, thought, or prompt. I will keep it in this archive so others can read along.
            </Text>
          </header>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-3">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
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
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Your question
                </span>
                <textarea
                  value={formState.body}
                  onChange={(event) => setFormState((state) => ({ ...state, body: event.target.value }))}
                  placeholder="Ask me anything..."
                  rows={5}
                  className="w-full rounded-lg border border-purple-200/50 bg-white/70 px-3 py-3 text-sm text-slate-900 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:border-purple-500/30 dark:bg-slate-950/40 dark:text-slate-100 dark:focus:border-purple-400 dark:focus:ring-purple-500/30"
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Text variant="muted" size="xs">
                Your submission is anonymous. I may respond on the blog or update this page.
              </Text>
              <Button type="submit" disabled={!formState.body.trim()}>
                Send question
              </Button>
            </div>
          </form>
        </StackVertical>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <TextHeading as="h3" weight="semibold" className="text-base">
            Recent questions
          </TextHeading>
          <Text variant="muted" size="xs">
            {questions.length} collected
          </Text>
        </div>

        <StackVertical gap="md" className="divide-y divide-purple-100/60 dark:divide-purple-500/20">
          {questions.map((question) => (
            <article key={question.id} className="pt-4 first:pt-0">
              <StackVertical gap="xs">
                <Text size="sm" className="text-purple-600 dark:text-purple-200">
                  {question.author}
                </Text>
                <Text size="sm" variant="default">
                  {question.body}
                </Text>
                <Text variant="muted" size="xs">
                  {formatDate(question.createdAt)}
                </Text>
              </StackVertical>
            </article>
          ))}
        </StackVertical>
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
