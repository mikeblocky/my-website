import { Metadata } from 'next'

export const metadata: Metadata = {
<<<<<<< HEAD
    title: 'Week 1, 2025 | Weekly Reflections | mikeblocky.com',
    description: 'My learning journey and reflections from Week 1 (February 3rd - February 9th, 2025)',
    openGraph: {
        title: 'Week 1, 2025 | Weekly Reflections | mikeblocky.com',
        description: 'My learning journey and reflections from Week 1 (February 3rd - February 9th, 2025)',
=======
    title: 'Week 1, 2025 | Weekly Reflections | sumit.ml',
    description: 'My learning journey and reflections from Week 1 (Jan 1 - Jan 5, 2025)',
    openGraph: {
        title: 'Week 1, 2025 | Weekly Reflections | sumit.ml',
        description: 'My learning journey and reflections from Week 1 (Jan 1 - Jan 5, 2025)',
>>>>>>> 71e6d19f6c6fa5821c4bec071cad90d5f6b9fa74
        type: 'article',
        publishedTime: '2025-01-05T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
<<<<<<< HEAD
        title: 'Week 1, 2025 | Weekly Reflections | mikeblocky.com',
        description: 'My learning journey and reflections from Week 1 (February 3rd - February 9th, 2025)',
=======
        title: 'Week 1, 2025 | Weekly Reflections',
        description: 'My learning journey and reflections from Week 1 (Jan 1 - Jan 5, 2025)',
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