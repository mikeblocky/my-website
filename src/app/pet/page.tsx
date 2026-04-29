import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import { Metadata } from "next"
import { PetRoom } from "./_components/PetRoom"
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter"
import { SectionPageHeader } from "@/components/layout/page-header/SectionPageHeader"

export const metadata: Metadata = {
  title: "Pet annoy | mikeblocky.com",
  description: "Send a small pet gift to Mike via Discord.",
}

export default function PetPage() {
  return (
    <BaseContainer size="md" paddingX="md" paddingY="lg">
      <StackVertical gap="lg">
      <SectionPageHeader
        title="Pet annoy"
        description="Every click here sends a random animal GIF to my Discord. Use this to annoy me."
        currentLabel="Pet annoy"
      />

      <PetRoom />
      </StackVertical>

      <IndividualPageFooter
        showParentPage={false}
        spacing="compact"
      />
    </BaseContainer>
  )
}
