import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'My thoughts about Chapter 68 | mikeblocky.com',
    description: 'To grow up is to become a child again.',
    openGraph: {
        title: 'My thoughts about Chapter 68 | mikeblocky.com',
        description: 'To grow up is to become a child again.',
        type: 'article',
        publishedTime: '2025-02-25T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'My thoughts about Chapter 68',
        description: 'To grow up is to become a child again.',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 