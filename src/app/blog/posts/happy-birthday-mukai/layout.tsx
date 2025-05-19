import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Happy birthday, Mukai | mikeblocky.com',
    description: 'May 19th may seem to be a bright day, for us.',
    openGraph: {
        title: 'Happy birthday, Mukai | mikeblocky.com',
        description: 'May 19th may seem to be a bright day, for us.',
        type: 'article',
        publishedTime: '2025-05-19T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'My thoughts about Kemutai Hanashi - Chapter 1',
        description: 'May 19th may seem to be a bright day, for us.',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 