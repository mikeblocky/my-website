import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import { SectionFooter } from "@/components/layout/footer/SectionFooter"
import { SectionPageHeader } from "@/components/layout/page-header/SectionPageHeader"
import { StatsClient } from "./StatsClient"
import { getDrawingStats } from "@/lib/stats/drawing-stats"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Drawing stats | mikeblocky.com",
    description: "A breakdown of the themes and distribution across my archived works.",
}

// Force dynamic to reflect filesystem changes immediately
export const dynamic = 'force-dynamic'

export default function DrawingStatsPage() {
    const data = getDrawingStats()

    return (
        <BaseContainer size="md" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                <SectionPageHeader
                    title="Drawing stats"
                    description="A breakdown of the themes and distribution across my archived works."
                    currentLabel="Drawing stats"
                />

                <StatsClient data={data} />
            </StackVertical>
            <SectionFooter color="blue" showToTop={false} />
        </BaseContainer>
    )
}
