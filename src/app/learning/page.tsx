'use client'

import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import { SectionFooter } from "@/components/layout/footer/SectionFooter"
import { SectionPageHeader } from "@/components/layout/page-header/SectionPageHeader"
import { SectionLinkItem } from "@/components/layout/page-header/SectionLinkList"

export default function Learning() {
    return (
        <BaseContainer size="md" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                <SectionPageHeader
                    title="Learning"
                    description="A collection of my learning pages: weekly reflections, materials I use, and more."
                    currentLabel="Learning"
                />
                <StackVertical gap="md">
                    <SectionLinkItem
                        href="/learning/weekly-reflections/"
                        title="Weekly Reflections"
                        description="A running log of what I studied, noticed, and want to improve."
                    />
                    <SectionLinkItem
                        href="/learning/learning-utensils/"
                        title="Learning Utensils"
                        description="The books, apps, and equipment I use while learning."
                    />
                </StackVertical>
            </StackVertical>
            <SectionFooter color="blue" showToTop={false} />
        </BaseContainer>
    )
}

