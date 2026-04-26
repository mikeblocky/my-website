import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'April 26, 2026 | mikeblocky.com',
    description: 'My daily notes for April 26, 2026',
    openGraph: {
        title: 'April 26, 2026 | mikeblocky.com',
        description: 'My daily notes for April 26, 2026',
        type: 'article',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'April 26, 2026 | mikeblocky.com',
        description: 'My daily notes for April 26, 2026',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 
