import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Books | mikeblocky.com',
    description: 'Notes and summaries from the books I\'m reading to learn about things',
    openGraph: {
        title: 'Books | mikeblocky.com',
        description: 'Notes and summaries from the books I\'m reading to learn about things',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Books | mikeblocky.com',
        description: 'Notes and summaries from the books I\'m reading to learn about things',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 