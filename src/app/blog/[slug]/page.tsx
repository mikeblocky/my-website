import { notFound } from 'next/navigation'
import { blogPosts } from '../_data/posts'

const SITE_URL = 'https://www.mikeblocky.com'

type Params = Promise<{ slug: string }>

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
    const extension = post.imageFormat || 'png'
    const openGraphImageUrl = new URL(`/blog/posts/${slug}/opengraph-image.${extension}`, SITE_URL).toString()
    const twitterImageUrl = new URL(`/blog/posts/${slug}/twitter-image.${extension}`, SITE_URL).toString()
    const altText = description || post.title
  
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: openGraphImageUrl,
            width: 1200,
            height: 630,
            alt: altText
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [twitterImageUrl],
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

