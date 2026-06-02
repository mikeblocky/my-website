import { NextRequest, NextResponse } from 'next/server'
import { blogPosts } from '@/app/blog/_data/posts'
import { getRedisClient } from '@/lib/kv/client'

export const dynamic = 'force-dynamic'

function getReadCountKey(slug: string) {
    return `blog:read-count:${slug}`
}

function isKnownSlug(slug: string) {
    return blogPosts.some((post) => post.slug === slug)
}

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get('slug')

    if (!slug || !isKnownSlug(slug)) {
        return NextResponse.json({ error: 'Invalid blog post slug.' }, { status: 400 })
    }

    const redis = await getRedisClient()
    const count = Number(await redis.get(getReadCountKey(slug)) ?? 0)

    return NextResponse.json(
        { count },
        {
            headers: {
                'Cache-Control': 'no-store, must-revalidate',
            },
        }
    )
}

export async function POST(request: NextRequest) {
    const data = await request.json().catch(() => null)
    const slug = typeof data?.slug === 'string' ? data.slug : ''

    if (!slug || !isKnownSlug(slug)) {
        return NextResponse.json({ error: 'Invalid blog post slug.' }, { status: 400 })
    }

    const redis = await getRedisClient()
    const count = await redis.incr(getReadCountKey(slug))

    return NextResponse.json(
        { count },
        {
            headers: {
                'Cache-Control': 'no-store, must-revalidate',
            },
        }
    )
}
