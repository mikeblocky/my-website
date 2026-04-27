'use client'

import { BaseFooter } from './BaseFooter'
import { FooterLink } from './_components/FooterLink'
import { FooterDivider } from './_components/FooterDivider'

interface SectionFooterProps {
    color?: string;
    showToTop?: boolean;
    showHomePage?: boolean;
    showSocialLinks?: boolean;
    showCopyright?: boolean;
    spacing?: 'default' | 'compact' | 'none';
    className?: string;
}

export function SectionFooter({ 
    color = 'blue',
    showToTop = true,
    showHomePage = true,
    showSocialLinks = true,
    showCopyright = true,
    spacing = 'default',
    className
}: SectionFooterProps) {
    const navigationLinks = (
        <>
            {showToTop && (
                <>
                    <FooterLink href="#top" color={color}>To the top</FooterLink>
                    {showHomePage && <FooterDivider color={color} />}
                </>
            )}
            {showHomePage && (
                <FooterLink href="/" color={color}>Homepage</FooterLink>
            )}
        </>
    )

    return (
        <BaseFooter 
            color={color}
            navigationLinks={navigationLinks}
            className={className ?? "mt-6"}
            showToTop={showToTop}
            showSocialLinks={showSocialLinks}
            showCopyright={showCopyright}
            spacing={spacing}
        />
    )
}