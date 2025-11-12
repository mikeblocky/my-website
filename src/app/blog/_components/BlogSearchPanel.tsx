'use client'

import { useDeferredValue, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BlogCard } from "./BlogCard"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import Text from "@/components/ui/text/text"
import type { BlogPost } from "../_types/blog"

interface BlogSearchPanelProps {
    posts: BlogPost[]
}

export function BlogSearchPanel({ posts }: BlogSearchPanelProps) {
    const [query, setQuery] = useState("")
    const deferredQuery = useDeferredValue(query)

    const filteredPosts = useMemo(() => {
        const nextQuery = deferredQuery.trim().toLowerCase()
        if (!nextQuery) {
            return posts
        }

        return posts.filter((post) => {
            const haystack = `${post.title} ${post.description ?? ""}`.toLowerCase()
            return haystack.includes(nextQuery)
        })
    }, [posts, deferredQuery])

    const trimmedQuery = deferredQuery.trim()
    const isSearching = Boolean(trimmedQuery)

    return (
        <StackVertical gap="md">
            <div className="w-full">
                <motion.div
                    className="relative w-full overflow-hidden rounded-xl border border-purple-500/30 bg-[#f2f5ff] transition-colors dark:border-purple-500/40 dark:bg-[#2a1f3f]"
                    animate={{ boxShadow: isSearching ? "0 0 0 1.5px rgba(168, 85, 247, 0.25)" : "0 0 0 1px rgba(148, 163, 184, 0.2)" }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                >
                    <motion.input
                        id="blog-search"
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search by title, theme, or keyword..."
                        className="w-full bg-transparent px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:outline-none dark:text-slate-100 dark:placeholder:text-purple-200"
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                        aria-label="Search blog posts"
                        autoComplete="off"
                    />
                    <motion.div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/60 to-transparent"
                        animate={{ opacity: isSearching ? 0.8 : 0.2 }}
                        transition={{ duration: 0.4 }}
                    />
                </motion.div>
                <span className="mt-2 inline-block text-xs font-medium text-muted-foreground">
                    {isSearching
                        ? `Showing ${filteredPosts.length} result${filteredPosts.length === 1 ? "" : "s"} for "${trimmedQuery}".`
                        : `Showing all ${posts.length} posts.`}
                </span>
            </div>

            <StackVertical gap="none">
                <AnimatePresence mode="popLayout" initial={false}>
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post, index) => (
                            <motion.div
                                key={post.slug}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.25, delay: index * 0.03 }}
                            >
                                <BlogCard
                                    post={post}
                                    isLast={index === filteredPosts.length - 1}
                                    searchTerm={trimmedQuery}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            key="no-results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="rounded-lg border border-purple-300/30 bg-purple-50/50 p-6 text-center dark:border-purple-500/30 dark:bg-purple-900/20"
                        >
                            <TextHeadingMessage term={trimmedQuery} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </StackVertical>
        </StackVertical>
    )
}

function TextHeadingMessage({ term }: { term: string }) {
    return (
        <Text variant="muted" size="sm">
            No stories match "
            <span className="text-purple-700 dark:text-purple-200">{term}</span>
            " just yet - try a different keyword.
        </Text>
    )
}
