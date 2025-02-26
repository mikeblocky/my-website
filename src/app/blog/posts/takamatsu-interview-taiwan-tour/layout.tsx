import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Autograph session of Takamatsu-sensei in Taiwan - translation | mikeblocky.com',
    description: 'About the autograph session that she was invited in two days: February 9th - February 10th.',
    openGraph: {
        title: 'Autograph session of Takamatsu-sensei in Taiwan - translation| mikeblocky.com',
        description: 'About the autograph session that she was invited  in two days: February 9th - February 10th.',
        type: 'article',
        publishedTime: '2025-02-26T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Autograph session of Takamatsu-sensei in Taiwan - translation',
        description: 'About the autograph session that she was invited on two days: February 9th - February 10th.',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 