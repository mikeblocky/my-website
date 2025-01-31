import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Discord archive - About Shima, Mitsumi, Nao; the seashell, sand, and the sea | mikeblocky.com',
    description: 'Shima, Mitsumi, and Nao for their roles of seashells, sands, and the sea - my take about them.',
    openGraph: {
        title: 'Discord archive - About Shima, Mitsumi, Nao; the seashell, sand, and the sea| mikeblocky.com',
        description: 'Shima, Mitsumi, and Nao for their roles of seashells, sands, and the sea - my take about them..',
        type: 'article',
        publishedTime: '2025-01-31T00:00:00.000Z',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Discord archive - About Shima, Mitsumi, Nao; the seashell, sand, and the sea',
        description: 'Just thoughts about these characters',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 