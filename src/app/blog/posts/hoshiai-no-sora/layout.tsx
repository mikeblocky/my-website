import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'My thoughts about Hoshiai no Sora | mikeblocky.com',
    description: 'To define who we are, our purposes and to go with it.',
    openGraph: {
        title: 'My thoughts about Hoshiai no Sora | mikeblocky.com',
        description: 'To define who we are, our purposes and to go with it.',
        type: 'article',
        publishedTime: '2026-04-28T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'My thoughts about Hoshiai no Sora',
        description: 'To define who we are, our purposes and to go with it.',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 