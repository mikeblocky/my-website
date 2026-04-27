import { notFound } from 'next/navigation'
import { notes } from '../_data/posts'

const SITE_URL = 'https://www.mikeblocky.com'

type Params = Promise<{ slug: string }>

// Generate static params for all reference pages
export async function generateStaticParams() {
    return notes.map((post) => ({
        slug: post.slug,
    }))
}

export async function generateMetadata({ params }: { params: Params }) {
    const { slug } = await params
    const note = notes.find((post) => post.slug === slug)

    if (!note) {
        return {
            title: 'Note not found | mikeblocky.com'
        }
    }
  
    return {
      title: `${note.title} | mikeblocky.com`,
      description: note.description,
      openGraph: {
        title: `${note.title} | mikeblocky.com`,
        description: note.description,
        images: [
          {
            url: new URL('/notes/opengraph-image.png', SITE_URL).toString(),
            width: 1200,
            height: 630,
            alt: note.description,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${note.title} | mikeblocky.com`,
        description: note.description,
        images: [
          new URL('/notes/twitter-image.png', SITE_URL).toString(),
        ],
      },
    };
  }
  

export default async function Reference({ 
    params 
}: { 
    params: Params 
}) {
    const { slug } = await params
    
    // Find the matching blog post
    const post = notes.find(post => post.slug === slug)
    
    // If no matching post is found, return 404
    if (!post) {
        notFound()
    }

    // Import and render the actual blog post component
    const PostComponent = (await import(`../${slug}/page`)).default
    return <PostComponent />
}
