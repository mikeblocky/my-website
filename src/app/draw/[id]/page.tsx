import BaseContainer from "@/components/layout/container/base-container"
import { Metadata } from "next"
import { getPromptById } from "@/lib/kv/draw"
import { notFound } from "next/navigation"
import { RedirectToBoard } from "@/components/ui/RedirectToBoard"
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const prompt = await getPromptById(id)

  if (!prompt) {
    return {
      title: "Prompt not found | Drawing prompts",
    }
  }

  const description = `"${prompt.body.slice(0, 150)}${prompt.body.length > 150 ? '...' : ''}" — Suggested by ${prompt.author || 'anonymous'}`

  return {
    title: `Prompt from ${prompt.author || 'anonymous'} | Drawing prompts`,
    description,
    openGraph: {
      title: `Drawing prompt suggestion`,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Drawing prompt suggestion`,
      description,
    },
  }
}

export default async function PromptPage({ params }: PageProps) {
  const { id } = await params
  const prompt = await getPromptById(id)

  if (!prompt) {
    notFound()
  }

  return (
    <BaseContainer size="md" paddingX="md" paddingY="lg">
      <RedirectToBoard id={id} type="prompt" />
      
      <IndividualPageFooter
        showParentPage={false}
        spacing="compact"
      />
    </BaseContainer>
  )
}
