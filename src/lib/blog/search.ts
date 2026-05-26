import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { blogPosts } from '@/app/blog/_data/posts'
import type { BlogPost } from '@/app/blog/_types/blog'

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

export function getSearchablePosts(): BlogPost[] {
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
