import { Metadata } from 'next'

export const metadata: Metadata = {
    title: '「煙たい話：第一章」についての私の考え | mikeblocky.com',
    description: '煙あるところに火あり。',
    openGraph: {
        title: '「煙たい話：第一章」についての私の考え | mikeblocky.com',
        description: '煙あるところに火あり。',
        type: 'article',
        publishedTime: '2025-05-14T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: '「煙たい話：第一章」についての私の考え',
        description: '煙あるところに火あり。',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 