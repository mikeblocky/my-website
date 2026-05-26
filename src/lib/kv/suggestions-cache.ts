import { unstable_cache } from "next/cache"
import { initialSuggestions } from "@/app/suggestions/_data/suggestions"
import type { MediaSuggestion } from "@/app/suggestions/_types/suggestion"
import { fetchSuggestions } from "./suggestions"

export const SUGGESTIONS_TAG = "media-suggestions"

const getStoredSuggestionsCached = unstable_cache(
  async (limit: number) => fetchSuggestions(limit),
  [SUGGESTIONS_TAG],
  {
    revalidate: 30,
    tags: [SUGGESTIONS_TAG]
  }
)

export async function getMediaSuggestions(limit = 100): Promise<MediaSuggestion[]> {
  const stored = await getStoredSuggestionsCached(limit)
  const source = stored.length > 0 ? stored : initialSuggestions

  return source.slice().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}
