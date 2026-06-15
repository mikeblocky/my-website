import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'Daily Notes | mikeblocky.com',
    description: 'A collection of short entries, gratitude logs, and snippets of what I learn or document each day.',
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

