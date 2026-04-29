import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'Learning Utensils | mikeblocky.com',
    description: 'Tools, resources, and materials I use in my learning journey',
    path: '/learning/learning-utensils',
    imagePath: '/learning/opengraph-image.png',
    twitterImagePath: '/learning/twitter-image.png',
})

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 
