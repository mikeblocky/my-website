'use client'

import { lazy, Suspense, useMemo } from 'react'
import Text from '@/components/ui/text/text'
import { mdxComponents } from '@/lib/mdx/mdx-components'
import type { BlogPost } from '../_types/blog'
import { BlogPostTemplate } from './BlogPostTemplate'
import { ArticleSectionPreview, ArticleSectionPreviewMobile } from './ArticleSectionPreview'
import { ArticleLineRail } from './ArticleLineRail'
import type { OutlineSection } from '@/lib/mdx/outline'

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

export function BlogPostMdxPage({
    post,
    outlineSections,
}: {
    post: BlogPost
    outlineSections: OutlineSection[]
}) {
    return (
        <BlogPostTemplate
            title={post.title}
            date={post.date}
            readingTime={post.readingTime}
            slug={post.slug}
            themes={post.themes}
            className={post.contentClassName}
            articleId="content"
            containerSize="xl"
            aside={outlineSections.length > 0 ? <ArticleSectionPreview sections={outlineSections} /> : undefined}
            mobileSectionBar={outlineSections.length > 0 ? <ArticleSectionPreviewMobile sections={outlineSections} /> : undefined}
            rightRail={<ArticleLineRail articleId="content" />}
        >
            <LazyMdxContent slug={post.slug} />
        </BlogPostTemplate>
    )
}
