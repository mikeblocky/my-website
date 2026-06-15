'use client'

import BaseContainer from "@/components/layout/container/base-container"
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import Text from "@/components/ui/text/text"
import { ContentPageHeader } from "@/components/layout/page-header/ContentPageHeader"

interface DailyNoteTemplateProps {
    title: string
    children: React.ReactNode
}

export function DailyNoteTemplate({ title, children }: DailyNoteTemplateProps) {
    return (
        <BaseContainer size="md" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                <ContentPageHeader
                    title={title}
                    breadcrumbs={[
                        { href: '/', label: 'Home', emoji: '🐶' },
                        { href: '/journal', label: 'Journal' },
                        { href: '/journal?tab=notes', label: 'Daily notes' },
                        { label: title }
                    ]}
                >
                    <Text variant="muted" size="sm">
                        A daily note from the diary archive.
                    </Text>
                </ContentPageHeader>

                <article>
                    <div className="prose max-w-none pt-2 dark:prose-invert">
                        {children}
                    </div>
                </article>
            </StackVertical>

            <IndividualPageFooter parentPageName='Daily notes' showToTop={false} />
        </BaseContainer>
    )
}
