'use client'

import { FormEvent, useEffect, useState, useTransition } from 'react'
import { initialQuestions } from '../_data/questions'
import { AskQuestion } from '../_types/ask'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { Button } from '@/components/ui/primitives/button'
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

export function AskBoard() {
  const [formState, setFormState] = useState<FormState>({ author: '', body: '' })
  const [questions, setQuestions] = useState<AskQuestion[]>(seededQuestions)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

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
      } catch (error) {
        const fallback = error instanceof Error ? error.message : 'Unable to send your question.'
        setErrorMessage(fallback)
      }
    })
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
              Drop a question, thought, or anything! I will keep it in this archive so others can read along.
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
          {isLoading ? (
            <Text variant="muted" size="sm">
              Loading recent questions...
            </Text>
          ) : (
            questions.map((question: AskQuestion) => (
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
            ))
          )}
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
