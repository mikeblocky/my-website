import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'Week 4, 2025 | Weekly Reflections | mikeblocky.com',
    description: 'My learning journey and reflections from Week 4 (Jan 20 - Jan 26, 2025)',
    path: '/learning/weekly-reflections/weeks/week-4',
    imagePath: '/learning/opengraph-image.png',
    twitterImagePath: '/learning/twitter-image.png',
    type: 'article',
    publishedTime: '2025-01-26T00:00:00.000Z',
})

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 
