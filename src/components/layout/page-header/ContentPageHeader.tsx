import { StackVertical } from "@/components/layout/layout-stack/layout-stack"
import { DynamicBreadcrumb } from "@/components/ui/primitives/breadcrumb"
import { ThemeToggle } from "@/components/ui/theme/theme-toggle"
import TextHeading from "@/components/ui/text-heading/text-heading"
import { cn } from "@/lib/utils/utils"

type BreadcrumbItem = {
    href?: string
    label: string
    emoji?: string
}

interface ContentPageHeaderProps {
    title: string
    breadcrumbs: BreadcrumbItem[]
    children?: React.ReactNode
    className?: string
    titleClassName?: string
    showPrideBadge?: boolean
}

export function ContentPageHeader({
    title,
    breadcrumbs,
    children,
    className,
    titleClassName,
    showPrideBadge = false,
}: ContentPageHeaderProps) {
    return (
        <StackVertical gap="md" className={className}>
            <div className="flex items-center justify-between gap-4">
                <DynamicBreadcrumb items={breadcrumbs} />
                <ThemeToggle />
            </div>

            <div className="max-w-3xl space-y-2">
                {showPrideBadge && (
                    <span className="pride-badge px-2.5 py-1 text-[11px] font-medium">
                        <span className="pride-badge-dot" />
                        Happy Pride Month!
                    </span>
                )}
                <TextHeading as="h1" weight="bold" className={cn("mt-0", titleClassName)}>
                    {title}
                </TextHeading>
                {children}
            </div>
        </StackVertical>
    )
}
