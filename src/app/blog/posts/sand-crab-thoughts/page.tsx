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

export default function MySelfReflectionFor2025() {
  return (
    <>
      <BaseContainer size="md" paddingX="md" paddingY="lg">
        <StackVertical gap="md">
          <div className="flex items-center justify-between">
            <DynamicBreadcrumb 
              items={[
                { href: '/', label: 'Home', emoji: '👾' },
                { href: '/blog', label: 'Blog' },
                { label: 'Thoughts of Shima - the sand and the crab' }
              ]}
            />
            <ThemeToggle />
          </div>

          <article>
            <TextHeading as="h1">Thoughts of Shima - the sand and the crab</TextHeading>
            <Text variant="muted" size="xs" className="mb-8">February 26, 2025 | 15 min read</Text>

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