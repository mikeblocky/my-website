import type { ReactNode } from 'react'
import BaseContainer from '@/components/layout/container/base-container'
import { SectionFooter } from '@/components/layout/footer/SectionFooter'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { SectionPageHeader } from '@/components/layout/page-header/SectionPageHeader'

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface SectionPageShellProps {
	children: ReactNode
	title: string
	description: string
	currentLabel: string
	containerSize?: ContainerSize
	contentGap?: StackGap
	footerColor?: string
	showToTop?: boolean
}

export function SectionPageShell({
	children,
	title,
	description,
	currentLabel,
	containerSize = 'lg',
	contentGap = 'lg',
	footerColor = 'blue',
	showToTop = false,
}: SectionPageShellProps) {
	return (
		<BaseContainer size={containerSize} paddingX="md" paddingY="lg">
			<StackVertical gap={contentGap}>
				<SectionPageHeader
					title={title}
					description={description}
					currentLabel={currentLabel}
				/>

				{children}
			</StackVertical>

			<SectionFooter color={footerColor} showToTop={showToTop} />
		</BaseContainer>
	)
}
