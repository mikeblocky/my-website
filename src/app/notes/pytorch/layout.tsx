import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'PyTorch References | Notes | mikeblocky.com',
    description: 'PyTorch code snippets and examples from my learning journey',
    path: '/notes/pytorch',
    imagePath: '/notes/opengraph-image.png',
    twitterImagePath: '/notes/twitter-image.png',
    type: 'article',
    publishedTime: '2025-01-20T00:00:00.000Z',
})

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 
