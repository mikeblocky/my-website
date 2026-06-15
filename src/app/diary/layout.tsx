import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata = buildSocialMetadata({
    title: 'Diary | mikeblocky.com',
    description: 'Daily logs, short entries, and quick notes from my day-to-day life.',
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

