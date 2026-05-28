import BaseContainer from "@/components/layout/container/base-container"
import { Metadata } from "next"
import { getDrawingById } from "@/lib/kv/sketchbook"
import { notFound } from "next/navigation"
import { RedirectToBoard } from "@/components/ui/RedirectToBoard"
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter"

const SITE_URL = 'https://www.mikeblocky.com'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const drawing = await getDrawingById(id)

  if (!drawing) {
    return {
      title: "Drawing not found | Sketchbook",
    }
  }

  const description = drawing.body 
    ? `"${drawing.body.slice(0, 150)}${drawing.body.length > 150 ? '...' : ''}" — Drawing by ${drawing.author}`
    : `A beautiful sketch drawn by ${drawing.author} on the collaborative board.`

  const pageUrl = `/sketchbook/${id}`
  const imageUrl = `/sketchbook/${id}/opengraph-image`

  return {
    metadataBase: new URL(SITE_URL),
    title: `Drawing by ${drawing.author} | Sketchbook`,
    description,
    openGraph: {
      title: `Sketchbook drawing by ${drawing.author}`,
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
          alt: `Sketchbook drawing by ${drawing.author}`,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Sketchbook drawing by ${drawing.author}`,
      description,
      images: [
        {
          url: imageUrl,
          alt: `Sketchbook drawing by ${drawing.author}`,
        }
      ],
    },
  }
}

export default async function DrawingPage({ params }: PageProps) {
  const { id } = await params
  const drawing = await getDrawingById(id)

  if (!drawing) {
    notFound()
  }

  return (
    <BaseContainer size="md" paddingX="md" paddingY="lg">
      <RedirectToBoard id={id} type="sketchbook" />
      
      <IndividualPageFooter
        showParentPage={false}
        spacing="compact"
      />
    </BaseContainer>
  )
}
