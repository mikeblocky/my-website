'use client'

import BaseContainer from "@/components/layout/container/base-container"
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import { DynamicBreadcrumb } from "@/components/ui/primitives/breadcrumb"
import { ThemeToggle } from "@/components/ui/theme/theme-toggle"
import TextHeading from "@/components/ui/text-heading/text-heading"

interface DailyNoteTemplateProps {
    title: string
    children: React.ReactNode
}

export function DailyNoteTemplate({ title, children }: DailyNoteTemplateProps) {
    return (
        <BaseContainer size="md" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                <div className="flex items-center justify-between">
                    <DynamicBreadcrumb
                        items={[
                            { href: '/', label: 'Home', emoji: '🐶' },
                            { href: '/diary', label: 'Diary' },
                            { href: '/diary/daily-notes', label: 'Daily notes' },
                            { label: title }
                        ]}
                    />
                    <ThemeToggle />
                </div>

                <article>
                    <TextHeading as="h1">{title}</TextHeading>

                    <div className="prose mt-8 max-w-none dark:prose-invert">
                        {children}
                    </div>
                </article>
            </StackVertical>

            <IndividualPageFooter parentPageName='Daily notes' showToTop={false} />
        </BaseContainer>
    )
}
