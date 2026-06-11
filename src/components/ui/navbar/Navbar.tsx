'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/utils'
import { monoFont } from '@/styles/fonts/fonts'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

import { useSpotifyCurrentlyPlaying } from '@/lib/spotify/use-spotify-currently-playing'

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
}

function NavLink({ href, children, onClick }: NavLinkProps) {
    return (
        <Link 
            href={href}
            onClick={onClick}
            className={cn(
                "block w-full",
                "pride-nav-link text-sm text-muted-foreground",
                "transition-colors duration-200",
                monoFont.className
            )}
        >
            {children}
        </Link>
    )
}

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { song: currentlyPlaying } = useSpotifyCurrentlyPlaying()
    const isSongPlaying = !!currentlyPlaying

    const links = [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
        { href: '/artworks', label: 'Gallery' },
        { href: '/zine', label: 'Zine' },
        { href: '/journal', label: 'Journal' },
        { href: '/friends', label: 'Friends' },
        { href: '/favorites', label: 'Favorites' },
        { href: '/interact', label: 'Interact' }
    ]

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isMenuOpen && !target.closest('.mobile-menu-container')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMenuOpen]);

    return (
        <nav className={cn(monoFont.className, "relative z-50")}>
            {/* Desktop Navigation - Static Links (Hidden if a song is playing to make space) */}
            {!isSongPlaying && (
                <div className="hidden sm:flex items-center gap-5">
                    {links.map((link) => (
                        <motion.div
                            key={link.href}
                            whileHover={{ y: -1 }}
                            transition={{ duration: 0.2 }}
                            className="relative after:absolute after:bottom-[-2px] after:left-0 after:h-[1px] after:w-0 after:pride-gradient-line after:transition-all after:duration-200 after:content-[''] hover:after:w-full"
                        >
                            <NavLink href={link.href}>
                                {link.label}
                            </NavLink>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Minimized Menu (Visible on desktop only when a song is playing; hidden on mobile) */}
            <div className={cn(
                "mobile-menu-container -ml-2",
                isSongPlaying ? "hidden sm:block" : "hidden"
            )}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMenuOpen(!isMenuOpen);
                    }}
                    className={cn(
                        "relative z-[60]",
                        "flex items-center justify-center gap-1.5 px-3 py-1.5",
                        "rounded-lg border border-transparent text-muted-foreground",
                        "transition-all duration-300 cursor-pointer select-none",
                        isMenuOpen && "border-pink-400/20 bg-pink-400/10 text-pink-500 dark:text-pink-300",
                        "hover:text-pink-500 dark:hover:text-pink-300"
                    )}
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                >
                    <motion.div
                        animate={{ rotate: isMenuOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center"
                    >
                        {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
                    </motion.div>
                    <span className="text-[11px] font-mono tracking-wider">Open menu</span>
                </button>

                <AnimatePresence>
                    {isMenuOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
                                onClick={() => setIsMenuOpen(false)}
                            />

                            {/* Menu Content */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ 
                                    duration: 0.2,
                                    ease: "easeOut"
                                }}
                                className={cn(
                                    "absolute top-12 left-2 z-[60]",
                                    "min-w-[200px] w-auto",
                                    "bg-white dark:bg-slate-900",
                                    "rounded-lg border-2 border-slate-200 dark:border-slate-800",
                                    "shadow-none",
                                    "overflow-hidden"
                                )}
                            >
                                <div className="py-2">
                                    {links.map((link, index) => (
                                        <motion.div
                                            key={link.href}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ 
                                                delay: index * 0.05,
                                                duration: 0.2
                                            }}
                                            className="w-full"
                                        >
                                            <Link
                                                href={link.href}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={cn(
                                                    monoFont.className,
                                                    "block px-4 py-2.5",
                                                    "text-sm text-muted-foreground hover:bg-pink-500/10 hover:text-pink-500 dark:hover:text-pink-300",
                                                    "transition-colors duration-200"
                                                )}
                                            >
                                                {link.label}
                                             </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    )
}
