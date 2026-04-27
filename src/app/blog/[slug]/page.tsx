import { notFound } from 'next/navigation'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { blogPosts } from '../_data/posts'

const SITE_URL = 'https://www.mikeblocky.com'
const SOCIAL_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'] as const

type Params = Promise<{ slug: string }>

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
    const post = blogPosts.find((entry) => entry.slug === slug)

    if (!post) {
        return {
            title: 'Post not found | mikeblocky.com'
        }
    }

    const title = `${post.title} | mikeblocky.com`
    const description = post.description
    const openGraphImageUrl = resolveSocialImageUrl(slug, 'opengraph-image')
    const twitterImageUrl = resolveSocialImageUrl(slug, 'twitter-image')
    const altText = description || post.title
  
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: openGraphImageUrl ? [
          {
            url: openGraphImageUrl,
            width: 1200,
            height: 630,
            alt: altText
          },
        ] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: twitterImageUrl ? [twitterImageUrl] : undefined,
      },
    };
  }
  

export default async function BlogPost({ 
    params 
}: { 
    params: Params 
}) {
    const { slug } = await params
    
    // Find the matching blog post
    const post = blogPosts.find(post => post.slug === slug)
    
    // If no matching post is found, return 404
    if (!post) {
        notFound()
    }

    // Import and render the actual blog post component
    const PostComponent = (await import(`../posts/${slug}/page`)).default
    return <PostComponent />
}

