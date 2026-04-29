import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'Diary Utensils | mikeblocky.com',
    description: 'Tools, resources, and materials I use in my diary journey.',
    path: '/diary/diary-utensils',
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

