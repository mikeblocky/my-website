import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'My directions | mikeblocky.com',
    description: 'There is something I want to say.',
    openGraph: {
        title: 'My directions | mikeblocky.com',
        description: 'There is something I want to say.',
        type: 'article',
        publishedTime: '2026-04-10T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'My directions | mikeblocky.com',
        description: 'There is something I want to say.',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 