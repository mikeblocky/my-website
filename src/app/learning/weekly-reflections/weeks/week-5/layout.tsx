import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'Week 5, 2025 | Weekly Reflections | mikeblocky.com',
    description: 'My learning journey and reflections from Week 5 (Jan 27 - Feb 2, 2025)',
    path: '/learning/weekly-reflections/weeks/week-5',
    imagePath: '/learning/opengraph-image.png',
    twitterImagePath: '/learning/twitter-image.png',
    type: 'article',
    publishedTime: '2025-02-02T00:00:00.000Z',
})

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 
