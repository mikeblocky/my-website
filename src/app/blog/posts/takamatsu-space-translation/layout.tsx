import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Takamatsu-sensei\'s January 13th space - translation | mikeblocky.com',
    description: 'An updated translation of the space that Takamatsu-sensei did on January 13th.',
    openGraph: {
        title: 'Takamatsu-sensei\'s January 13th space - translation | mikeblocky.com',
        description: 'An updated translation of the space that Takamatsu-sensei did on January 13th.',
        type: 'article',
        publishedTime: '2025-01-31T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Takamatsu-sensei\'s January 13th space - translation',
        description: 'An updated translation of the space that Takamatsu-sensei did on January 13th.',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 