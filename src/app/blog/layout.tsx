import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'Blog | mikeblocky.com',
    description: 'Thoughts, reflections, and learnings from my journey',
    path: '/blog',
    imagePath: '/blog/opengraph-image.png',
    twitterImagePath: '/blog/twitter-image.png',
})

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 
