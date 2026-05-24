import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import { Metadata } from "next"
import { DrawBoard } from "./_components/DrawBoard"
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter"
import { SectionPageHeader } from "@/components/layout/page-header/SectionPageHeader"

export const metadata: Metadata = {
  title: "Drawing prompts | mikeblocky.com",
  description: "Suggest drawing ideas, themes, or characters for my next illustration. Let's create something beautiful together!",
  openGraph: {
    images: [
      {
        url: '/apple-icon.png',
        width: 512,
        height: 512,
        alt: 'Creative palette for drawing suggestions.',
      },
    ],
  },
  twitter: {
    images: [
      {
        url: '/apple-icon.png',
        alt: 'Creative palette for drawing suggestions.',
      },
    ],
  },
}

export default function DrawPage() {
  return (
    <BaseContainer size="md" paddingX="md" paddingY="lg">
      <StackVertical gap="lg">
        <SectionPageHeader
          title="Drawing prompt suggestions!"
          description="Looking for creative ideas! Suggest a scene, character, concept, or setting you'd love to see drawn. Now supporting threaded follow-ups and discussion."
          currentLabel="Draw prompts"
        />

        <DrawBoard />
      </StackVertical>

      <IndividualPageFooter
        showParentPage={false}
        spacing="compact"
      />
    </BaseContainer>
  )
}
