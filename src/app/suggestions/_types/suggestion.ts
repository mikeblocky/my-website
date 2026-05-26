export type SuggestionCategory =
  | 'manga'
  | 'anime'
  | 'film'
  | 'series'
  | 'book'
  | 'game'
  | 'music'
  | 'other'

export type SuggestionReference = {
  url: string
  title?: string
  description?: string
  image?: string
  siteName?: string
  type?: string
}

export type MediaSuggestion = {
  id: string
  author?: string
  title: string
  category: SuggestionCategory
  note?: string
  bestPart?: string
  reference?: SuggestionReference
  createdAt: string
  imageUrl?: string
  imageUrls?: string[]
}
