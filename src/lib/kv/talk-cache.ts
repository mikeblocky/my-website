import { unstable_cache } from "next/cache"
import { initialTalks } from "@/app/talk/_data/talks"
import type { TalkTopic } from "@/app/talk/_types/talk"
import { fetchTalks } from "./talk"

export const TALK_MESSAGES_TAG = "talk-messages"

const getStoredTalksCached = unstable_cache(
    async (limit: number) => fetchTalks(limit),
    [TALK_MESSAGES_TAG],
    {
        revalidate: 30,
        tags: [TALK_MESSAGES_TAG]
    }
)

export async function getTalkMessages(limit = 100): Promise<TalkTopic[]> {
    const stored = await getStoredTalksCached(limit)
    const source = stored.length > 0 ? stored : initialTalks

    return source.slice().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}
