import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'My thoughts about Chapter 67 | mikeblocky.com',
    description: 'Shima, Mitsuki, and the rest of the gang - my personal thoughts about everything.',
    openGraph: {
        title: 'My thoughts about Chapter 67 | mikeblocky.com',
        description: 'Shima, Mitsuki, and the rest of the gang - my personal thoughts about everything.',
        type: 'article',
        publishedTime: '2025-01-31T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'My thoughts about Chapter 67',
        description: 'Just thoughts about this chapter',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 