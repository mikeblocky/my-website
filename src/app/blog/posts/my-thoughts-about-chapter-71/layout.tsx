import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Some lines of thoughts I have for Chapter 71 | mikeblocky.com',
    description: 'Parents and children, a connection that is complex in its own way.',
    openGraph: {
        title: 'Some lines of thoughts I have for Chapter 71 | mikeblocky.com',
        description: 'Parents and children, a connection that is complex in its own way.',
        type: 'article',
        publishedTime: '2025-06-03T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Some lines of thoughts I have for Chapter 71',
        description: 'Parents and children, a connection that is complex in its own way.',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 