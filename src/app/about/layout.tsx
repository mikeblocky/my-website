import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'From me, an incompleted message | mikeblocky.com',
    description: 'A quiet, personal note about this website, my path from Computer Science to Japanese literature, and the stories that shape me.',
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
