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
import { User, Palette, BookOpen, MessageSquare, ArrowRight, Users } from 'lucide-react'

interface PortalCardProps {
    href: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    colorClass: string;
    iconBgClass: string;
}

function PortalCard({ href, title, description, icon, colorClass, iconBgClass }: PortalCardProps) {
    return (
        <Link href={href} className="group block h-full">
            <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className={cn(
                    "flex flex-col h-full p-5 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100/70 dark:hover:bg-slate-900/90 transition-all duration-200 border-0",
                    colorClass
                )}
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className={cn("p-2 rounded-lg transition-colors duration-200", iconBgClass)}>
                        {icon}
                    </div>
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                        {title}
                    </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">
                    {description}
                </p>
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Explore section <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 duration-200" />
                </div>
            </motion.div>
        </Link>
    )
}

export function HeroSection() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative pb-8"
        >
            <div className="relative">
                <StackVertical gap="xs">
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-10 h-10 sm:w-12 sm:h-12"
                    >
                        <Image src="/icon.svg" alt="mikeblocky" width={48} height={48} className="h-full w-full" priority />
                    </motion.div>
 
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <TextHeading as="h1" className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
                            mikeblocky.com
                        </TextHeading>
                    </motion.div>
 
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                    >
                        <Text>
                            Hi, I'm Mike. I'm a Vietnamese artist and a Japanese student, living between drawings and long, wandering thoughts. This website is my small, personal corner of the internet—a slow space where I archive my illustrations, write down reflections, and slowly try to connect.
                        </Text>
                        
                        <Text>
                            Below you can find portals to explore the different sections of my digital archive.
                        </Text>
 
                        {/* Flat Grid Portal Cards - borderless layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <PortalCard 
                                href="/about"
                                title="About me"
                                description="Read my full personal story, study journey from Computer Science to Japanese literature, and favorite inspirations."
                                icon={<User className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                                colorClass=""
                                iconBgClass="bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                            />
                            <PortalCard 
                                href="/artworks"
                                title="Gallery"
                                description="Browse collections of my quiet, soft illustrations, and view the theme distribution stats."
                                icon={<Palette className="w-5 h-5 text-violet-600 dark:text-violet-400" />}
                                colorClass=""
                                iconBgClass="bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400"
                            />
                            <PortalCard 
                                href="/journal"
                                title="Journal"
                                description="Explore deep essays, daily gratitude logs, and details on my journaling tools and utensils."
                                icon={<BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                                colorClass=""
                                iconBgClass="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                            />
                            <PortalCard 
                                href="/interact"
                                title="Interact"
                                description="Leave a note in the guestbook or suggest new drawing prompts for my next sketch."
                                icon={<MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                                colorClass=""
                                iconBgClass="bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                            />
                        </div>
 
                        {/* Full Width Friends Card */}
                        <div className="pt-2">
                            <PortalCard 
                                href="/friends"
                                title="Friends"
                                description="Explore my social circle—mutual connections, close friends, and creative developers I've built bonds with."
                                icon={<Users className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                                colorClass=""
                                iconBgClass="bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400"
                            />
                        </div>
                    </motion.div>
                </StackVertical>
            </div>
 
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 -mb-8"
            >
                <div className="relative w-full aspect-[4/3] sm:aspect-[2/1] md:aspect-[21/9] rounded-lg overflow-hidden border-0">
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
