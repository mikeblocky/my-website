'use client'

import { useDeferredValue, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BlogCard } from "./BlogCard"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import Text from "@/components/ui/text/text"
import type { BlogPost } from "../_types/blog"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface BlogSearchPanelProps {
    posts: BlogPost[]
}

const THEMES = ['All', 'Skip and Loafer', 'Kemutai Hanashi', 'Hoshiai no Sora', 'Fanfiction', 'Translation', 'Personal']
const POSTS_PER_PAGE = 5

export function BlogSearchPanel({ posts }: BlogSearchPanelProps) {
    const [query, setQuery] = useState("")
    const deferredQuery = useDeferredValue(query)
    const [selectedTheme, setSelectedTheme] = useState('All')
    const [currentPage, setCurrentPage] = useState(1)

    const filteredPosts = useMemo(() => {
        let result = posts

        // Theme filter
        if (selectedTheme !== 'All') {
            result = result.filter(post => post.themes?.includes(selectedTheme))
        }

        // Keyword filter
        const nextQuery = deferredQuery.trim().toLowerCase()
        if (nextQuery) {
            result = result.filter((post) => {
                const themeString = post.themes?.join(" ") ?? ""
                const haystack = `${post.title} ${post.description ?? ""} ${themeString}`.toLowerCase()
                return haystack.includes(nextQuery)
            })
        }

        return result
    }, [posts, deferredQuery, selectedTheme])

    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
    const safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1))
    const paginatedPosts = filteredPosts.slice(
        (safeCurrentPage - 1) * POSTS_PER_PAGE,
        safeCurrentPage * POSTS_PER_PAGE
    )

    const trimmedQuery = deferredQuery.trim()
    const isSearching = Boolean(trimmedQuery)

    return (
        <StackVertical gap="md">
            {/* Search Input */}
            <div className="w-full">
                <motion.div
                    className="relative w-full overflow-hidden rounded-xl border border-blue-500/30 bg-transparent transition-colors dark:border-blue-500/40 dark:bg-transparent"
                    animate={{ boxShadow: isSearching ? "0 0 0 1.5px rgba(59, 130, 246, 0.25)" : "0 0 0 1px rgba(148, 163, 184, 0.2)" }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                >
                    <motion.input
                        id="blog-search"
                        type="search"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value)
                            setCurrentPage(1)
                        }}
                        placeholder="Search by title, theme, or keyword..."
                        className="w-full bg-transparent px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:outline-none dark:text-slate-100 dark:placeholder:text-blue-200"
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                        aria-label="Search blog posts"
                        autoComplete="off"
                    />
                    <motion.div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"
                        animate={{ opacity: isSearching ? 0.8 : 0.2 }}
                        transition={{ duration: 0.4 }}
                    />
                </motion.div>
                
                {/* Theme Filter Tabs */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {THEMES.map(theme => (
                        <button
                            key={theme}
                            onClick={() => {
                                setSelectedTheme(theme)
                                setCurrentPage(1)
                            }}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 border ${
                                selectedTheme === theme
                                    ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20'
                                    : 'bg-transparent text-slate-600 border-slate-300 hover:border-blue-300 hover:text-blue-600 dark:text-slate-400 dark:border-slate-700 dark:hover:border-blue-500/50 dark:hover:text-blue-300'
                            }`}
                        >
                            {theme}
                        </button>
                    ))}
                </div>

                <span className="mt-4 inline-block text-xs font-medium text-muted-foreground">
                    {isSearching || selectedTheme !== 'All'
                        ? `Showing ${filteredPosts.length} result${filteredPosts.length === 1 ? "" : "s"} for your filters.`
                        : `Showing all ${posts.length} posts.`}
                </span>
            </div>

            {/* Posts List */}
            <StackVertical gap="none">
                <AnimatePresence mode="popLayout" initial={false}>
                    {paginatedPosts.length > 0 ? (
                        paginatedPosts.map((post, index) => (
                            <motion.div
                                key={post.slug}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.25, delay: index * 0.03 }}
                            >
                                <BlogCard
                                    post={post}
                                    isLast={index === paginatedPosts.length - 1}
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
                            className="rounded-lg border border-blue-300/30 bg-blue-50/50 p-6 text-center dark:border-blue-500/30 dark:bg-blue-900/20"
                        >
                            <TextHeadingMessage term={trimmedQuery || selectedTheme} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </StackVertical>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={safeCurrentPage === 1}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                    safeCurrentPage === i + 1
                                        ? 'bg-blue-500 text-white'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={safeCurrentPage === totalPages}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Next page"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </StackVertical>
    )
}

function TextHeadingMessage({ term }: { term: string }) {
    return (
        <Text variant="muted" size="sm">
            No stories match "
            <span className="text-blue-700 dark:text-blue-200">{term}</span>
            " just yet - try a different keyword or theme.
        </Text>
    )
}
