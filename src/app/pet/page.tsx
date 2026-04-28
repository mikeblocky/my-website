import BaseContainer from "@/components/layout/container/base-container"
import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import TextHeading from "@/components/ui/text-heading/text-heading"
import Text from "@/components/ui/text/text"
import { Metadata } from "next"
import { PetRoom } from "./_components/PetRoom"
import { DynamicBreadcrumb } from "@/components/ui/primitives/breadcrumb"
import { ThemeToggle } from "@/components/ui/theme/theme-toggle"
import { IndividualPageFooter } from "@/components/layout/footer/IndividualPageFooter"

export const metadata: Metadata = {
  title: "Pet Room | mikeblocky.com",
  description: "Send a small pet gift to Mike via Discord.",
}

export default function PetPage() {
  return (
    <BaseContainer size="md" paddingX="md" paddingY="lg">
      <div className="mb-8 flex items-center justify-between">
        <DynamicBreadcrumb 
            items={[
                { href: '/', label: 'Home', emoji: '🐶' },
                { label: 'Pet annoy' }
            ]}
        />
        <ThemeToggle />
      </div>
      <StackVertical gap="lg">
        <header className="space-y-3">
          <TextHeading as="h1" weight="bold">
            Pet annoy 🐾
          </TextHeading>
          <Text variant="muted" size="sm" className="leading-relaxed">
            Every visit and every click here sends a random animal GIF to my Discord. Use this to annoy me.
          </Text>
        </header>

        <PetRoom />
      </StackVertical>

      <IndividualPageFooter
        showParentPage={false}
        spacing="compact"
      />
    </BaseContainer>
  )
}
