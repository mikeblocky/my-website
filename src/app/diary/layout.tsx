import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'Diary | mikeblocky.com',
    description: 'Personal notes, reflections, and small moments I want to keep.',
    path: '/diary',
    imagePath: '/diary/opengraph-image.png',
    twitterImagePath: '/diary/twitter-image.png',
})

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
        </>
    )
} 

