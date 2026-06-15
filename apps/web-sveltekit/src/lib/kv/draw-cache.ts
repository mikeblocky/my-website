import { initialPrompts } from "@mikeblocky/site-data"
import type { DrawPrompt } from "@mikeblocky/site-data"
import { fetchPrompts } from "./draw"

export const DRAW_PROMPTS_TAG = "draw-prompts"

let cachedPrompts: DrawPrompt[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

export async function getDrawPrompts(limit = 100): Promise<DrawPrompt[]> {
    const now = Date.now();
    if (!cachedPrompts || now - lastCacheTime > CACHE_TTL) {
        cachedPrompts = await fetchPrompts(limit);
        lastCacheTime = now;
    }
    const source = cachedPrompts.length > 0 ? cachedPrompts : initialPrompts;

    return source.slice().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

export function revalidateDrawPrompts() {
    cachedPrompts = null;
    lastCacheTime = 0;
}
