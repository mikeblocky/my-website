import { initialSuggestions } from "@mikeblocky/site-data"
import type { MediaSuggestion } from "@mikeblocky/site-data"
import { fetchSuggestions } from "./suggestions"

export const SUGGESTIONS_TAG = "media-suggestions"

let cachedSuggestions: MediaSuggestion[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

export async function getMediaSuggestions(limit = 100): Promise<MediaSuggestion[]> {
    const now = Date.now();
    if (!cachedSuggestions || now - lastCacheTime > CACHE_TTL) {
        cachedSuggestions = await fetchSuggestions(limit);
        lastCacheTime = now;
    }
    const source = cachedSuggestions.length > 0 ? cachedSuggestions : initialSuggestions;

    return source.slice().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

export function revalidateMediaSuggestions() {
    cachedSuggestions = null;
    lastCacheTime = 0;
}
