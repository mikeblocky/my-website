'use client'

import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import TextHeading from "@/components/ui/text-heading/text-heading"
import Text from "@/components/ui/text/text"
import { DynamicBreadcrumb } from "@/components/ui/primitives/breadcrumb"
import { ThemeToggle } from "@/components/ui/theme/theme-toggle"
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter"
import Link from "next/link"

export default function LearningUtensils() {
    return (
        <BaseContainer size="md" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                {/* Breadcrumb */}
                <div className="flex items-center justify-between">
                    <DynamicBreadcrumb 
                        items={[
                            { href: '/', label: 'Home', emoji: '👾' },
                            { href: '/learning', label: 'Learning' },
                            { label: 'Personal utensils' }
                        ]}
                    />
                    <ThemeToggle />
                </div>

                {/* Header Content */}
                <div>
                <TextHeading as="h1" weight="bold">
                    Personal utensils
                </TextHeading>
                    <Text variant="muted" className="mb-8">
                        All my stuffs that I use to work and draw
                    </Text>

                <StackVertical gap="md">
                    <Text><span className="font-bold">Keyboard:</span> <Link href="https://www.logitech.com/en-us/products/keyboards/pop-keys-wireless-mechanical.920-010708.html" className="underline hover:text-purple-500">Logitech POP Keys</Link></Text>
                    <Text><span className="font-bold">Mouse:</span> <Link href="https://www.logitech.com/en-us/products/mice/pop-wireless-mouse.html" className="underline hover:text-purple-500">Logitech POP Mouse</Link></Text>
                    <Text><span className="font-bold">Notebook (physical):</span> Normal notebook from Muji Japan</Text>
                    <Text><span className="font-bold">Pen:</span> 0.5 black ink ballpoint pen from Muji Japan (same store as above)</Text>
                    
                </StackVertical>
            </div>

            </StackVertical>

            <IndividualPageFooter sectionName={`Learning`} showToTop={false} />

        </BaseContainer>
    )
}