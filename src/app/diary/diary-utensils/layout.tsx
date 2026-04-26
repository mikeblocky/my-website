import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Diary Utensils | mikeblocky.com',
    description: 'Tools, resources, and materials I use in my Diary journey',
    openGraph: {
        title: 'Diary Utensils | mikeblocky.com',
        description: 'Tools, resources, and materials I use in my Diary journey',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Diary Utensils | mikeblocky.com',
        description: 'Tools, resources, and materials I use in my Diary journey',
    }
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
} 

