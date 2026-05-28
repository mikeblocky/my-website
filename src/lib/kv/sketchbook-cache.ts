import { unstable_cache } from "next/cache"
import type { SketchbookDrawing } from "@/app/sketchbook/_types/sketchbook"
import { fetchDrawings } from "./sketchbook"

export const SKETCHBOOK_DRAWINGS_TAG = "sketchbook-drawings"

const getStoredDrawingsCached = unstable_cache(
    async (limit: number) => fetchDrawings(limit),
    [SKETCHBOOK_DRAWINGS_TAG],
    {
        revalidate: 30,
        tags: [SKETCHBOOK_DRAWINGS_TAG]
    }
)

export async function getSketchbookDrawings(limit = 100): Promise<SketchbookDrawing[]> {
    const source = await getStoredDrawingsCached(limit)

    return source.slice().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}
