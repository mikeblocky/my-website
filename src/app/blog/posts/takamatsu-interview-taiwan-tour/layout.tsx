import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Autograph session of Takamatsu-sensei in Taiwan - translation | mikeblocky.com',
    description: 'About the autograph session that she went to on February 25th.',
    openGraph: {
        title: 'Autograph session of Takamatsu-sensei in Taiwan - translation| mikeblocky.com',
        description: 'About the autograph session that she went to on February 25th.',
        type: 'article',
        publishedTime: '2025-02-26T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Autograph session of Takamatsu-sensei in Taiwan - translation',
        description: 'About the autograph session that she went to on February 25th.',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 