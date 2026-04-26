'use client'

import Content from './content.mdx'
import { mdxComponents } from '@/lib/mdx/mdx-components'
import BaseContainer from '@/components/layout/container/base-container'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { DynamicBreadcrumb } from '@/components/ui/primitives/breadcrumb'
import { ThemeToggle } from '@/components/ui/theme/theme-toggle'
import { IndividualPageFooter } from '@/components/layout/footer/IndividualPageFooter'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'

export default function DailyNote() {
    return (
        <BaseContainer size="md" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                <div className="flex items-center justify-between">
                    <DynamicBreadcrumb 
                        items={[
                            { href: '/', label: 'Home', emoji: '👾' },
                            { href: '/diary', label: 'Diary' },
                            { href: '/diary/daily-notes', label: 'Daily notes' },
                            { label: 'April 26, 2026' }
                        ]}
                    />
                    <ThemeToggle />
                </div>

                <article>
                    <TextHeading as="h1">April 26, 2026</TextHeading>

                    <div className="prose dark:prose-invert max-w-none mt-8">
                        <Content components={mdxComponents} />
                    </div>
                </article>
            </StackVertical>

            <IndividualPageFooter parentPageName='Daily notes' showToTop={false} />
        </BaseContainer>
    )
}
