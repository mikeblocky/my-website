import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'Daily Notes | mikeblocky.com',
    description: 'Daily documentation of my thoughts, reflections, and small moments.',
    path: '/diary/daily-notes',
    imagePath: '/diary/opengraph-image.png',
    twitterImagePath: '/diary/twitter-image.png',
})

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 

