import { unstable_cache } from "next/cache"
import { initialPrompts } from "@/app/draw/_data/prompts"
import type { DrawPrompt } from "@/app/draw/_types/draw"
import { fetchPrompts } from "./draw"

export const DRAW_PROMPTS_TAG = "draw-prompts"

const getStoredPromptsCached = unstable_cache(
    async (limit: number) => fetchPrompts(limit),
    [DRAW_PROMPTS_TAG],
    {
        revalidate: 30,
        tags: [DRAW_PROMPTS_TAG]
    }
)

export async function getDrawPrompts(limit = 100): Promise<DrawPrompt[]> {
    const stored = await getStoredPromptsCached(limit)
    const source = stored.length > 0 ? stored : initialPrompts

    return source.slice().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}
