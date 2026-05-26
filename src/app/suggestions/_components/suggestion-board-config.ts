import { sortByCreatedAt } from '@/lib/boards/board-utils'
import { initialSuggestions } from '../_data/suggestions'
import type { SuggestionCategory, SuggestionStatus } from '../_types/suggestion'

export const ITEMS_PER_PAGE = 8

export const categories: Array<{ value: SuggestionCategory; label: string }> = [
  { value: 'manga', label: 'Manga' },
  { value: 'anime', label: 'Anime' },
  { value: 'film', label: 'Film' },
  { value: 'series', label: 'Series' },
  { value: 'book', label: 'Book' },
  { value: 'game', label: 'Game' },
  { value: 'music', label: 'Music' },
  { value: 'other', label: 'Other' }
]

export const seededSuggestions = sortByCreatedAt(initialSuggestions)

export function getStatusConfig(status: SuggestionStatus | undefined, category: SuggestionCategory) {
  if (!status) return null

  const isBook = category === 'book' || category === 'manga'
  const isShow = category === 'anime' || category === 'film' || category === 'series'
  const isMusic = category === 'music'
  const isGame = category === 'game'

  switch (status) {
    case 'planning':
      return {
        label: isBook ? 'Plan to read' : isShow ? 'Plan to watch' : isMusic ? 'Plan to listen' : isGame ? 'Plan to play' : 'Plan to check',
        color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-150'
      }
    case 'progressing':
      return {
        label: isBook ? 'Reading' : isShow ? 'Watching' : isMusic ? 'Listening' : isGame ? 'Playing' : 'Checking',
        color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-150'
      }
    case 'completed':
      return {
        label: isBook ? 'Read' : isShow ? 'Watched' : isMusic ? 'Listened' : isGame ? 'Played' : 'Checked',
        color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-150'
      }
    case 'dropped':
      return {
        label: 'Dropped',
        color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-150'
      }
  }
}
