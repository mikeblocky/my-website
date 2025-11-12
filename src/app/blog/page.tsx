import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import { blogPosts } from "./_data/posts"
import { SectionFooter } from "@/components/layout/footer/SectionFooter"
import { Metadata } from "next"
import { BlogSearchPanel } from "./_components/BlogSearchPanel"
import { BlogHeader } from "./_components/BlogHeader"

export const metadata: Metadata = {
    title: 'Blog | mikeblocky.com',
    description: 'thoughts on machine learning, math, technology, and my journey',
}

export default function BlogListing() {
    return (
        <BaseContainer size="md" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                <BlogHeader />
                <BlogSearchPanel posts={blogPosts} />
            </StackVertical>
            <SectionFooter showToTop={false} />
        </BaseContainer>
    )
}