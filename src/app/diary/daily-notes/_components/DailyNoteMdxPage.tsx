'use client'

import { lazy, Suspense, useMemo } from 'react'
import Text from '@/components/ui/text/text'
import { mdxComponents } from '@/lib/mdx/mdx-components'
import { DailyNoteTemplate } from './DailyNoteTemplate'

function LazyDiaryMdxContent({ slug }: { slug: string }) {
    const Content = useMemo(
        () =>
            lazy(async () => {
                const mod = await import(`../days/${slug}/content.mdx`)
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
                    Loading note...
                </Text>
            }
        >
            <Content />
        </Suspense>
    )
}

export function DailyNoteMdxPage({ title, slug }: { title: string; slug: string }) {
    return (
        <DailyNoteTemplate title={title}>
            <LazyDiaryMdxContent slug={slug} />
        </DailyNoteTemplate>
    )
}
