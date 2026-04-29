import { notFound } from 'next/navigation'
import { buildSocialMetadata } from '@/lib/metadata/social'
import { DailyNoteMdxPage } from '../../_components/DailyNoteMdxPage'
import { getDayBySlug, days } from '../../_data/days'

type Params = Promise<{ slug: string }>
export const dynamicParams = false

export async function generateStaticParams() {
    return days.map((day) => ({
        slug: day.slug,
    }))
}

export async function generateMetadata({ params }: { params: Params }) {
    const { slug } = await params
    const day = getDayBySlug(slug)

    if (!day) {
        return {
            title: 'Diary note not found | mikeblocky.com'
        }
    }

    return buildSocialMetadata({
        title: `${day.title} | mikeblocky.com`,
        description: day.description,
        path: day.href,
        imagePath: '/diary/opengraph-image.png',
        twitterImagePath: '/diary/twitter-image.png',
        imageAlt: day.description,
        type: 'article',
        publishedTime: day.date.toISOString(),
    })
}

export default async function DiaryDayPage({
    params,
}: {
    params: Params
}) {
    const { slug } = await params
    const day = getDayBySlug(slug)

    if (!day) {
        notFound()
    }

    return <DailyNoteMdxPage title={day.title} slug={day.slug} />
}
