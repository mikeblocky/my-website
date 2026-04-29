'use client'

import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import { SectionFooter } from "@/components/layout/footer/SectionFooter"
import { SectionPageHeader } from "@/components/layout/page-header/SectionPageHeader"
import { SectionLinkItem } from "@/components/layout/page-header/SectionLinkList"

export default function Diary() {
    return (
        <BaseContainer size="md" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                <SectionPageHeader
                    title="Diary"
                    description="A collection of my diary pages: daily notes, materials I use, and more."
                    currentLabel="Diary"
                />

                <StackVertical gap="md">
                    <SectionLinkItem
                        href="/diary/daily-notes/"
                        title="Daily notes"
                        description="Short entries, snapshots, and daily writing."
                    />
                    <SectionLinkItem
                        href="/diary/diary-utensils/"
                        title="Diary utensils"
                        description="The tools, supplies, and setup behind my diary pages."
                    />
                </StackVertical>
            </StackVertical>
            <SectionFooter color="blue" showToTop={false} />
        </BaseContainer>
    )
}


