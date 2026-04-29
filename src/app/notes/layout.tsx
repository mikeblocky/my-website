import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildSocialMetadata } from '@/lib/metadata/social'

export const metadata: Metadata = buildSocialMetadata({
    title: 'My Notes | mikeblocky.com',
    description: 'A collection of references and notes from my learning journey',
    path: '/notes',
    imagePath: '/notes/opengraph-image.png',
    twitterImagePath: '/notes/twitter-image.png',
})

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    notFound()
} 
