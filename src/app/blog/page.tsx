import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import { blogPosts } from "./_data/posts"
import { SectionFooter } from "@/components/layout/footer/SectionFooter"
import { Metadata } from "next"
import { BlogSearchPanel } from "./_components/BlogSearchPanel"
import { BlogHeader } from "./_components/BlogHeader"
import type { BlogPost } from "./_types/blog"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

export const metadata: Metadata = {
    title: 'Blog | mikeblocky.com',
    description: 'thoughts on machine learning, math, technology, and my journey',
}

function stripMdx(source: string) {
    return source
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/`[^`]*`/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/<[^>]+>/g, ' ')
        .replace(/[#>*_~|-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function stripMdxLine(line: string) {
    return line
        .replace(/`[^`]*`/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/<[^>]+>/g, ' ')
        .replace(/[#>*_~|-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function getSearchablePosts(): BlogPost[] {
    return blogPosts.map((post) => {
        const contentPath = path.join(process.cwd(), 'src', 'app', 'blog', 'posts', post.slug, 'content.mdx')
        const source = existsSync(contentPath)
            ? readFileSync(contentPath, 'utf8')
            : ''
        const content = source ? stripMdx(source) : ''
        const searchLines = source
            ? source
                .split(/\r?\n/)
                .map((line, index) => ({
                    lineNumber: index + 1,
                    text: stripMdxLine(line),
                }))
                .filter((line) => line.text.length > 0)
            : []

        return {
            ...post,
            searchText: content,
            searchLines,
        }
    })
}

export default function BlogListing() {
    const searchablePosts = getSearchablePosts()

    return (
        <BaseContainer size="md" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                <BlogHeader />
                <BlogSearchPanel posts={searchablePosts} />
            </StackVertical>
            <SectionFooter showToTop={false} />
        </BaseContainer>
    )
}
