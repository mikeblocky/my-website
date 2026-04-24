import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'My thoughts about Kemutai Hanashi - Chapter 2 and 3: Relationships and labels | mikeblocky.com',
    description: 'When things cannot be made into words easily.',
    openGraph: {
        title: 'My thoughts about Kemutai Hanashi - Chapter 2 and 3: Relationships and labels | mikeblocky.com',
        description: 'When things cannot be made into words easily.',
        type: 'article',
        publishedTime: '2026-03-09T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'My thoughts about Kemutai Hanashi - Chapter 2 and 3: Relationships and labels',
        description: 'When things cannot be made into words easily.',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 