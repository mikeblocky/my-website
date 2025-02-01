import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'From me, an incompleted message | mikeblocky.com',
    description: 'I don\'t really know what I\'m doing',
    openGraph: {
        title: 'From me, an incompleted message | mikeblocky.com',
        description: 'I don\'t really know what I\'m doing',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'From me, an incompleted message',
        description: 'I don\'t really know what I\'m doing',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 