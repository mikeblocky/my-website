'use client'

import Content from './content.mdx'
import { mdxComponents } from '@/lib/mdx/mdx-components'
import BaseContainer from '@/components/layout/container/base-container'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { DynamicBreadcrumb } from '@/components/ui/primitives/breadcrumb'
import { ThemeToggle } from '@/components/ui/theme/theme-toggle'
import { IndividualPageFooter } from '@/components/layout/footer/IndividualPageFooter'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'

export default function TakamatsuInterviewSpace1() {
  return (
    <>
      <BaseContainer size="md" paddingX="md" paddingY="lg">
        <StackVertical gap="md">
          <div className="flex items-center justify-between">
            <DynamicBreadcrumb 
              items={[
                { href: '/', label: 'Home', emoji: '🐶' },
                { href: '/blog', label: 'Blog' },
                { label: 'Autograph session of Takamatsu-sensei in Taiwan - translation' }
              ]}
            />
            <ThemeToggle />
          </div>

          <article>
            <TextHeading as="h1">Autograph session of Takamatsu-sensei in Taiwan - translation</TextHeading>
            <div className="flex items-center gap-2 flex-wrap mb-8"><Text variant="muted" size="xs">February 26th, 2025 | 20 min read</Text><span className="text-muted-foreground/30">•</span><span className="text-[14px] text-purple-600 dark:text-purple-400 font-medium">Skip and Loafer</span></div>

            <div className="prose dark:prose-invert max-w-none">
              <Content components={mdxComponents} />
            </div>
          </article>
        </StackVertical>
      </BaseContainer>

      <IndividualPageFooter parentPageName='Blog' />
    </>
  )
}

