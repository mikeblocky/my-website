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

export default function TakamatsuJan13thSpace() {
  return (
    <>
      <BaseContainer size="md" paddingX="md" paddingY="lg">
        <StackVertical gap="md">
          <div className="flex items-center justify-between">
            <DynamicBreadcrumb 
              items={[
                { href: '/', label: 'Home', emoji: '🐶' },
                { href: '/blog', label: 'Blog' },
                { label: 'Takamatsu-sensei\'s January 13th space - translation | mikeblocky.com' }
              ]}
            />
            <ThemeToggle />
          </div>

          <article>
            <TextHeading as="h1">Takamatsu-sensei's January 13th space - translation</TextHeading>
            <div className="flex items-center gap-2 flex-wrap mb-8"><span className="text-[14px] sm:text-[15px] text-muted-foreground dark:text-gray-400">November 13th, 2025 | 45 min read</span><span className="text-muted-foreground/30">•</span><span className="text-[14px] text-blue-600 dark:text-blue-400 font-medium">Translation</span></div>

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

