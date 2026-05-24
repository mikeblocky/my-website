import BaseContainer from "@/components/layout/container/base-container"
import { Metadata } from "next"
import { getTalkById } from "@/lib/kv/talk"
import { notFound } from "next/navigation"
import { RedirectToBoard } from "@/components/ui/RedirectToBoard"
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter"

const SITE_URL = 'https://www.mikeblocky.com'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const talk = await getTalkById(id)

  if (!talk) {
    return {
      title: "Post Not Found | Talk",
    }
  }

  const description = `"${talk.body.slice(0, 150)}${talk.body.length > 150 ? '...' : ''}" — Shared by ${talk.author || 'anonymous'}`
  const imageUrl = `${SITE_URL}/talk/${id}/opengraph-image?t=${new Date(talk.createdAt).getTime()}`

  return {
    title: `Post from ${talk.author || 'anonymous'} | Talk`,
    description,
    openGraph: {
      title: `Talk board post`,
      description,
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: 'Talk board post',
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Talk board post`,
      description,
      images: [
        {
          url: imageUrl,
          alt: 'Talk board post',
        }
      ],
    },
  }
}

export default async function TalkTopicPage({ params }: PageProps) {
  const { id } = await params
  const talk = await getTalkById(id)

  if (!talk) {
    notFound()
  }

  return (
    <BaseContainer size="md" paddingX="md" paddingY="lg">
      <RedirectToBoard id={id} type="talk" />
      
      <IndividualPageFooter
        showParentPage={false}
        spacing="compact"
      />
    </BaseContainer>
  )
}
