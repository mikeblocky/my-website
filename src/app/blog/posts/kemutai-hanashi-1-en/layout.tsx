import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'My thoughts about Kemutai Hanashi - Chapter 1 | mikeblocky.com',
    description: 'Where there is smoke, there is fire.',
    openGraph: {
        title: 'My thoughts about Kemutai Hanashi - Chapter 1 | mikeblocky.com',
        description: 'Where there is smoke, there is fire.',
        type: 'article',
        publishedTime: '2025-05-14T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'My thoughts about Kemutai Hanashi - Chapter 1',
        description: 'Where there is smoke, there is fire.',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 