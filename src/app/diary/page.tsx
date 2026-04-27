'use client'

import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import TextHeading from "@/components/ui/text-heading/text-heading"
import { SectionFooter } from "@/components/layout/footer/SectionFooter"
import Text from "@/components/ui/text/text"
import { DynamicBreadcrumb } from "@/components/ui/primitives/breadcrumb"
import { ThemeToggle } from "@/components/ui/theme/theme-toggle"
import Link from "next/link"

export default function Diary() {
    return (
        <BaseContainer size="md" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                <div className="flex items-center justify-between">
                    <DynamicBreadcrumb 
                        items={[
                            { href: '/', label: 'Home', emoji: '🐶' },
                            { label: 'Diary' }
                        ]}
                    />
                    <ThemeToggle />
                </div>

                <div>
                <TextHeading as="h1" weight="bold">
                    Diary
                </TextHeading>
                <Text variant="muted" className="mb-8">
                    A collection of my diary: daily notes, materials I use, and more.
                </Text>

                <StackVertical gap="md">
                    <Link 
                        href="/diary/daily-notes/"
                        className="group"
                    >
                        <Text 
                            size="md" 
                            className="underline font-bold transition-colors duration-200 group-hover:text-blue-500"
                        >
                            Daily Notes
                        </Text>
                    </Link>
                    <Link 
                        href="/diary/diary-utensils/"
                        className="group"
                    >
                        <Text 
                            size="md" 
                            className="underline font-bold transition-colors duration-200 group-hover:text-blue-500"
                        >
                            Diary Utensils
                        </Text>
                    </Link>
                </StackVertical>
            </div>
            </StackVertical>
            <SectionFooter color="blue" showToTop={false} />
        </BaseContainer>
    )
}


