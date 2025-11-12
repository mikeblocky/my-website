import { ReactNode } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils/utils"
import { StackVertical, StackHorizontal } from "@/components/layout/layout-stack/layout-stack"
import Text from "@/components/ui/text/text"
import TextHeading from "@/components/ui/text-heading/text-heading"
import { BlogPost } from "../_types/blog"

type BlogCardProps = {
    post: BlogPost
    isLast?: boolean
    searchTerm?: string
}

export function BlogCard({ post, isLast, searchTerm }: BlogCardProps) {
    const highlightedTitle = highlightText(post.title, searchTerm)
    const highlightedDescription = highlightText(post.description, searchTerm)

    return (
        <div className="group">
            <Link 
                href={`/blog/${post.slug}`} 
                className={cn(
                    "block py-3",
                    "transition-all duration-300",
                    "hover:translate-x-1"
                )}
            >
                <article>
                    <StackVertical gap="xs">
                        <TextHeading 
                            as="h4" 
                            weight="medium" 
                            className={cn(
                                "group-hover:text-purple-500 transition-colors duration-300"
                            )}
                        >
                            {highlightedTitle}
                        </TextHeading>
                        <Text 
                            variant="muted"
                            size="sm"
                            className="line-clamp-2"
                        >
                            {highlightedDescription}
                        </Text>
                        <StackHorizontal className="text-muted-foreground" gap="xs">
                            <Text variant="muted" size="xs">
                                {post.date}
                            </Text>
                            <Text variant="muted" size="xs">•</Text>
                            <Text variant="muted" size="xs">
                                {post.readingTime}
                            </Text>
                        </StackHorizontal>
                    </StackVertical>
                </article>
            </Link>
            {!isLast && (
                <hr className="border-gray-500/20 mt-3" />
            )}
        </div>
    )
} 

function highlightText(text: string, term?: string): ReactNode {
    if (!term) return text

    const cleanTerm = term.trim()
    if (!cleanTerm) return text

    const escapedTerm = cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(`(${escapedTerm})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) => {
        if (index % 2 === 1) {
            return (
                <span
                    key={`highlight-${index}`}
                    className="rounded-sm bg-purple-300/60 px-1 font-semibold text-purple-900 dark:bg-purple-500/50 dark:text-purple-50"
                >
                    {part}
                </span>
            )
        }

        return <span key={`text-${index}`}>{part}</span>
    })
}