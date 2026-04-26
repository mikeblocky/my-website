import { Metadata } from 'next'
export const metadata: Metadata = {
    title: 'Diary | mikeblocky.com',
    description: 'My journey of Diary about things, documented week by week',
    openGraph: {
        title: 'Diary | mikeblocky.com',
        description: 'My journey of Diary about things, documented week by week',
        type: 'website',
        images: [
            {
                url: '/diary/opengraph-image.png',
                width: 1200,
                height: 630,
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Diary | mikeblocky.com',
        description: 'My journey of Diary about things, documented week by week',
        images: ['/diary/twitter-image.png'],
    }
}

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

