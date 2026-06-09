'use client'

import { motion } from 'framer-motion'
import { BookOpen, Palette, PenTool, Sparkles } from 'lucide-react'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import Text from '@/components/ui/text/text'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Link from 'next/link'

interface WorkItemProps {
    icon: React.ReactNode;
    text: string;
    delay: number;
    hyperlink?: string;
    hyperlinkText?: string;
    endText?: string;
}

function WorkItem({ icon, text, delay, hyperlink, hyperlinkText, endText }: WorkItemProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="group flex items-center gap-3"
        >
            <div className="pride-text transition-colors duration-200 group-hover:text-pink-500 dark:group-hover:text-pink-300">
                {icon}
            </div>
            <Text variant="muted" size="sm">
                {text}
                {hyperlink && hyperlinkText && (
                    <Link href={hyperlink} className="pride-text hover:underline">
                        {hyperlinkText}
                    </Link>
                )}
                {endText && (
                    <span>{endText}</span>
                )}
            </Text>
        </motion.div>
    )
}

export function CurrentWork() {
    const items = [
        {
            icon: <BookOpen className="w-4 h-4" />,
            text: "Learning Japanese at my own pace, mixing study with music, videos, and whatever helps me get used to the language."
        },
        {
            icon: <Palette className="w-4 h-4" />,
            text: "Drawing small, quiet scenes and just trying to make things that feel right to me."
        },
        {
            icon: <PenTool className="w-4 h-4" />,
            text: "Writing down thoughts here and there—about life, art, and the stories that stick with me."
        },
        {
            icon: <Sparkles className="w-4 h-4" />,
            text: "Working on this site slowly, turning it into a place where I can share things and hopefully connect with people."
        }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
        >
            <StackVertical gap="none">
                <TextHeading as="h2">Current ongoings</TextHeading>
                <StackVertical gap="md">
                    {items.map((item, index) => (
                        <WorkItem
                            key={index}
                            icon={item.icon}
                            text={item.text}
                            delay={1.2 + index * 0.1}
                        />
                    ))}
                </StackVertical>
            </StackVertical>
        </motion.div>
    )
}
