import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import { Metadata } from "next"
import { AskBoard } from "../_components/AskBoard"
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter"
import { SectionPageHeader } from "@/components/layout/page-header/SectionPageHeader"
import { getQuestionById } from "@/lib/kv/ask"
import { notFound } from "next/navigation"

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
      title: `Anonymous Question`,
      description,
      type: 'article',
      // The Next.js opengraph-image.tsx will be used automatically
    },
    twitter: {
      card: 'summary_large_image',
      title: `Anonymous Question`,
      description,
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
      <StackVertical gap="lg">
        <SectionPageHeader
          title="Anonymous asking!"
          description="Ask anything about me. Every submission stays here so others can read through the anonymous archive. Now with threaded follow-up conversations!"
          currentLabel="Ask"
        />

        {/* We can highlight the specific question or just show the board */}
        <AskBoard initialQuestions={[question]} />
        
        <div className="flex justify-center py-4">
          <a 
            href="/ask" 
            className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            View all questions →
          </a>
        </div>
      </StackVertical>

      <IndividualPageFooter
        showParentPage={false}
        spacing="compact"
      />
    </BaseContainer>
  )
}
