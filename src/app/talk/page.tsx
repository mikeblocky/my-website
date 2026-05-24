import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import { Metadata } from "next"
import { TalkBoard } from "./_components/TalkBoard"
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter"
import { SectionPageHeader } from "@/components/layout/page-header/SectionPageHeader"

const shareImage = '/talk/twitter-image.png'
const shareAlt = 'Hand-drawn illustration of two friends sharing messages on the Talk page.'

export const metadata: Metadata = {
  title: "Talk | mikeblocky.com",
  description: "Let's talk about anything! Give me reading/watching suggestions, ask questions, or share personal talk.",
  openGraph: {
    images: [
      {
        url: shareImage,
        width: 1200,
        height: 630,
        alt: shareAlt,
      },
    ],
  },
  twitter: {
    images: [
      {
        url: shareImage,
        alt: shareAlt,
      },
    ],
  },
}

export default function TalkPage() {
  return (
    <BaseContainer size="md" paddingX="md" paddingY="lg">
      <StackVertical gap="lg">
        <SectionPageHeader
          title="Let's talk!"
          description="Let's talk about anything! Share watching or reading suggestions, ask questions, recommendations, or just casual personal talk. Everything is collected here."
          currentLabel="Talk"
        />

        <TalkBoard />
      </StackVertical>

      <IndividualPageFooter
        showParentPage={false}
        spacing="compact"
      />
    </BaseContainer>
  )
}
