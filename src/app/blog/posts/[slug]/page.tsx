import { notFound, redirect } from 'next/navigation'
import { blogPosts } from '../../_data/posts'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
    return blogPosts
        .filter((post) => post.renderMode !== 'custom')
        .map((post) => ({
            slug: post.slug,
        }))
}

export default async function LegacyBlogPostRedirect({
    params,
}: {
    params: Params
}) {
    const { slug } = await params
    const post = blogPosts.find((entry) => entry.slug === slug && entry.renderMode !== 'custom')

    if (!post) {
        notFound()
    }

    redirect(`/blog/${slug}`)
}
