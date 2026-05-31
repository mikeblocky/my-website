import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils/utils"
import Text from "@/components/ui/text/text"
import TextHeading from "@/components/ui/text-heading/text-heading"

interface SectionLinkItemProps {
    href: string
    title: string
    description?: string
    className?: string
}

export function SectionLinkItem({
    href,
    title,
    description,
    className
}: SectionLinkItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                "group block rounded-xl border border-border/50 bg-background/70 px-4 py-4 transition-all duration-200",
                "pride-outline-hover hover:bg-muted/30",
                className
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                    <TextHeading
                        as="h4"
                        weight="medium"
                        className="mb-0 mt-0 transition-colors duration-200 group-hover:pride-text"
                    >
                        {title}
                    </TextHeading>
                    {description ? (
                        <Text variant="muted" size="xs" className="leading-relaxed">
                            {description}
                        </Text>
                    ) : null}
                </div>
                <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:pride-text" />
            </div>
        </Link>
    )
}
