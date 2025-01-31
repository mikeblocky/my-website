import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Misaki Takamatsu January 13th Space - translation | mikeblocky.com',
    description: 'A translation of the space that Takamatsu-sensei did on January 13th.',
    openGraph: {
        title: 'Misaki Takamatsu January 13th Space - translation | mikeblocky.com',
        description: 'A translation of the space that Takamatsu-sensei did on January 13th.',
        type: 'article',
        publishedTime: '2025-01-31T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Misaki Takamatsu January 13th Space - translation',
        description: 'A translation of the space that Takamatsu-sensei did on January 13th.',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 