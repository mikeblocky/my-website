import { Metadata } from 'next'

export const metadata: Metadata = {
<<<<<<< HEAD
    title: 'Week 2, 2025 | Weekly Reflections | mikeblocky.com',
    description: 'My learning journey and reflections from Week 2 (Jan 6th - Jan 13th, 2025)',
    openGraph: {
        title: 'Week 2, 2025 | Weekly Reflections | mikeblocky.com',
        description: 'My learning journey and reflections from Week 2 (Jan 6th - Jan 13th, 2025)',
=======
    title: 'Week 2, 2025 | Weekly Reflections | sumit.ml',
    description: 'My learning journey and reflections from Week 2 (Jan 6 - Jan 12, 2025)',
    openGraph: {
        title: 'Week 2, 2025 | Weekly Reflections | sumit.ml',
        description: 'My learning journey and reflections from Week 2 (Jan 6 - Jan 12, 2025)',
>>>>>>> 71e6d19f6c6fa5821c4bec071cad90d5f6b9fa74
        type: 'article',
        publishedTime: '2025-01-12T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
<<<<<<< HEAD
        title: 'Week 2, 2025 | Weekly Reflections | mikeblocky.com',
        description: 'My learning journey and reflections from Week 2 (Jan 6th - Jan 13th, 2025)',
=======
        title: 'Week 2, 2025 | Weekly Reflections',
        description: 'My learning journey and reflections from Week 2 (Jan 6 - Jan 12, 2025)',
>>>>>>> 71e6d19f6c6fa5821c4bec071cad90d5f6b9fa74
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 