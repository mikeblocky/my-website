import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'From me, an incompleted message | mikeblocky.com',
    description: 'I don\'t really know what I\'m doing',
    path: '/about',
    imagePath: '/about/opengraph-image.png',
    twitterImagePath: '/about/twitter-image.png',
})

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 
