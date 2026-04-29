import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'Getting Started with Machine Learning | mikeblocky.com',
    description: 'A beginner\'s guide to starting your ML journey',
    path: '/blog/posts/getting-started-with-machine-learning',
    imagePath: '/blog/posts/getting-started-with-machine-learning/opengraph-image.png',
    twitterImagePath: '/blog/posts/getting-started-with-machine-learning/twitter-image.png',
    type: 'article',
    publishedTime: '2025-01-14T00:00:00.000Z',
})

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 
