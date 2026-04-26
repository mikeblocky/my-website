import { Metadata } from 'next'
import BaseContainer from '@/components/layout/container/base-container'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { DynamicBreadcrumb } from '@/components/ui/primitives/breadcrumb'
import { ThemeToggle } from '@/components/ui/theme/theme-toggle'
import { SectionFooter } from '@/components/layout/footer/SectionFooter'

export const metadata: Metadata = {
    title: 'Friends | mikeblocky.com',
    description: 'A list of friends and connections',
}

export default function FriendsList() {
    return (
        <BaseContainer size="md" paddingX="md" paddingY="lg">
            <StackVertical gap="md">
                <div className="flex items-center justify-between">
                    <DynamicBreadcrumb 
                        items={[
                            { href: '/', label: 'Home', emoji: '👾' },
                            { label: 'Friend list' }
                        ]}
                    />
                    <ThemeToggle />
                </div>

                <div>
                    <TextHeading as="h1" weight="bold">
                        Friend list
                    </TextHeading>
                    <Text variant="muted" className="mb-8">
                        The people I follow and connect with. Maybe one day I'll be more than just an artist on a screen.
                    </Text>

                    <StackVertical gap="md" className="mt-8">
                        <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-medium bg-purple-500/10 w-fit px-3 py-1.5 rounded-full mb-2">
                            <span>Started: April 26th, 2026</span>
                        </div>

                        <div className="rounded-xl border border-purple-500/30 bg-[#f2f5ff] dark:bg-[#2a1f3f] dark:border-purple-500/40 p-8 text-center">
                            <Text variant="muted">
                                List is currently empty. Progressing...
                            </Text>
                        </div>
                    </StackVertical>
                </div>
            </StackVertical>
            <SectionFooter showToTop={false} />
        </BaseContainer>
    )
}
