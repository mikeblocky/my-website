import Content from './content.mdx'
import { mdxComponents } from '@/lib/mdx/mdx-components'
import BaseContainer from '@/components/layout/container/base-container'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { DynamicBreadcrumb } from '@/components/ui/primitives/breadcrumb'
import { ThemeToggle } from '@/components/ui/theme/theme-toggle'
import { IndividualPageFooter } from '@/components/layout/footer/IndividualPageFooter'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'I have my words, and time is ticking | mikeblocky.com',
    description: 'The answer is not found in words but in the endurance of a feeling that has no choice but to exist.',
}

export default function KemutaiHanashiFic() {
  return (
    <>
      <BaseContainer size="md" paddingX="md" paddingY="lg">
        <StackVertical gap="md">
          <div className="flex items-center justify-between">
            <DynamicBreadcrumb 
              items={[
                { href: '/', label: 'Home', emoji: '👾' },
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
                    <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Kemutai Hanashi</span>
                    <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Fanfiction</span>
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
