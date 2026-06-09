'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/utils'
import BaseContainer from '@/components/layout/container/base-container'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { IndividualPageFooter } from '@/components/layout/footer/IndividualPageFooter'
import Text from '@/components/ui/text/text'
import { ContentPageHeader } from '@/components/layout/page-header/ContentPageHeader'

interface BlogPostTemplateProps {
    title: string
    date: string
    readingTime: string
    slug?: string
    themes?: string[]
    children: React.ReactNode
    className?: string
    articleId?: string
    containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    aside?: React.ReactNode
    mobileSectionBar?: React.ReactNode
    rightRail?: React.ReactNode
    articleShellClassName?: string
}

export function BlogPostTemplate({
    title,
    date,
    readingTime,
    slug,
    themes = [],
    children,
    className,
    articleId,
    containerSize = 'md',
    aside,
    mobileSectionBar,
    rightRail,
    articleShellClassName,
}: BlogPostTemplateProps) {
    const [readCount, setReadCount] = useState<number | null>(null)
    const hasRecordedReadRef = useRef(false)

    useEffect(() => {
        if (!slug || hasRecordedReadRef.current) return

        hasRecordedReadRef.current = true

        const recordRead = async () => {
            try {
                const response = await fetch('/api/blog/read-count', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ slug }),
                })
                const data = await response.json()

                if (response.ok && typeof data.count === 'number') {
                    setReadCount(data.count)
                }
            } catch (error) {
                console.error('Could not record blog read count:', error)
            }
        }

        recordRead()
    }, [slug])

    return (
        <div className="relative w-full">
            <BaseContainer size={containerSize} paddingX="md" paddingY="lg">
                <StackVertical gap="md">
                    <ContentPageHeader
                        title={title}
                        breadcrumbs={[
                            { href: '/', label: 'Home', emoji: '🐶' },
                            { href: '/blog', label: 'Blog' },
                            { label: title }
                        ]}
                        showPrideBadge={false}
                    >
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                            <Text variant="muted" size="sm">
                                {date} | {readingTime}
                            </Text>
                            {readCount !== null && (
                                <>
                                    <span className="text-muted-foreground/30">•</span>
                                    <Text variant="muted" size="sm">
                                        {readCount.toLocaleString()} reads
                                    </Text>
                                </>
                            )}
                            {themes.map((theme) => (
                                <div key={theme} className="flex items-center gap-2">
                                    <span className="text-muted-foreground/30">•</span>
                                    <Text size="sm" weight="medium" className="pride-text lowercase">
                                        {theme}
                                    </Text>
                                </div>
                            ))}
                        </div>

                    </ContentPageHeader>

                    {aside || rightRail ? (
                        <div className={cn(
                            "grid gap-6 xl:gap-8 xl:grid-cols-[minmax(0,1fr)_72px]",
                            articleShellClassName
                        )}>
                                <article id={articleId} className="relative">
                                    {/* Desktop sidebar - absolutely positioned to the left */}
                                    <div className="hidden xl:block absolute right-full mr-8 2xl:mr-12 top-0 bottom-0 pointer-events-none">
                                        <div className="sticky top-1/2 -translate-y-1/2 pointer-events-auto flex justify-end">
                                            {aside}
                                        </div>
                                    </div>

                                    {/* Mobile sticky section bar - in normal flow for reliable sticky */}
                                    {mobileSectionBar && (
                                        <div className="xl:hidden -mx-3 sm:-mx-4 md:-mx-6 mb-4">
                                            {mobileSectionBar}
                                        </div>
                                    )}

                                    <div 
                                        id="blog-content-body" 
                                        className={cn("prose max-w-none pb-24 pt-2 xl:pb-0 dark:prose-invert relative", className)}
                                    >
                                        {children}
                                    </div>
                                </article>
                                <div>{rightRail}</div>
                            </div>
                    ) : (
                        <article id={articleId}>
                            <div 
                                id="blog-content-body" 
                                className={cn("prose max-w-none pt-2 dark:prose-invert relative", className)}
                            >
                                {children}
                            </div>
                        </article>
                    )}

                </StackVertical>
            </BaseContainer>

            <IndividualPageFooter parentPageName='Blog' />
        </div>
    )
}
