import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'Week 2, 2025 | Weekly Reflections | mikeblocky.com',
    description: 'My learning journey and reflections from Week 2 (Jan 6 - Jan 12, 2025)',
    path: '/learning/weekly-reflections/weeks/week-2',
    imagePath: '/learning/opengraph-image.png',
    twitterImagePath: '/learning/twitter-image.png',
    type: 'article',
    publishedTime: '2025-01-12T00:00:00.000Z',
})

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 
