'use client'

import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import { SectionFooter } from "@/components/layout/footer/SectionFooter"
import Text from "@/components/ui/text/text"
import { motion } from "framer-motion"
import TextHeading from "@/components/ui/text-heading/text-heading"
import { SectionPageHeader } from "@/components/layout/page-header/SectionPageHeader"

const data = [
    { label: "Kemutai Hanashi", value: 42, color: "bg-orange-500" },
    { label: "Skip and Loafer", value: 26, color: "bg-blue-500" },
    { label: "Hoshiai no Sora", value: 8, color: "bg-green-500" },
    { label: "Fan-art for Mutuals", value: 4, color: "bg-pink-500" },
    { label: "Animations", value: 3, color: "bg-yellow-500" },
    { label: "Kimi ni wa Todokanai", value: 1, color: "bg-purple-500" },
]

export default function DrawingStats() {
    const total = data.reduce((acc, item) => acc + item.value, 0)

    return (
        <BaseContainer size="md" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                <SectionPageHeader
                    title="Drawing stats"
                    description="A breakdown of the themes and distribution across my archived works."
                    currentLabel="Drawing stats"
                />

                <StackVertical gap="lg" className="pt-4">
                    <div className="space-y-1">
                        <TextHeading as="h3" weight="bold" className="text-sm text-muted-foreground mt-0 mb-0">
                            Total works
                        </TextHeading>
                        <Text size="2xl" weight="bold" className="text-blue-500 leading-none">
                            {total}
                        </Text>
                    </div>

                    <div className="space-y-6">
                        {data.map((item, i) => (
                            <motion.div 
                                key={item.label} 
                                className="space-y-2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <div className="flex justify-between items-end">
                                    <Text size="sm" weight="medium">{item.label}</Text>
                                    <Text variant="muted" size="xs">
                                        {item.value} works <span className="opacity-50 ml-1">({(item.value / total * 100).toFixed(1)}%)</span>
                                    </Text>
                                </div>
                                <div className="h-2.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.value / total) * 100}%` }}
                                        transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                                        className={`h-full ${item.color} rounded-full`}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </StackVertical>
            </StackVertical>
            <SectionFooter color="blue" showToTop={false} />
        </BaseContainer>
    )
}
