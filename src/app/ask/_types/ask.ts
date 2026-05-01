export type ThreadMessage = {
  id: string
  role: 'asker' | 'admin'
  body: string
  createdAt: string
}

export type AskQuestion = {
  id: string
  author?: string
  body: string
  createdAt: string
  /** @deprecated — kept for backwards compat with old entries */
  reply?: string
  /** @deprecated — kept for backwards compat with old entries */
  repliedAt?: string
  /** Threaded follow-up conversation */
  thread?: ThreadMessage[]
}
