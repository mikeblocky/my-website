'use client'

import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import Text from "@/components/ui/text/text"
import { motion } from "framer-motion"
import TextHeading from "@/components/ui/text-heading/text-heading"
import { StatItem } from "@/lib/stats/types"

interface Props {
    data: StatItem[]
}

export function StatsClient({ data }: Props) {
    const total = data.reduce((acc, item) => acc + item.value, 0)

    return (
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
                                {item.value} works <span className="opacity-50 ml-1">({total > 0 ? (item.value / total * 100).toFixed(1) : 0}%)</span>
                            </Text>
                        </div>
                        <div className="h-2.5 w-full bg-secondary/30 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${total > 0 ? (item.value / total) * 100 : 0}%` }}
                                transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }}
                                className={`h-full ${item.color} rounded-full`}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </StackVertical>
    )
}
