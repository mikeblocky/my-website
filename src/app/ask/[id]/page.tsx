import BaseContainer from "@/components/layout/container/base-container"
import { Metadata } from "next"
import { getQuestionById } from "@/lib/kv/ask"
import { notFound } from "next/navigation"
import { RedirectToBoard } from "@/components/ui/RedirectToBoard"
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const question = await getQuestionById(id)

  if (!question) {
    return {
      title: "Question Not Found | Ask",
    }
  }

  const description = `"${question.body.slice(0, 150)}${question.body.length > 150 ? '...' : ''}" — Asked by ${question.author || 'anonymous'}`

  return {
    title: `Question from ${question.author || 'anonymous'} | Ask`,
    description,
    openGraph: {
      title: `Anonymous question`,
      description,
      type: 'article',
      images: [
        {
          url: `/ask/${id}/opengraph-image?t=${new Date(question.createdAt).getTime()}`,
          width: 1200,
          height: 630,
          alt: 'Anonymous question',
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Anonymous question`,
      description,
      images: [`/ask/${id}/opengraph-image?t=${new Date(question.createdAt).getTime()}`],
    },
  }
}

export default async function QuestionPage({ params }: PageProps) {
  const { id } = await params
  const question = await getQuestionById(id)

  if (!question) {
    notFound()
  }

  return (
    <BaseContainer size="md" paddingX="md" paddingY="lg">
      <RedirectToBoard id={id} type="question" />
      
      <IndividualPageFooter
        showParentPage={false}
        spacing="compact"
      />
    </BaseContainer>
  )
}
