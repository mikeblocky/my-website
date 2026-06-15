import type { SketchbookDrawing } from "$lib/types/sketchbook"
import { fetchDrawings } from "./sketchbook"

export const SKETCHBOOK_DRAWINGS_TAG = "sketchbook-drawings"

let cachedDrawings: SketchbookDrawing[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

export async function getSketchbookDrawings(limit = 100): Promise<SketchbookDrawing[]> {
    const now = Date.now();
    if (!cachedDrawings || now - lastCacheTime > CACHE_TTL) {
        cachedDrawings = await fetchDrawings(limit);
        lastCacheTime = now;
    }

    return cachedDrawings.slice().sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

export function revalidateSketchbookDrawings() {
    cachedDrawings = null;
    lastCacheTime = 0;
}
