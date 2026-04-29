import { ReactNode } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils/utils"
import { sansFont, monoFont } from "@/styles/fonts/fonts"
import { StackVertical, StackHorizontal } from "@/components/layout/layout-stack/layout-stack"
import Text from "@/components/ui/text/text"
import TextHeading from "@/components/ui/text-heading/text-heading"
import { BlogPost } from "../_types/blog"

type BlogCardProps = {
    post: BlogPost
    isLast?: boolean
    searchTerm?: string
    searchMatches?: Array<{
        lineNumber: number
        excerpt: string
    }>
}

export function BlogCard({ post, isLast, searchTerm, searchMatches = [] }: BlogCardProps) {
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
                    <div className="flex flex-col">
                        <TextHeading 
                            as="h4" 
                            weight="medium" 
                            className={cn(
                                "group-hover:text-blue-500 transition-colors duration-300 mb-2 mt-0"
                            )}
                        >
                            {highlightedTitle}
                        </TextHeading>
                        <p 
                            className={cn(
                                sansFont.className,
                                "text-base text-muted-foreground line-clamp-2 mb-3"
                            )}
                        >
                            {highlightedDescription}
                        </p>
                        {searchTerm && searchMatches.length > 0 && (
                            <div className="mb-3 rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5">
                                <StackVertical gap="sm">
                                    {searchMatches.map((match) => (
                                        <div key={`${post.slug}-line-${match.lineNumber}`} className="space-y-1">
                                            <Text size="xs" weight="medium" className="text-blue-600 dark:text-blue-400">
                                                Line {match.lineNumber}
                                            </Text>
                                            <p className={cn(sansFont.className, "text-sm leading-6 text-muted-foreground")}>
                                                {highlightText(match.excerpt, searchTerm)}
                                            </p>
                                        </div>
                                    ))}
                                </StackVertical>
                            </div>
                        )}
                        <div className={cn(
                            monoFont.className,
                            "flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"
                        )}>
                            <span>{post.date}</span>
                            <span>•</span>
                            <span>{post.readingTime}</span>
                            {post.themes && post.themes.map((theme) => (
                                <div key={theme} className="flex items-center gap-2">
                                    <span>•</span>
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                                        {theme}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
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
                    className="rounded-sm bg-blue-300/60 px-1 font-semibold text-blue-900 dark:bg-blue-500/50 dark:text-blue-50"
                >
                    {part}
                </span>
            )
        }

        return <span key={`text-${index}`}>{part}</span>
    })
}
