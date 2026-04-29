import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'LLM from Scratch Notes | Books | mikeblocky.com',
    description: 'My notes and learnings from "Build a Large Language Model (from Scratch)" by Sebastian Raschka',
    path: '/notes/books/llm-from-scratch-raschka',
    imagePath: '/notes/opengraph-image.png',
    twitterImagePath: '/notes/twitter-image.png',
    type: 'article',
    publishedTime: '2025-01-14T00:00:00.000Z',
})

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 
