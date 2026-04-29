'use client'

import { lazy, Suspense, useMemo } from 'react'
import Text from '@/components/ui/text/text'
import { mdxComponents } from '@/lib/mdx/mdx-components'
import type { BlogPost } from '../_types/blog'
import { BlogPostTemplate } from './BlogPostTemplate'

function LazyMdxContent({ slug }: { slug: string }) {
    const Content = useMemo(
        () =>
            lazy(async () => {
                const mod = await import(`../posts/${slug}/content.mdx`)
                const MdxContent = mod.default

                return {
                    default: function WrappedMdxContent() {
                        return <MdxContent components={mdxComponents} />
                    }
                }
            }),
        [slug]
    )

    return (
        <Suspense
            fallback={
                <Text variant="muted" size="sm">
                    Loading post...
                </Text>
            }
        >
            <Content />
        </Suspense>
    )
}

export function BlogPostMdxPage({ post }: { post: BlogPost }) {
    return (
        <BlogPostTemplate
            title={post.title}
            date={post.date}
            readingTime={post.readingTime}
            themes={post.themes}
            className={post.contentClassName}
        >
            <LazyMdxContent slug={post.slug} />
        </BlogPostTemplate>
    )
}
