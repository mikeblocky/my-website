import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import TextHeading from "@/components/ui/text-heading/text-heading"
import Text from "@/components/ui/text/text"
import { Metadata } from "next"
import { AskBoard } from "./_components/AskBoard"
import { Navbar } from "@/components/ui/navbar/Navbar"
import { ThemeToggle } from "@/components/ui/theme/theme-toggle"
import { SectionFooter } from "@/components/layout/footer/SectionFooter"
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter"

export const metadata: Metadata = {
  title: "Ask | mikeblocky.com",
  description: "Send an anonymous question and browse the community archive."
}

export default function AskPage() {
  return (
    <BaseContainer size="md" paddingX="md" paddingY="lg">
      <div className="mb-8 flex items-center justify-between">
        <Navbar />
        <ThemeToggle />
      </div>
      <StackVertical gap="lg">
        <header className="space-y-2">
          <TextHeading as="h1" weight="bold">
            Anonymous ask box
          </TextHeading>
          <Text variant="muted" size="sm">
            Ask anything about art, stories, learning, or life. I will keep every submission here so others can read through the anonymous archive.
          </Text>
        </header>

        <AskBoard />
      </StackVertical>

      
      <IndividualPageFooter
        showParentPage={false}
        spacing="compact"
      />
    </BaseContainer>
  )
}
