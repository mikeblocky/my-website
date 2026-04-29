import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'Weekly Reflections | mikeblocky.com',
    description: 'Weekly documentation of my learning progress, reflections, and insights',
    path: '/learning/weekly-reflections',
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
