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
            className="flex items-center gap-3"
        >
            <div className="text-purple-500">
                {icon}
            </div>
            <Text variant="muted" size="sm">
                {text}
                {hyperlink && hyperlinkText && (
                    <Link href={hyperlink} className="text-purple-500 hover:underline">
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
            text: "Studying Japanese language and literature, preparing for JLPT and exploring cultural nuances through readings."
        },
        {
            icon: <Palette className="w-4 h-4" />,
            text: "Working on new illustration projects that focus on warmth, memory, and quiet human connection."
        },
        {
            icon: <PenTool className="w-4 h-4" />,
            text: "Writing reflections and small essays about art, identity, and stories like Skip and Loafer and Kemutai Hanashi."
        },
        {
            icon: <Sparkles className="w-4 h-4" />,
            text: "Designing small creative tools and improving my site to feel more like a personal journal than a portfolio."
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
