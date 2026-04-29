import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'Books | mikeblocky.com',
    description: 'Notes and summaries from the books I\'m reading to learn about things',
    path: '/notes/books',
    imagePath: '/notes/opengraph-image.png',
    twitterImagePath: '/notes/twitter-image.png',
})

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 
