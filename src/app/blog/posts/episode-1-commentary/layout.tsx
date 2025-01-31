import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Episode 1 commentary - translation | mikeblocky.com',
    description: 'A translation of the first episode commentary.',
    openGraph: {
        title: 'Episode 1 commentary - translation| mikeblocky.com',
        description: 'A translation of the first episode commentary.',
        type: 'article',
        publishedTime: '2025-01-31T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Episode 1 commentary - translation',
        description: 'A translation of the first episode commentary.',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 