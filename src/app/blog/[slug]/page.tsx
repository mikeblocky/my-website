import { notFound } from 'next/navigation'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { buildSocialMetadata } from '@/lib/metadata/social'
import { blogPosts, getBlogPostBySlug } from '../_data/posts'
import { BlogPostMdxPage } from '../_components/BlogPostMdxPage'

const SITE_URL = 'https://www.mikeblocky.com'
const SOCIAL_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'] as const

type Params = Promise<{ slug: string }>
export const dynamicParams = false

function resolveSocialImageUrl(slug: string, imageName: 'opengraph-image' | 'twitter-image') {
    const postDir = path.join(process.cwd(), 'src', 'app', 'blog', 'posts', slug)

    for (const extension of SOCIAL_IMAGE_EXTENSIONS) {
        const imagePath = path.join(postDir, `${imageName}.${extension}`)

        if (existsSync(imagePath)) {
            return new URL(`/blog/posts/${slug}/${imageName}.${extension}`, SITE_URL).toString()
        }
    }

    return undefined
}

// Generate static params for all blog posts
export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.slug,
    }))
}

export async function generateMetadata({ params }: { params: Params }) {
    const { slug } = await params
    const post = getBlogPostBySlug(slug)

    if (!post) {
        return {
            title: 'Post not found | mikeblocky.com'
        }
    }

    const title = `${post.title} | mikeblocky.com`
    const description = post.description
    const openGraphImageUrl = resolveSocialImageUrl(slug, 'opengraph-image') ?? '/blog/opengraph-image.png'
    const twitterImageUrl = resolveSocialImageUrl(slug, 'twitter-image') ?? '/blog/twitter-image.png'
    const altText = description || post.title

    return buildSocialMetadata({
        title,
        description,
        path: `/blog/${slug}`,
        imagePath: openGraphImageUrl,
        twitterImagePath: twitterImageUrl,
        imageAlt: altText,
        type: 'article',
        publishedTime: post.publishedAt,
    })
}
  

export default async function BlogPost({ 
    params 
}: { 
    params: Params 
}) {
    const { slug } = await params
    
    const post = getBlogPostBySlug(slug)
    
    if (!post) {
        notFound()
    }

    if (post.renderMode === 'custom') {
        const PostComponent = (await import(`../posts/${slug}/page`)).default
        return <PostComponent />
    }

    return <BlogPostMdxPage post={post} />
}

