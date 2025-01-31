import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Misaki Takamatsu speaks about her long-term serialization journey in Skip and Loafer (Translation) | mikeblocky.com',
    description: 'A translation of the space that Takamatsu-sensei did on an interview, which released on January 2025.',
    openGraph: {
        title: 'Misaki Takamatsu speaks about her long-term serialization journey in Skip and Loafer (Translation)| mikeblocky.com',
        description: 'A translation of the space that Takamatsu-sensei did on an interview, which released on January 2025h.',
        type: 'article',
        publishedTime: '2025-01-31T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Misaki Takamatsu speaks about her long-term serialization journey in Skip and Loafer (Translation)',
        description: 'A translation of the space that Takamatsu-sensei did on an interview, which released on January 2025.',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 