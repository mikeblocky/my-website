export type ThreadMessage = {
  id: string
  role: 'asker' | 'admin'
  body: string
  createdAt: string
  imageUrl?: string
  imageUrls?: string[]
}

export type TalkTopic = {
  id: string
  author?: string
  body: string
  createdAt: string
  imageUrl?: string
  imageUrls?: string[]
  /** @deprecated — kept for backwards compat with old entries */
  reply?: string
  /** @deprecated — kept for backwards compat with old entries */
  repliedAt?: string
  /** Threaded follow-up conversation */
  thread?: ThreadMessage[]
  /** Whether this post has active push notification subscribers (set by API, not stored) */
  notifying?: boolean
}
