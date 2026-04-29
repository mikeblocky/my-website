import { unstable_cache } from "next/cache"
import { initialQuestions } from "@/app/ask/_data/questions"
import type { AskQuestion } from "@/app/ask/_types/ask"
import { fetchQuestions } from "./ask"

export const ASK_QUESTIONS_TAG = "ask-questions"

const getStoredQuestionsCached = unstable_cache(
    async (limit: number) => fetchQuestions(limit),
    [ASK_QUESTIONS_TAG],
    {
        revalidate: 30,
        tags: [ASK_QUESTIONS_TAG]
    }
)

export async function getAskQuestions(limit = 100): Promise<AskQuestion[]> {
    const stored = await getStoredQuestionsCached(limit)
    const source = stored.length > 0 ? stored : initialQuestions

    return source.slice().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}
