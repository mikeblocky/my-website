import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Thoughts of Shima - the sand and the crab | mikeblocky.com',
    description: 'Just my thoughts about Shima and the way those elements relate to him.',
    openGraph: {
        title: 'Thoughts of Shima - the sand and the crab | mikeblocky.com',
        description: 'Just my thoughts about Shima and the way those elements relate to him.',
        type: 'article',
        publishedTime: '2025-02-26T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Thoughts of Shima - the sand and the craba',
        description: 'Just my thoughts about Shima and the way those elements relate to him.',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 