import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'Week 6, 2025 | Weekly Reflections | mikeblocky.com',
    description: 'My learning journey and reflections from Week 6 (Feb 3 - Feb 9, 2025)',
    path: '/learning/weekly-reflections/weeks/week-6',
    imagePath: '/learning/opengraph-image.png',
    twitterImagePath: '/learning/twitter-image.png',
    type: 'article',
    publishedTime: '2025-02-09T00:00:00.000Z',
})

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 
