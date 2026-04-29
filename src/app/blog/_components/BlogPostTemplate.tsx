'use client'

import { cn } from '@/lib/utils/utils'
import BaseContainer from '@/components/layout/container/base-container'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { DynamicBreadcrumb } from '@/components/ui/primitives/breadcrumb'
import { ThemeToggle } from '@/components/ui/theme/theme-toggle'
import { IndividualPageFooter } from '@/components/layout/footer/IndividualPageFooter'
import TextHeading from '@/components/ui/text-heading/text-heading'

interface BlogPostTemplateProps {
    title: string
    date: string
    readingTime: string
    themes?: string[]
    children: React.ReactNode
    className?: string
}

export function BlogPostTemplate({
    title,
    date,
    readingTime,
    themes = [],
    children,
    className
}: BlogPostTemplateProps) {
    return (
        <>
            <BaseContainer size="md" paddingX="md" paddingY="lg">
                <StackVertical gap="md">
                    <div className="flex items-center justify-between">
                        <DynamicBreadcrumb
                            items={[
                                { href: '/', label: 'Home', emoji: '🐶' },
                                { href: '/blog', label: 'Blog' },
                                { label: title }
                            ]}
                        />
                        <ThemeToggle />
                    </div>

                    <article>
                        <TextHeading as="h1">{title}</TextHeading>
                        <div className="mb-8 flex flex-wrap items-center gap-2">
                            <span className="text-[14px] sm:text-[15px] text-muted-foreground dark:text-gray-400">
                                {date} | {readingTime}
                            </span>
                            {themes.map((theme) => (
                                <div key={theme} className="flex items-center gap-2">
                                    <span className="text-muted-foreground/30">•</span>
                                    <span className="text-[14px] font-medium text-blue-600 dark:text-blue-400">
                                        {theme}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className={cn("prose max-w-none dark:prose-invert", className)}>
                            {children}
                        </div>
                    </article>
                </StackVertical>
            </BaseContainer>

            <IndividualPageFooter parentPageName='Blog' />
        </>
    )
}
