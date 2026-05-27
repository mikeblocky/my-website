import BaseContainer from "@/components/layout/container/base-container"
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter"
import { RedirectToBoard } from "@/components/ui/RedirectToBoard"
import { getSuggestionById } from "@/lib/kv/suggestions"
import { Metadata } from "next"
import { notFound } from "next/navigation"

const SITE_URL = 'https://www.mikeblocky.com'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const suggestion = await getSuggestionById(id)

  if (!suggestion) {
    return {
      title: "Suggestion not found | Media suggestions",
    }
  }

  const body = suggestion.note || suggestion.bestPart || suggestion.reference?.description || suggestion.title
  const description = `"${body.slice(0, 150)}${body.length > 150 ? '...' : ''}" - Suggested by ${suggestion.author || 'anonymous'}`
  const pageUrl = `/suggestions/${id}`
  const imageUrl = `/suggestions/${id}/opengraph-image`

  return {
    metadataBase: new URL(SITE_URL),
    title: `${suggestion.title} | Media suggestions`,
    description,
    openGraph: {
      title: suggestion.title,
      description,
      url: pageUrl,
      siteName: 'mikeblocky.com',
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          type: 'image/png',
          alt: suggestion.title,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: suggestion.title,
      description,
      images: [
        {
          url: imageUrl,
          alt: suggestion.title,
        }
      ],
    },
  }
}

export default async function SuggestionPage({ params }: PageProps) {
  const { id } = await params
  const suggestion = await getSuggestionById(id)

  if (!suggestion) {
    notFound()
  }

  return (
    <BaseContainer size="md" paddingX="md" paddingY="lg">
      <RedirectToBoard id={id} type="suggestion" />

      <IndividualPageFooter
        showParentPage={false}
        spacing="compact"
      />
    </BaseContainer>
  )
}
