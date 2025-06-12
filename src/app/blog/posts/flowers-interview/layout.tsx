import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Yuki Kodama\'s 25th anniversary as a manga artist: Special project 1 - Interview with Takamatsu Misaki | mikeblocky.com',
    description: 'An interview between authors during the anniversary of Yuki Kodama-sensei.',
    openGraph: {
        title: 'Yuki Kodama\'s 25th anniversary as a manga artist: Special project 1 - Interview with Takamatsu Misaki | mikeblocky.com',
        description: 'An interview between authors during the anniversary of Yuki Kodama-sensei.',
        type: 'article',
        publishedTime: '2025-06-13T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Yuki Kodama\'s 25th anniversary as a manga artist: Special project 1 - Interview with Takamatsu Misaki',
        description: 'An interview between authors during the anniversary of Yuki Kodama-sensei.',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 