'use client'

import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BlogCard } from "./BlogCard"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import Text from "@/components/ui/text/text"
import type { BlogPost } from "../_types/blog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils/utils"
import { sansFont, monoFont } from "@/styles/fonts/fonts"

interface BlogSearchPanelProps {
    posts: BlogPost[]
}

type SearchMatch = {
    lineNumber: number
    excerpt: string
}

type SearchableBlogPost = BlogPost & {
    searchMatches?: SearchMatch[]
}

const POSTS_PER_PAGE = 5
const BLOG_PAGE_STORAGE_KEY = 'blog-list-current-page'

export function BlogSearchPanel({ posts }: BlogSearchPanelProps) {
    const [query, setQuery] = useState("")
    const deferredQuery = useDeferredValue(query)
    const [isFocused, setIsFocused] = useState(false)
    const [selectedTheme, setSelectedTheme] = useState('All')
    const [currentPage, setCurrentPage] = useState(() => {
        if (typeof window === 'undefined') {
            return 1
        }

        const storedPage = window.sessionStorage.getItem(BLOG_PAGE_STORAGE_KEY)
        const parsedPage = storedPage ? Number.parseInt(storedPage, 10) : NaN

        return Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
    })
    const themes = useMemo(() => {
        const uniqueThemes = new Set(posts.flatMap((post) => post.themes ?? []))
        return ['All', ...Array.from(uniqueThemes)]
    }, [posts])

    const filteredPosts = useMemo<SearchableBlogPost[]>(() => {
        let result: SearchableBlogPost[] = posts.map((post) => ({ ...post }))

        // Theme filter
        if (selectedTheme !== 'All') {
            result = result.filter(post => post.themes?.includes(selectedTheme))
        }

        // Keyword filter
        const nextQuery = deferredQuery.trim().toLowerCase()
        if (nextQuery) {
            result = result.map((post) => {
                const themeString = post.themes?.join(" ") ?? ""
                const haystack = `${post.title} ${post.description ?? ""} ${themeString} ${post.searchText ?? ""}`.toLowerCase()

                if (!haystack.includes(nextQuery)) {
                    return {
                        ...post,
                        searchMatches: [],
                    }
                }

                const searchMatches = (post.searchLines ?? [])
                    .filter((line) => line.text.toLowerCase().includes(nextQuery))
                    .slice(0, 2)
                    .map((line) => ({
                        lineNumber: line.lineNumber,
                        excerpt: buildExcerpt(line.text, nextQuery),
                    }))

                return {
                    ...post,
                    searchMatches,
                }
            })
            .filter((post) => (post.searchMatches?.length ?? 0) > 0 || `${post.title} ${post.description ?? ""} ${post.themes?.join(" ") ?? ""}`.toLowerCase().includes(nextQuery))
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

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        window.sessionStorage.setItem(BLOG_PAGE_STORAGE_KEY, String(safeCurrentPage))
    }, [safeCurrentPage])

    return (
        <StackVertical gap="md">
            {/* Search Input */}
            <div className="w-full">
                <div
                    className="relative w-full overflow-hidden rounded-sm border border-slate-200/60 dark:border-slate-800/60 bg-background/40"
                >
                    <motion.div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-sm border border-[hsl(var(--pride-glow-val))]/80"
                        animate={{
                            opacity: isFocused ? 1 : 0,
                            scale: isFocused ? 1 : 0.985,
                        }}
                        transition={{ type: "spring", stiffness: 240, damping: 22 }}
                    />
                    <input
                        id="blog-search"
                        type="text"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value)
                            setCurrentPage(1)
                        }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Search titles, themes, or post content..."
                        className={cn(
                            sansFont.className,
                            "w-full bg-transparent px-4 py-3 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                        )}
                        aria-label="Search blog posts"
                        autoComplete="off"
                    />
                    <AnimatePresence>
                        {query ? (
                            <motion.button
                                type="button"
                                onClick={() => {
                                    setQuery("")
                                    setCurrentPage(1)
                                }}
                                initial={{ opacity: 0, x: 10, scale: 0.92 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 10, scale: 0.92 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-1 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 transition-colors"
                                aria-label="Clear search"
                            >
                                <X className="h-5 w-5" />
                            </motion.button>
                        ) : null}
                    </AnimatePresence>
                </div>
                
                {/* Theme Filter Tabs */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {themes.map(theme => (
                        <button
                            key={theme}
                            onClick={() => {
                                setSelectedTheme(theme)
                                setCurrentPage(1)
                            }}
                            className={cn(
                                monoFont.className,
                                "px-3 py-1.5 text-[10px] tracking-wider rounded-sm transition-all duration-150 border",
                                selectedTheme === theme
                                    ? "bg-[hsl(var(--pride-glow-val))]/10 text-[hsl(var(--pride-glow-val))] border-[hsl(var(--pride-glow-val))]/40"
                                    : "bg-transparent text-slate-500 border-slate-200 hover:border-slate-350 hover:text-slate-800 dark:text-slate-400 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:text-slate-200"
                            )}
                        >
                            {theme.toLowerCase()}
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
                                    searchMatches={post.searchMatches}
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
                            className="rounded-sm border border-slate-200/60 bg-slate-50/50 p-6 text-center dark:border-slate-800/60 dark:bg-slate-900/30 shadow-none"
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
                        className="p-2 rounded-sm text-slate-500 hover:bg-slate-100/60 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-slate-800/40 transition-colors"
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={cn(
                                    "w-7 h-7 rounded-sm text-xs font-semibold transition-colors",
                                    safeCurrentPage === i + 1
                                        ? "bg-[hsl(var(--pride-glow-val))]/15 border border-[hsl(var(--pride-glow-val))]/40 text-[hsl(var(--pride-glow-val))]"
                                        : "text-slate-500 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:bg-slate-800/40"
                                )}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={safeCurrentPage === totalPages}
                        className="p-2 rounded-sm text-slate-500 hover:bg-slate-100/60 disabled:opacity-50 disabled:hover:bg-transparent dark:text-slate-400 dark:hover:bg-slate-800/40 transition-colors"
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
            <span className="pride-text font-semibold">{term}</span>
            " just yet - try a different keyword or theme.
        </Text>
    )
}

function buildExcerpt(text: string, query: string) {
    const index = text.toLowerCase().indexOf(query)

    if (index === -1 || text.length <= 160) {
        return text
    }

    const start = Math.max(0, index - 55)
    const end = Math.min(text.length, index + query.length + 85)
    const prefix = start > 0 ? '... ' : ''
    const suffix = end < text.length ? ' ...' : ''

    return `${prefix}${text.slice(start, end).trim()}${suffix}`
}
