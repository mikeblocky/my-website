export type DrawThreadMessage = {
  id: string
  role: 'asker' | 'admin'
  body: string
  createdAt: string
  imageUrl?: string
  imageUrls?: string[]
}

export type DrawPrompt = {
  id: string
  author?: string
  body: string
  createdAt: string
  character?: string
  media?: string
  imageUrl?: string
  imageUrls?: string[]
  /** Threaded follow-up conversation */
  thread?: DrawThreadMessage[]
  /** Whether this prompt has active subscribers (kept for API structure similarity) */
  notifying?: boolean
}
