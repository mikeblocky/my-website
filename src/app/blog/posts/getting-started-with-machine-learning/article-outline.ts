import { SECTION_IDS } from "./section-ids"

export const ARTICLE_OUTLINE = [
    { id: SECTION_IDS.INTRODUCTION, label: 'Introduction' },
    { id: SECTION_IDS.MATH.MATH, label: 'Math' },
    { id: SECTION_IDS.PROGRAMMING.PROGRAMMING, label: 'Programming' },
    { id: SECTION_IDS.ML_STUFF.ML_STUFF, label: 'ML Stuff' },
    { id: SECTION_IDS.RESOURCES.RESOURCES, label: 'More Resources' },
] as const
