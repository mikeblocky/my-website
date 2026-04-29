import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import { Metadata } from "next"
import { AskBoard } from "./_components/AskBoard"
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter"
import { SectionPageHeader } from "@/components/layout/page-header/SectionPageHeader"

const shareImage = '/ask/twitter-image.png'
const shareAlt = 'Hand-drawn illustration of two friends sharing questions for the Ask page.'

export const metadata: Metadata = {
  title: "Ask | mikeblocky.com",
  description: "Send an anonymous question and browse the community archive.",
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

export default function AskPage() {
  return (
    <BaseContainer size="md" paddingX="md" paddingY="lg">
      <StackVertical gap="lg">
        <SectionPageHeader
          title="Anonymous asking!"
          description="Ask anything about me. Every submission stays here so others can read through the anonymous archive."
          currentLabel="Ask"
        />

        <AskBoard />
      </StackVertical>

      
      <IndividualPageFooter
        showParentPage={false}
        spacing="compact"
      />
    </BaseContainer>
  )
}

