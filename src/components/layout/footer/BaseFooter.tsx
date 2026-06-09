'use client'

import { cn } from '@/lib/utils/utils'
import { monoFont } from '@/styles/fonts/fonts'
import { Bird, GitFork, Mail } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

type FooterSpacing = 'default' | 'compact' | 'none'

interface BaseFooterProps {
    color?: string;
    navigationLinks?: React.ReactNode;
    className?: string;
    showToTop?: boolean;
    showSectionName?: boolean;
    showSocialLinks?: boolean;
    showCopyright?: boolean;
    spacing?: FooterSpacing;
}

export function BaseFooter({ 
    color = 'blue', 
    navigationLinks, 
    className,
    showToTop = true,
    showSectionName = true,
    showSocialLinks = true,
    showCopyright = true,
    spacing = 'default'
}: BaseFooterProps) {
    const socialLinks = [
        { href: "mailto:me@mikeblocky.com", icon: <Mail className="w-3 h-3 sm:w-4 sm:h-4" /> },
        { href: "https://github.com/mikeblocky", icon: <GitFork className="w-3 h-3 sm:w-4 sm:h-4" /> },
        { href: "https://x.com/mikeblocky", icon: <Bird className="w-3 h-3 sm:w-4 sm:h-4" /> }
    ]

    const paddingTopClass = spacing === 'compact' ? 'pt-6' : spacing === 'none' ? 'pt-0' : 'pt-12'
    const bottomSpacerClass = spacing === 'compact' ? 'h-4' : spacing === 'none' ? 'h-0' : 'h-8'

    return (
        <footer className={cn("relative mt-auto", paddingTopClass, className)}>
            {/* Gradient Line */}
            <div className="relative w-full mb-8">
                <div className={cn(
                    "absolute inset-0 w-full",
                    "h-[1px]",
                    "bg-gradient-to-r pride-gradient-line opacity-80",
                    color === 'blue' && [
                        "dark:opacity-90"
                    ],

                    color === 'green' && [
                        "dark:via-green-400/30"
                    ]
                )} />
            </div>

            <div className={cn(
                monoFont.className,
                "w-full max-w-screen-md mx-auto px-4",
                "flex flex-col items-center gap-4 sm:gap-6",
                "text-sm text-muted-foreground/60"
            )}>

                {/* Navigation Links - First Row */}
                {navigationLinks && (showToTop || showSectionName) && (
                    <div className="flex flex-wrap items-center justify-center gap-x-3">
                        {navigationLinks}
                    </div>
                )}

                {/* Social Links and Copyright - Second Row */}
                {(showSocialLinks || showCopyright) && (
                    <div className="flex items-center justify-center gap-6 sm:gap-8">
                        {/* Social Links */}
                        {showSocialLinks && (
                            <div className="flex items-center gap-6">
                                {socialLinks.map((link, index) => (
                                    <motion.div
                                        key={link.href}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ 
                                            duration: 0.2,
                                            delay: index * 0.1 
                                        }}
                                    >
                                        <Link
                                            href={link.href}
                                            target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                                            className={cn(
                                                "block pride-text",
                                                "transition-all duration-200",
                                                "-m-2 p-2",
                                                "hover:bg-pink-400/10 rounded-md",
                                                "hover:shadow-md hover:shadow-pink-500/5"
                                            )}
                                        >
                                            {link.icon}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Copyright */}
                        {showCopyright && (
                            <motion.span 
                                className="pride-text text-[10px] sm:text-xs"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                © {new Date().getFullYear()} mikeblocky.com
                            </motion.span>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom padding */}
            <div className={bottomSpacerClass} />
        </footer>
    )
} 
