import { NextRequest, NextResponse } from 'next/server'
import { buildQuestionPayload, fetchQuestions, saveQuestion } from '@/lib/kv/ask'
import { initialQuestions } from '@/app/ask/_data/questions'

const MAX_BODY_LENGTH = 800

export async function GET() {
  const stored = await fetchQuestions()
  const merged = (stored.length > 0 ? stored : initialQuestions).slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  return NextResponse.json({ questions: merged })
}

export async function POST(request: NextRequest) {
  const data = await request.json().catch(() => null)
  if (!data || typeof data.body !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const body = data.body.trim()
  if (body.length === 0) {
    return NextResponse.json({ error: 'Question cannot be empty' }, { status: 400 })
  }

  if (body.length > MAX_BODY_LENGTH) {
    return NextResponse.json({ error: 'Question is too long' }, { status: 400 })
  }

  const author = typeof data.author === 'string' ? data.author : 'anonymous'
  const question = buildQuestionPayload({ author, body })

  await saveQuestion(question)

  return NextResponse.json({ question }, { status: 201 })
}
