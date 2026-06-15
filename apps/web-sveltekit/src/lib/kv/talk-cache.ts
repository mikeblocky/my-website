import { initialTalks } from "@mikeblocky/site-data"
import type { TalkTopic } from "@mikeblocky/site-data"
import { fetchTalks } from "./talk"

export const TALK_MESSAGES_TAG = "talk-messages"

let cachedTalks: TalkTopic[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

export async function getTalkMessages(limit = 100): Promise<TalkTopic[]> {
    const now = Date.now();
    if (!cachedTalks || now - lastCacheTime > CACHE_TTL) {
        cachedTalks = await fetchTalks(limit);
        lastCacheTime = now;
    }
    const source = cachedTalks.length > 0 ? cachedTalks : initialTalks;

    return source.slice().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

export function revalidateTalkMessages() {
    cachedTalks = null;
    lastCacheTime = 0;
}
