import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import { SectionPageShell } from "@/components/layout/page-shell/SectionPageShell"
import { SectionLinkItem } from "@/components/layout/page-header/SectionLinkList"

export default function Learning() {
    return (
        <SectionPageShell
            title="Learning"
            description="A collection of my learning pages: weekly reflections, materials I use, and more."
            currentLabel="Learning"
            contentGap="md"
        >
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
        </SectionPageShell>
    )
}

