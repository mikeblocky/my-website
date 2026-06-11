'use client'

import { motion } from 'framer-motion'
import { monoFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import Link from 'next/link'
import Image from 'next/image'
import imageCover from '../../../../public/image-cover.png'
import { User, Palette, BookOpen, MessageSquare, ArrowRight, Users, Book, Heart } from 'lucide-react'

export function HeroSection() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative pb-8"
        >
            <div className="relative">
                <StackVertical gap="xs">
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="pride-icon-glow w-10 h-10 sm:w-12 sm:h-12"
                    >
                        <Image src="/icon.svg" alt="mikeblocky" width={48} height={48} className="h-full w-full" priority />
                    </motion.div>
 
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="relative"
                    >
                        <TextHeading as="h1" className="font-bold text-slate-900 dark:text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                            mikeblocky.com
                        </TextHeading>
                    </motion.div>
 
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.22, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-4"
                    >
                        <Text>
                            Hi, I'm Mike. I'm a Vietnamese artist and a Japanese student, living between drawings and long, wandering thoughts. This website is my small, personal corner of the internet—a slow space where I archive my illustrations, write down reflections, and slowly try to connect.
                        </Text>

                        {/* Typographic Archive Portals List */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-900/50 pt-6">
                            {[
                                {
                                    href: "/about",
                                    label: "About me",
                                    desc: "personal story, studies & inspirations",
                                    icon: <User className="w-4 h-4 text-muted-foreground/70 group-hover:pride-text transition-colors duration-200" strokeWidth={1.5} />
                                },
                                {
                                    href: "/artworks",
                                    label: "Gallery",
                                    desc: "collections of illustrations & stats",
                                    icon: <Palette className="w-4 h-4 text-muted-foreground/70 group-hover:pride-text transition-colors duration-200" strokeWidth={1.5} />
                                },
                                {
                                    href: "/zine",
                                    label: "Zine",
                                    desc: "collected works as page-turning books",
                                    icon: <Book className="w-4 h-4 text-muted-foreground/70 group-hover:pride-text transition-colors duration-200" strokeWidth={1.5} />
                                },
                                {
                                    href: "/journal",
                                    label: "Journal",
                                    desc: "essays, daily logs & journaling tools",
                                    icon: <BookOpen className="w-4 h-4 text-muted-foreground/70 group-hover:pride-text transition-colors duration-200" strokeWidth={1.5} />
                                },
                                {
                                    href: "/friends",
                                    label: "Friends",
                                    desc: "mutual connections & creative links",
                                    icon: <Users className="w-4 h-4 text-muted-foreground/70 group-hover:pride-text transition-colors duration-200" strokeWidth={1.5} />
                                },
                                {
                                    href: "/favorites",
                                    label: "Favorites",
                                    desc: "favorite manga, anime, games & music",
                                    icon: <Heart className="w-4 h-4 text-muted-foreground/70 group-hover:pride-text transition-colors duration-200" strokeWidth={1.5} />
                                },
                                {
                                    href: "/interact",
                                    label: "Interact",
                                    desc: "guestbook & drawing prompt suggests",
                                    icon: <MessageSquare className="w-4 h-4 text-muted-foreground/70 group-hover:pride-text transition-colors duration-200" strokeWidth={1.5} />
                                }
                            ].map((portal) => (
                                <Link 
                                    key={portal.href} 
                                    href={portal.href}
                                    className="group flex items-center justify-between py-3.5 transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center border border-slate-100 dark:border-slate-900/50 group-hover:border-pink-500/20 dark:group-hover:border-pink-500/10 transition-colors duration-300">
                                            {portal.icon}
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 min-w-0">
                                            <span className={cn(
                                                monoFont.className,
                                                "text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-200 group-hover:pride-text transition-colors duration-200"
                                            )}>
                                                {portal.label}
                                            </span>
                                            <span className="hidden sm:inline text-slate-300 dark:text-slate-800">—</span>
                                            <span className="text-xs text-muted-foreground truncate group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors duration-200">
                                                {portal.desc}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground/50 transition-[transform,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:pride-text" strokeWidth={1.5} />
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </StackVertical>
            </div>
 
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 -mb-8"
            >
                <div className="relative w-full aspect-[4/3] sm:aspect-[2/1] md:aspect-[21/9] rounded-lg overflow-hidden border-0">
                    <div className="pride-gradient-line absolute inset-x-0 top-0 z-10 h-1 opacity-70" />
                    <Image
                        className="object-cover"
                        fill
                        src={imageCover}
                        alt="A drawing of Shima and Mitsumi from January 2025, featuring a quiet sky and soft colors."
                        priority
                        placeholder="blur"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                    />
                </div>
            </motion.div>
        </motion.div>
    )
}
