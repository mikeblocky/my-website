import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Learning | mikeblocky.com',
    description: 'My journey of learning about things, documented week by week',
    openGraph: {
        title: 'Learning | mikeblocky.com',
        description: 'My journey of learning about things, documented week by week',
        type: 'website',
        images: [
            {
                url: '/learning/opengraph-image.png',
                width: 1200,
                height: 630,
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Learning | mikeblocky.com',
        description: 'My journey of learning about things, documented week by week',
        images: ['/learning/twitter-image.png'],
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 