'use client'

import { motion } from 'framer-motion'
import { monoFont } from '@/styles/fonts/fonts'
import { cn } from '@/lib/utils/utils'
import TextHeading from '@/components/ui/text-heading/text-heading'
import Text from '@/components/ui/text/text'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import Link from 'next/link'
import Image from 'next/image'
import Ruler from '@/components/ui/ruler/ruler'
import { List, ListItem } from '@/components/ui/list/list'

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
                        animate={{ 
                            y: [0, -10, 0],
                        }}
                        transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className={cn("text-2xl sm:text-3xl md:text-4xl", monoFont.className)}
                    >
                        👾
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
                    >
                        <Text >
                            Hi everyone! I'm Mike in Mikeblocky!
                        </Text>

                        <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Text>
                               I'm Mike - just a nickname of mine. I'm Vietnamese who really focus on arts, literature and some parts of computer science. I love reading stories, manga, watching films that resonate with my ideas, the vibe that I want to have :)
                            </Text>
                            <Ruler color='colorless' marginTop='sm' marginBottom='none'/>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                                <Text>
                                    This is the place where I can really give thoughts freely without being distracted, a place where I can upload my artworks personally as an archive place.
                                </Text>

                                <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                                <Text>
                                    I will frequently upload all the stuffs about analysis and personal thoughts in {' '}
                                    <Link href="/blog" className="text-purple-500 font-bold hover:underline">
                                        blog
                                    </Link>
                                    ; you can check it out if you're interested.
                                </Text>

                                <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                                <Text>
                                    You can read some of them if you want to! Here's some of my recommedation (I haven't uploaded anything yet so there isn't anything to recommend):
                                </Text>

                                <Ruler color='colorless' marginTop='md' marginBottom='none'/>

                                <List spacing='tight'>
                                    <ListItem>
                                        <Link href="/about" className="underline hover:text-purple-500">About me</Link>
                                    </ListItem>
                                    <ListItem>
                                        <Link href="/blog/my-2025-resolution" className="underline hover:text-purple-500">My personal line of thoughts about Chapter 67</Link>
                                    </ListItem>
                                    <ListItem>
                                        <Link href="/blog/getting-started-with-machine-learning" className="underline hover:text-purple-500">
                                           January, a month of new beginnings
                                        </Link>
                                    </ListItem>
                                </List>

                                <Ruler color='colorless' marginTop='lg' marginBottom='none'/>

                                <Text>
                                    I will also try to document my learnings through learning reflections every week. You can take a look at those{' '}
                                    <Link href="/learning/weekly-reflections" className="text-purple-500 font-bold hover:underline">
                                        here
                                    </Link>
                                    .
                                </Text>
                        </motion.div>
                    </motion.div>
                </StackVertical>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 -mb-8"
            >
                <div className="relative w-full aspect-[4/3] sm:aspect-[2/1] md:aspect-[21/9] rounded-lg overflow-hidden">
                    <Image
                        className="object-cover"
                        fill
                        src="/image-cover.png" 
                        alt="A drawing of Shima and Mitsumi, which I drew in January 2025."
                        priority
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                    />
                </div>
            </motion.div>
        </motion.div>
    )
} 
