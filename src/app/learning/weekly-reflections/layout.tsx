import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Weekly Reflections | mikeblocky.com',
    description: 'Weekly documentation of my learning progress, reflections, and insights',
    openGraph: {
        title: 'Weekly Reflections | mikeblocky.com',
        description: 'Weekly documentation of my learning progress, reflections, and insights',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Weekly Reflections | mikeblocky.com',
        description: 'Weekly documentation of my learning progress, reflections, and insights',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 