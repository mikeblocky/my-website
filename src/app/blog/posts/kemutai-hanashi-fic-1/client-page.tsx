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

export default function KemutaiHanashiFicContent() {
  return (
    <>
      <BaseContainer size="md" paddingX="md" paddingY="lg">
        <StackVertical gap="md">
          <div className="flex items-center justify-between">
            <DynamicBreadcrumb 
              items={[
                { href: '/', label: 'Home', emoji: '🐶' },
                { href: '/blog', label: 'Blog' },
                { label: 'I have my words, and time is ticking' }
              ]}
            />
            <ThemeToggle />
          </div>

          <article>
            <div className="mb-8">
                <TextHeading as="h1" className="mb-2">I have my words, and time is ticking</TextHeading>
                <div className="flex items-center gap-2 flex-wrap">
                    <Text variant="muted" size="xs">April 26th, 2026 | 15 min read</Text>
                    <span className="text-[14px] text-purple-600 dark:text-purple-400 font-medium">Kemutai Hanashi</span>
                    <span className="text-muted-foreground/30">•</span>
                    <span className="text-[14px] text-purple-600 dark:text-purple-400 font-medium">Fanfiction</span>
                </div>
            </div>

            <div className="prose dark:prose-invert max-w-none prose-p:italic prose-p:text-slate-700 dark:prose-p:text-slate-300">
              <Content components={mdxComponents} />
            </div>
          </article>
        </StackVertical>
      </BaseContainer>

      <IndividualPageFooter parentPageName='Blog' />
    </>
  )
}

