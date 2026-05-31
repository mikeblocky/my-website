import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import { DynamicBreadcrumb } from "@/components/ui/primitives/breadcrumb"
import { ThemeToggle } from "@/components/ui/theme/theme-toggle"
import Text from "@/components/ui/text/text"
import TextHeading from "@/components/ui/text-heading/text-heading"
import { cn } from "@/lib/utils/utils"

interface SectionPageHeaderProps {
    title: string
    description: string
    currentLabel: string
    className?: string
    descriptionClassName?: string
    titleClassName?: string
}

export function SectionPageHeader({
    title,
    description,
    currentLabel,
    className,
    descriptionClassName,
    titleClassName
}: SectionPageHeaderProps) {
    return (
        <StackVertical gap="md" className={className}>
            <div className="flex items-center justify-between gap-4">
                <DynamicBreadcrumb
                    items={[
                        { href: "/", label: "Home", emoji: "🐶" },
                        { label: currentLabel }
                    ]}
                />
                <ThemeToggle />
            </div>

            <div className="max-w-2xl space-y-1.5">
                <span className="pride-badge px-2.5 py-1 text-[11px] font-medium">
                    <span className="pride-badge-dot" />
                    Happy Pride Month!
                </span>
                <TextHeading as="h1" weight="bold" className={cn("mt-0", titleClassName)}>
                    {title}
                </TextHeading>
                <Text variant="muted" size="sm" className={descriptionClassName}>
                    {description}
                </Text>
            </div>
        </StackVertical>
    )
}
